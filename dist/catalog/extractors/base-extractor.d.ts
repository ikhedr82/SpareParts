export interface ExtractorConfig {
    manufacturerName: string;
    sourceType: 'PDF' | 'WEB_CATALOG' | 'API';
    sourceUrl?: string;
    outputDirectory: string;
}
export interface RawProduct {
    partNumber: string;
    name: string;
    description?: string;
    category?: string;
    brand: string;
    weight?: number;
    dimensions?: string;
    images?: string[];
    alternatePartNumbers?: string[];
    fitment?: RawFitment[];
    specs?: Record<string, any>;
}
export interface RawFitment {
    make: string;
    model: string;
    yearStart: number;
    yearEnd?: number;
    engineType?: string;
    position?: string;
    notes?: string;
}
export interface ExtractionResult {
    manufacturer: string;
    timestamp: Date;
    totalProducts: number;
    products: RawProduct[];
    errors: string[];
}
export declare abstract class BaseExtractor {
    protected config: ExtractorConfig;
    constructor(config: ExtractorConfig);
    abstract extract(): Promise<ExtractionResult>;
    protected saveRawData(result: ExtractionResult): Promise<string>;
    protected log(message: string): void;
    protected logError(message: string, error?: any): void;
}
