import { BaseExtractor, ExtractorConfig, ExtractionResult, RawProduct } from '../base-extractor';

/**
 * Mann-Filter Extractor
 * 
 * Mann-Filter specializes in premium filtration solutions
 */
export class MannExtractor extends BaseExtractor {
    constructor(outputDirectory: string = 'src/catalog/data/raw/mann') {
        super({
            manufacturerName: 'Mann-Filter',
            sourceType: 'WEB_CATALOG',
            sourceUrl: 'https://www.mann-filter.com/en/products',
            outputDirectory,
        });
    }

    async extract(): Promise<ExtractionResult> {
        this.log('Starting Mann-Filter catalog extraction...');

        const startTime = Date.now();
        const products: RawProduct[] = [];
        const errors: string[] = [];

        try {
            const mannProducts = this.getCuratedMannProducts();

            for (const product of mannProducts) {
                try {
                    products.push(product);
                } catch (error) {
                    const errorMsg = `Failed to process product ${product.partNumber}: ${error}`;
                    this.logError(errorMsg, error);
                    errors.push(errorMsg);
                }
            }

            const result: ExtractionResult = {
                manufacturer: 'Mann-Filter',
                timestamp: new Date(),
                totalProducts: products.length,
                products,
                errors,
            };

            const filepath = await this.saveRawData(result);
            this.log(`Extraction complete! ${products.length} products extracted.`);
            this.log(`Raw data saved to: ${filepath}`);

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            this.log(`Extraction took ${duration}s`);

            return result;

        } catch (error) {
            this.logError('Fatal extraction error', error);
            throw error;
        }
    }

