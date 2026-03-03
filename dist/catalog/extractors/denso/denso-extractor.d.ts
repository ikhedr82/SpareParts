import { BaseExtractor, ExtractionResult } from '../base-extractor';
export declare class DensoExtractor extends BaseExtractor {
    constructor(outputDirectory?: string);
    extract(): Promise<ExtractionResult>;
    private getCuratedDensoProducts;
}
