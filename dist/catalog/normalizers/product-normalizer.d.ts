import { PrismaClient } from '@prisma/client';
import { RawProduct } from '../extractors/base-extractor';
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
export declare class ProductNormalizer {
    private prisma;
    constructor(prisma: PrismaClient);
    normalize(raw: RawProduct, manufacturerName: string): Promise<NormalizedProduct>;
    private normalizePartNumber;
    private generateProductName;
    private detectUnitOfMeasure;
    private normalizeAlternatePartNumbers;
    private normalizeFitments;
    private normalizeMakeName;
}