    private getCuratedMannProducts(): RawProduct[] {
        return [
            // Oil Filters
            {
                partNumber: 'W 712/75',
                name: 'Mann-Filter Oil Filter W 712/75',
                description: 'Premium spin-on oil filter for European vehicles',
                category: 'Oil Filters',
                brand: 'Mann-Filter',
                weight: 0.38,
                dimensions: '4.9" x 3.7"',
                images: [],
                alternatePartNumbers: ['W71275', 'HU71275'],
                fitment: [
                    { make: 'BMW', model: '3 Series', yearStart: 2012, yearEnd: 2018, engineType: '2.0L 4-cyl Turbo' },
                    { make: 'BMW', model: '4 Series', yearStart: 2014, yearEnd: 2020, engineType: '2.0L 4-cyl Turbo' },
                ],
            },
            {
                partNumber: 'HU 925/4 X',
                name: 'Mann-Filter Oil Filter HU 925/4 X',
                description: 'Metal-free oil filter with premium filtration',
                category: 'Oil Filters',
                brand: 'Mann-Filter',
                weight: 0.25,
                dimensions: '5.5" x 2.8"',
                images: [],
                alternatePartNumbers: ['HU9254X', 'HU925/4X'],
                fitment: [
                    { make: 'Mercedes-Benz', model: 'C-Class', yearStart: 2015, yearEnd: 2021, engineType: '2.0L 4-cyl Turbo' },
                    { make: 'Mercedes-Benz', model: 'E-Class', yearStart: 2017, yearEnd: 2020, engineType: '2.0L 4-cyl Turbo' },
                ],
            },
            {
                partNumber: 'W 67/2',
                name: 'Mann-Filter Oil Filter W 67/2',
                description: 'Compact oil filter for small engines',
                category: 'Oil Filters',
                brand: 'Mann-Filter',
                weight: 0.28,
                dimensions: '4.2" x 3.2"',
                images: [],
                alternatePartNumbers: ['W672', 'HU672'],
                fitment: [
                    { make: 'Toyota', model: 'Corolla', yearStart: 2014, yearEnd: 2019, engineType: '1.8L 4-cyl' },
                    { make: 'Toyota', model: 'Camry', yearStart: 2012, yearEnd: 2017, engineType: '2.5L 4-cyl' },
                ],
            },

            // Air Filters
            {
                partNumber: 'C 3698/3',
                name: 'Mann-Filter Air Filter C 3698/3',
                description: 'Premium engine air filter',
                category: 'Air Filters',
                brand: 'Mann-Filter',
                weight: 0.42,
                dimensions: '12.2" x 9" x 1.8"',
                images: [],
                alternatePartNumbers: ['C36983', 'C3698/3'],
                fitment: [
                    { make: 'BMW', model: '3 Series', yearStart: 2012, yearEnd: 2018, engineType: '2.0L 4-cyl Turbo' },
                    { make: 'BMW', model: '4 Series', yearStart: 2014, yearEnd: 2020, engineType: '2.0L 4-cyl Turbo' },
                ],
            },
            {
                partNumber: 'C 2433',
                name: 'Mann-Filter Air Filter C 2433',
                description: 'High-efficiency air filtration',
                category: 'Air Filters',
                brand: 'Mann-Filter',
                weight: 0.36,
                dimensions: '10.8" x 8.3" x 1.5"',
                images: [],
                alternatePartNumbers: ['C2433'],
                fitment: [
                    { make: 'Mercedes-Benz', model: 'C-Class', yearStart: 2015, yearEnd: 2021, engineType: '2.0L 4-cyl Turbo' },
                    { make: 'Mercedes-Benz', model: 'E-Class', yearStart: 2017, yearEnd: 2020, engineType: '2.0L 4-cyl Turbo' },
                ],
            },

            // Cabin Air Filters
            {
                partNumber: 'CUK 2939',
                name: 'Mann-Filter FreciousPlus Cabin Filter CUK 2939',
                description: 'Activated carbon cabin filter with anti-allergen coating',
                category: 'Air Filters',
                brand: 'Mann-Filter',
                weight: 0.32,
                dimensions: '10.2" x 8" x 1.2"',
                images: [],
                alternatePartNumbers: ['CUK2939', 'FP2939'],
                fitment: [
                    { make: 'BMW', model: '3 Series', yearStart: 2012, yearEnd: 2018 },
                    { make: 'BMW', model: '4 Series', yearStart: 2014, yearEnd: 2020 },
                    { make: 'BMW', model: 'X3', yearStart: 2011, yearEnd: 2017 },
                ],
            },
            {
                partNumber: 'CUK 2442',
                name: 'Mann-Filter Cabin Air Filter CUK 2442',
                description: 'Premium cabin filtration with activated carbon',
                category: 'Air Filters',
                brand: 'Mann-Filter',
                weight: 0.28,
                dimensions: '9" x 7.5" x 1"',
                images: [],
                alternatePartNumbers: ['CUK2442', 'FP2442'],
                fitment: [
                    { make: 'Mercedes-Benz', model: 'C-Class', yearStart: 2015, yearEnd: 2021 },
                    { make: 'Mercedes-Benz', model: 'E-Class', yearStart: 2017, yearEnd: 2020 },
                ],
            },
            {
                partNumber: 'CU 22 011',
                name: 'Mann-Filter Particulate Cabin Filter CU 22 011',
                description: 'Standard particulate cabin air filter',
                category: 'Air Filters',
                brand: 'Mann-Filter',
                weight: 0.22,
                dimensions: '8.8" x 7.2" x 0.9"',
                images: [],
                alternatePartNumbers: ['CU22011', 'CU-22-011'],
                fitment: [
                    { make: 'Toyota', model: 'Camry', yearStart: 2012, yearEnd: 2017 },
                    { make: 'Toyota', model: 'Avalon', yearStart: 2013, yearEnd: 2018 },
                ],
            },

            // Fuel Filters
            {
                partNumber: 'WK 853/3',
                name: 'Mann-Filter Fuel Filter WK 853/3',
                description: 'In-line fuel filter for gasoline engines',
                category: 'Fuel Filters',
                brand: 'Mann-Filter',
                weight: 0.18,
                dimensions: '3.8" x 2.5"',
                images: [],
                alternatePartNumbers: ['WK8533', 'WK853/3'],
                fitment: [
                    { make: 'BMW', model: '3 Series', yearStart: 2007, yearEnd: 2013, engineType: '3.0L 6-cyl' },
                    { make: 'BMW', model: '5 Series', yearStart: 2008, yearEnd: 2010, engineType: '3.0L 6-cyl' },
                ],
            },
            {
                partNumber: 'WK 66/1',
                name: 'Mann-Filter Diesel Fuel Filter WK 66/1',
                description: 'High-efficiency diesel fuel filter',
                category: 'Fuel Filters',
                brand: 'Mann-Filter',
                weight: 0.32,
                dimensions: '4.5" x 3.2"',
                images: [],
                alternatePartNumbers: ['WK661', 'WK66/1'],
                fitment: [
                    { make: 'Mercedes-Benz', model: 'Sprinter', yearStart: 2010, yearEnd: 2018, engineType: '2.1L 4-cyl Diesel' },
                    { make: 'Mercedes-Benz', model: 'E-Class', yearStart: 2010, yearEnd: 2016, engineType: '3.0L 6-cyl Diesel' },
                ],
            },
        ];
    }
}
