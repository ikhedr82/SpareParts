/**
 * Base interface for all manufacturer data extractors
 */
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

/**
 * Abstract base class for all data extractors
 */
export abstract class BaseExtractor {
    protected config: ExtractorConfig;

    constructor(config: ExtractorConfig) {
        this.config = config;
    }

    /**
     * Main extraction method - must be implemented by each manufacturer extractor
     */
    abstract extract(): Promise<ExtractionResult>;

    /**
     * Save raw extraction data to JSON file
     */
    protected async saveRawData(result: ExtractionResult): Promise<string> {
        const fs = await import('fs/promises');
        const path = await import('path');

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${this.config.manufacturerName.toLowerCase()}_${timestamp}.json`;
        const filepath = path.join(this.config.outputDirectory, filename);

        await fs.mkdir(this.config.outputDirectory, { recursive: true });
        await fs.writeFile(filepath, JSON.stringify(result, null, 2), 'utf-8');

        return filepath;
    }

    /**
     * Log extraction progress
     */
    protected log(message: string): void {
        console.log(`[${this.config.manufacturerName}] ${message}`);
    }

    /**
     * Log
   extraction error
     */
    protected logError(message: string, error?: any): void {
        console.error(`[${this.config.manufacturerName}] ERROR: ${message}`, error);
    }
}
