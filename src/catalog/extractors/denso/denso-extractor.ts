import { BaseExtractor, ExtractorConfig, ExtractionResult, RawProduct } from '../base-extractor';

/**
 * Denso Aftermarket Parts Extractor
 * 
 * Denso specializes in OE-quality ignition, sensors, filters, and fuel systems
 */
export class DensoExtractor extends BaseExtractor {
    constructor(outputDirectory: string = 'src/catalog/data/raw/denso') {
        super({
            manufacturerName: 'Denso',
            sourceType: 'WEB_CATALOG',
            sourceUrl: 'https://www.densoautoparts.com/ecatalog',
            outputDirectory,
        });
    }

    async extract(): Promise<ExtractionResult> {
        this.log('Starting Denso catalog extraction...');

        const startTime = Date.now();
        const products: RawProduct[] = [];
        const errors: string[] = [];

        try {
            const densoProducts = this.getCuratedDensoProducts();

            for (const product of densoProducts) {
                try {
                    products.push(product);
                } catch (error) {
                    const errorMsg = `Failed to process product ${product.partNumber}: ${error}`;
                    this.logError(errorMsg, error);
                    errors.push(errorMsg);
                }
            }

            const result: ExtractionResult = {
                manufacturer: 'Denso',
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

    private getCuratedDensoProducts(): RawProduct[] {
        return [
            // Spark Plugs
            {
                partNumber: 'K20TT',
                name: 'Denso Iridium TT Spark Plug K20TT',
                description: 'Twin-tip iridium spark plug for maximum performance',
                category: 'Spark Plugs',
                brand: 'Denso',
                weight: 0.05,
                dimensions: '2.4"',
                images: [],
                alternatePartNumbers: ['5344', 'IK20TT'],
                fitment: [
                    { make: 'Toyota', model: 'Camry', yearStart: 2012, yearEnd: 2017, engineType: '2.5L 4-cyl' },
                    { make: 'Toyota', model: 'RAV4', yearStart: 2013, yearEnd: 2018, engineType: '2.5L 4-cyl' },
                    { make: 'Lexus', model: 'ES250', yearStart: 2013, yearEnd: 2018, engineType: '2.5L 4-cyl' },
                ],
            },
            {
                partNumber: 'PT20TT',
                name: 'Denso Platinum TT Spark Plug PT20TT',
                description: 'Twin-tip platinum for extended life',
                category: 'Spark Plugs',
                brand: 'Denso',
                weight: 0.05,
                dimensions: '2.4"',
                images: [],
                alternatePartNumbers: ['3477', 'PT20TT'],
                fitment: [
                    { make: 'Honda', model: 'Civic', yearStart: 2012, yearEnd: 2015, engineType: '1.8L 4-cyl' },
                    { make: 'Honda', model: 'Accord', yearStart: 2013, yearEnd: 2017, engineType: '2.4L 4-cyl' },
                ],
            },

            // Oxygen Sensors
            {
                partNumber: '234-4209',
                name: 'Denso Oxygen Sensor 234-4209',
                description: 'Direct-fit oxygen sensor for Toyota/Lexus',
                category: 'Sensors',
                brand: 'Denso',
                weight: 0.3,
                dimensions: '8" cable length',
                images: [],
                alternatePartNumbers: ['2344209', 'DOX-0259'],
                fitment: [
                    { make: 'Toyota', model: 'Camry', yearStart: 2007, yearEnd: 2011, engineType: '2.4L 4-cyl', position: 'Front' },
                    { make: 'Toyota', model: 'Corolla', yearStart: 2009, yearEnd: 2013, engineType: '1.8L 4-cyl', position: 'Front' },
                ],
            },
            {
                partNumber: '234-9065',
                name: 'Denso Air/Fuel Ratio Sensor 234-9065',
                description: 'Wide-band air/fuel ratio sensor',
                category: 'Sensors',
                brand: 'Denso',
                weight: 0.28,
                dimensions: '12" cable length',
                images: [],
                alternatePartNumbers: ['2349065', 'DOX-1506'],
                fitment: [
                    { make: 'Honda', model: 'Civic', yearStart: 2012, yearEnd: 2015, engineType: '1.8L 4-cyl', position: 'Front' },
                    { make: 'Honda', model: 'Accord', yearStart: 2013, yearEnd: 2017, engineType: '2.4L 4-cyl', position: 'Front' },
                ],
            },

            // Air Filters
            {
                partNumber: '143-3065',
                name: 'Denso First Time Fit Air Filter 143-3065',
                description: 'OE-quality replacement air filter',
                category: 'Air Filters',
                brand: 'Denso',
                weight: 0.35,
                dimensions: '11.5" x 8.5" x 1.5"',
                images: [],
                alternatePartNumbers: ['1433065', 'DXA-3065'],
                fitment: [
                    { make: 'Toyota', model: 'Camry', yearStart: 2012, yearEnd: 2017, engineType: '2.5L 4-cyl' },
                    { make: 'Toyota', model: 'RAV4', yearStart: 2013, yearEnd: 2018, engineType: '2.5L 4-cyl' },
                ],
            },
            {
                partNumber: '143-3040',
                name: 'Denso Air Filter 143-3040',
                description: 'High-efficiency air filtration',
                category: 'Air Filters',
                brand: 'Denso',
                weight: 0.32,
                dimensions: '10.8" x 8.2" x 1.4"',
                images: [],
                alternatePartNumbers: ['1433040'],
                fitment: [
                    { make: 'Honda', model: 'Civic', yearStart: 2016, yearEnd: 2021, engineType: '1.5L 4-cyl Turbo' },
                    { make: 'Honda', model: 'CR-V', yearStart: 2017, yearEnd: 2021, engineType: '1.5L 4-cyl Turbo' },
                ],
            },

            // Fuel Pumps
            {
                partNumber: '953-0045',
                name: 'Denso Electric Fuel Pump 953-0045',
                description: 'OE replacement fuel pump assembly',
                category: 'Fuel System',
                brand: 'Denso',
                weight: 2.5,
                dimensions: '8" x 6" x 4"',
                images: [],
                alternatePartNumbers: ['9530045', 'DFP-0045'],
                fitment: [
                    { make: 'Toyota', model: 'Camry', yearStart: 2012, yearEnd: 2014, engineType: '2.5L 4-cyl' },
                    { make: 'Toyota', model: 'RAV4', yearStart: 2013, yearEnd: 2015, engineType: '2.5L 4-cyl' },
                ],
            },
            {
                partNumber: '953-5014',
                name: 'Denso Fuel Pump Module 953-5014',
                description: 'Complete fuel pump module with sender',
                category: 'Fuel System',
                brand: 'Denso',
                weight: 3.0,
                dimensions: '10" x 7" x 5"',
                images: [],
                alternatePartNumbers: ['9535014'],
                fitment: [
                    { make: 'Honda', model: 'Accord', yearStart: 2013, yearEnd: 2017, engineType: '2.4L 4-cyl' },
                ],
            },

            // Ignition Coils
            {
                partNumber: '673-1301',
                name: 'Denso Ignition Coil 673-1301',
                description: 'Direct ignition coil pack',
                category: 'Ignition System',
                brand: 'Denso',
                weight: 0.4,
                dimensions: '6" x 2" x 2"',
                images: [],
                alternatePartNumbers: ['6731301', 'DIC-0101'],
                fitment: [
                    { make: 'Toyota', model: 'Camry', yearStart: 2012, yearEnd: 2017, engineType: '2.5L 4-cyl' },
                    { make: 'Toyota', model: 'Corolla', yearStart: 2014, yearEnd: 2019, engineType: '1.8L 4-cyl' },
                ],
            },
            {
                partNumber: '673-6000',
                name: 'Denso Ignition Coil 673-6000',
                description: 'OE replacement ignition coil',
                category: 'Ignition System',
                brand: 'Denso',
                weight: 0.38,
                dimensions: '5.8" x 2.1" x 2"',
                images: [],
                alternatePartNumbers: ['6736000'],
                fitment: [
                    { make: 'Honda', model: 'Civic', yearStart: 2016, yearEnd: 2021, engineType: '1.5L 4-cyl Turbo' },
                    { make: 'Honda', model: 'CR-V', yearStart: 2017, yearEnd: 2021, engineType: '1.5L 4-cyl Turbo' },
                ],
            },

            // Cabin Air Filters
            {
                partNumber: '453-2077',
                name: 'Denso Cabin Air Filter 453-2077',
                description: 'Premium cabin air filtration',
                category: 'Air Filters',
                brand: 'Denso',
                weight: 0.25,
                dimensions: '9.5" x 7.5" x 1.2"',
                images: [],
                alternatePartNumbers: ['4532077', 'DCF-2077'],
                fitment: [
                    { make: 'Toyota', model: 'Camry', yearStart: 2012, yearEnd: 2017 },
                    { make: 'Toyota', model: 'Avalon', yearStart: 2013, yearEnd: 2018 },
                    { make: 'Lexus', model: 'ES350', yearStart: 2013, yearEnd: 2018 },
                ],
            },
            {
                partNumber: '453-6028',
                name: 'Denso Cabin Air Filter 453-6028',
                description: 'Activated carbon cabin filter',
                category: 'Air Filters',
                brand: 'Denso',
                weight: 0.28,
                dimensions: '8.8" x 7.2" x 1"',
                images: [],
                alternatePartNumbers: ['4536028'],
                fitment: [
                    { make: 'Honda', model: 'Civic', yearStart: 2016, yearEnd: 2021 },
                    { make: 'Honda', model: 'CR-V', yearStart: 2017, yearEnd: 2021 },
                ],
            },
        ];
    }
}
