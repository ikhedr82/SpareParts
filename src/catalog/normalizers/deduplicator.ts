import { PrismaClient } from '@prisma/client';

interface PartNumberMatch {
    existingProductId?: string;
    confidence: 'exact' | 'alternate' | 'fuzzy' | 'none';
    matchedBy?: string;
}

/**
 * Deduplicates products based on part number authority hierarchy
 */
export class ProductDeduplicator {
    private prisma: PrismaClient;

    // Authority hierarchy: higher number = higher authority
    private readonly BRAND_AUTHORITY: Record<string, number> = {
        // OEM Brands (highest authority)
        'Toyota': 100,
        'Honda': 100,
        'Ford': 100,
        'BMW': 100,
        'Mercedes-Benz': 100,
        'Nissan': 100,

        // Tier 1 Aftermarket
        'Bosch': 90,
        'Denso': 90,
        'Brembo': 90,

        // Tier 2 Aftermarket
        'NGK': 80,
        'ACDelco': 80,
        'Mahle': 75,
        'Mann': 75,

        // Default
        'default': 50,
    };

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * Check if a product already exists in the database
     */
    async findExistingProduct(
        partNumber: string,
        brandName: string,
        alternatePartNumbers: string[] = []
    ): Promise<PartNumberMatch> {
        // 1. Try exact part number match
        const exactMatch = await this.prisma.product.findFirst({
            where: {
                name: { contains: partNumber, mode: 'insensitive' },
                brand: { name: brandName },
            },
            select: { id: true },
        });

        if (exactMatch) {
            return {
                existingProductId: exactMatch.id,
                confidence: 'exact',
                matchedBy: 'primary part number',
            };
        }

        // 2. Try alternate part number match
        for (const altPN of alternatePartNumbers) {
            const altMatch = await this.prisma.alternatePartNumber.findFirst({
                where: {
                    partNumber: altPN,
                },
                select: { productId: true },
            });

            if (altMatch) {
                return {
                    existingProductId: altMatch.productId,
                    confidence: 'alternate',
                    matchedBy: `alternate part number: ${altPN}`,
                };
            }
        }

        // 3. Fuzzy match: same brand + similar part number (future enhancement)
        // For now, we'll consider it a new product

        return {
            confidence: 'none',
        };
    }

    /**
     * Determine which product should be kept based on brand authority
     */
    shouldReplaceExisting(newBrand: string, existingBrand: string): boolean {
        const newAuthority = this.BRAND_AUTHORITY[newBrand] || this.BRAND_AUTHORITY['default'];
        const existingAuthority = this.BRAND_AUTHORITY[existingBrand] || this.BRAND_AUTHORITY['default'];

        return newAuthority > existingAuthority;
    }

    /**
     * Get brand authority level
     */
    getBrandAuthority(brandName: string): number {
        return this.BRAND_AUTHORITY[brandName] || this.BRAND_AUTHORITY['default'];
    }

    /**
     * Normalize part number for comparison
     */
    normalizePartNumber(partNumber: string): string {
        return partNumber
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, ''); // Remove all non-alphanumeric
    }

    /**
     * Calculate similarity between two part numbers (0-100)
     */
    calculateSimilarity(pn1: string, pn2: string): number {
        const normalized1 = this.normalizePartNumber(pn1);
        const normalized2 = this.normalizePartNumber(pn2);

        if (normalized1 === normalized2) {
            return 100;
        }

        // Levenshtein distance-based similarity
        const maxLen = Math.max(normalized1.length, normalized2.length);
        if (maxLen === 0) return 100;

        const distance = this.levenshteinDistance(normalized1, normalized2);
        return Math.round(((maxLen - distance) / maxLen) * 100);
    }

    /**
     * Levenshtein distance calculation
     */
    private levenshteinDistance(str1: string, str2: string): number {
        const matrix: number[][] = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }
}
