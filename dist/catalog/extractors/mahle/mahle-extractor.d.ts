import { BaseExtractor, ExtractionResult } from '../base-extractor';
export declare class MahleExtractor extends BaseExtractor {
    constructor(outputDirectory?: string);
    extract(): Promise<ExtractionResult>;
    private getCuratedMahleProducts;
}
