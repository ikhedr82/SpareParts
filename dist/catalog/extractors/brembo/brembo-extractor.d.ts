import { BaseExtractor, ExtractionResult } from '../base-extractor';
export declare class BremboExtractor extends BaseExtractor {
    constructor(outputDirectory?: string);
    extract(): Promise<ExtractionResult>;
    private getCuratedBremboProducts;
}
