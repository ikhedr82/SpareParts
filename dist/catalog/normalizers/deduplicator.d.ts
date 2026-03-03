import { PrismaClient } from '@prisma/client';
interface PartNumberMatch {
    existingProductId?: string;
    confidence: 'exact' | 'alternate' | 'fuzzy' | 'none';
    matchedBy?: string;
}
export declare class ProductDeduplicator {
    private prisma;
    private readonly BRAND_AUTHORITY;
    constructor(prisma: PrismaClient);
    findExistingProduct(partNumber: string, brandName: string, alternatePartNumbers?: string[]): Promise<PartNumberMatch>;
    shouldReplaceExisting(newBrand: string, existingBrand: string): boolean;
    getBrandAuthority(brandName: string): number;
    normalizePartNumber(partNumber: string): string;
    calculateSimilarity(pn1: string, pn2: string): number;
    private levenshteinDistance;
}
export {};
