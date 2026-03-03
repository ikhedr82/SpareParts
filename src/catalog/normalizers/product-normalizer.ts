import { PrismaClient } from '@prisma/client';
import { RawProduct, RawFitment } from '../extractors/base-extractor';

/**
 * Normalized product ready for database import
 */
export interface NormalizedProduct {
    partNumber: string;
    name: string;
    description?: string;
    brandName: string;
    categoryName: string;
    weight?: number;
    dimensions?: string;
    unitOfMeasure: string;
    images: string[];
    alternatePartNumbers: string[];
    fitments: NormalizedFitment[];
    rawData: any;
}

export interface NormalizedFitment {
    make: string;
    model: string;
    yearStart: number;
    yearEnd?: number;
    engineType?: string;
    position?: string;
    notes?: string;
}

/**
 * Normalizes raw manufacturer data into our standard format
 */
export class ProductNormalizer {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * Normalize a single raw product
     */
    async normalize(raw: RawProduct, manufacturerName: string): Promise<NormalizedProduct> {
        return {
            partNumber: this.normalizePartNumber(raw.partNumber),
            name: this.generateProductName(raw),
            description: raw.description?.trim() || undefined,
            brandName: raw.brand || manufacturerName,
            categoryName: raw.category || 'Engine Parts',
            weight: raw.weight,
            dimensions: raw.dimensions?.trim() || undefined,
            unitOfMeasure: this.detectUnitOfMeasure(raw),
            images: raw.images || [],
            alternatePartNumbers: this.normalizeAlternatePartNumbers(raw.alternatePartNumbers || []),
            fitments: this.normalizeFitments(raw.fitment || []),
            rawData: raw,
        };
    }

    /**
     * Normalize part number (remove spaces, special chars, uppercase)
     */
    private normalizePartNumber(partNumber: string): string {
        return partNumber
            .trim()
            .toUpperCase()
            .replace(/\s+/g, ' '); // Normalize spaces but keep them for readability
    }

    /**
     * Generate a standardized product name
     */
    private generateProductName(raw: RawProduct): string {
        if (raw.name) {
            return raw.name.trim();
        }

        // Generate name from brand + part number
        return `${raw.brand} ${raw.partNumber}`.trim();
    }

    /**
     * Detect unit of measure from product data
     */
    private detectUnitOfMeasure(raw: RawProduct): string {
        const name = raw.name?.toLowerCase() || '';
        const desc = raw.description?.toLowerCase() || '';
        const combined = `${name} ${desc}`.toLowerCase();

        if (combined.includes('pair') || combined.includes(' pr ')) {
            return 'PR';
        }
        if (combined.includes('set') || combined.includes('kit')) {
            return 'SET';
        }
        if (combined.includes('liter') || combined.includes('quart') || combined.includes(' l ')) {
            return 'LT';
        }
        if (combined.includes('kg') || combined.includes('kilogram')) {
            return 'KG';
        }

        return 'EA'; // Default to each
    }

    /**
     * Normalize alternate part numbers
     */
    private normalizeAlternatePartNumbers(alternates: string[]): string[] {
        return alternates
            .map(pn => this.normalizePartNumber(pn))
            .filter(pn => pn.length > 0);
    }

    /**
     * Normalize fitment data
     */
    private normalizeFitments(fitments: RawFitment[]): NormalizedFitment[] {
        return fitments.map(f => ({
            make: this.normalizeMakeName(f.make),
            model: f.model.trim(),
            yearStart: f.yearStart,
            yearEnd: f.yearEnd,
            engineType: f.engineType?.trim() || undefined,
            position: f.position?.toUpperCase() || undefined,
            notes: f.notes?.trim() || undefined,
        }));
    }

    /**
     * Normalize vehicle make names
     */
    private normalizeMakeName(make: string): string {
        const normalized = make.trim();

        // Common variations
        const makeMap: Record<string, string> = {
            'CHEVROLET': 'Chevrolet',
            'CHEVY': 'Chevrolet',
            'TOYOTA': 'Toyota',
            'HONDA': 'Honda',
            'FORD': 'Ford',
            'NISSAN': 'Nissan',
            'BMW': 'BMW',
            'MERCEDES': 'Mercedes-Benz',
            'MERCEDES-BENZ': 'Mercedes-Benz',
            'VW': 'Volkswagen',
            'VOLKSWAGEN': 'Volkswagen',
        };

        return makeMap[normalized.toUpperCase()] || normalized;
    }
}
