import { BaseExtractor, ExtractionResult } from '../base-extractor';
export declare class BoschExtractor extends BaseExtractor {
    constructor(outputDirectory?: string);
    extract(): Promise<ExtractionResult>;
    private getCuratedBoschProducts;
}
