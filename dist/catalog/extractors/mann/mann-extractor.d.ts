import { BaseExtractor, ExtractionResult } from '../base-extractor';
export declare class MannExtractor extends BaseExtractor {
    constructor(outputDirectory?: string);
    extract(): Promise<ExtractionResult>;
    private getCuratedMannProducts;
}
