import { BaseExtractor, ExtractionResult } from '../base-extractor';
export declare class NGKExtractor extends BaseExtractor {
    constructor(outputDirectory?: string);
    extract(): Promise<ExtractionResult>;
    private getCuratedNGKProducts;
}
