import { BaseExtractor, ExtractorConfig, ExtractionResult, RawProduct } from '../base-extractor';

/**
 * Brembo Brake Systems Extractor
 * 
 * Brembo specializes in high-performance braking systems
 */
export class BremboExtractor extends BaseExtractor {
    constructor(outputDirectory: string = 'src/catalog/data/raw/brembo') {
        super({
            manufacturerName: 'Brembo',
            sourceType: 'WEB_CATALOG',
            sourceUrl: 'https://www.brembo.com/en/parts',
            outputDirectory,
        });
    }

    async extract(): Promise<ExtractionResult> {
        this.log('Starting Brembo catalog extraction...');

        const startTime = Date.now();
        const products: RawProduct[] = [];
        const errors: string[] = [];

        try {
            const bremboProducts = this.getCuratedBremboProducts();

            for (const product of bremboProducts) {
                try {
                    products.push(product);
                } catch (error) {
                    const errorMsg = `Failed to process product ${product.partNumber}: ${error}`;
                    this.logError(errorMsg, error);
                    errors.push(errorMsg);
                }
            }

            const result: ExtractionResult = {
                manufacturer: 'Brembo',
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

    private getCuratedBremboProducts(): RawProduct[] {
        return [
            // Brake Pads
            {
                partNumber: 'P83047',
                name: 'Brembo Premium Ceramic Brake Pads P83047',
                description: 'Low-dust ceramic brake pads for European vehicles',
                category: 'Brake Pads',
                brand: 'Brembo',
                weight: 2.8,
                dimensions: '6.5" x 4.2" x 1"',
                images: [],
                alternatePartNumbers: ['P-83-047', 'BRP83047'],
                fitment: [
                    { make: 'BMW', model: '3 Series', yearStart: 2012, yearEnd: 2018, position: 'Front' },
                    { make: 'BMW', model: '4 Series', yearStart: 2014, yearEnd: 2020, position: 'Front' },
                ],
            },
            {
                partNumber: 'P06052',
                name: 'Brembo Brake Pads P06052',
                description: 'OE replacement brake pads',
                category: 'Brake Pads',
                brand: 'Brembo',
                weight: 2.5,
                dimensions: '6.2" x 4" x 0.9"',
                images: [],
                alternatePartNumbers: ['P-06-052'],
                fitment: [
                    { make: 'Mercedes-Benz', model: 'C-Class', yearStart: 2015, yearEnd: 2021, position: 'Front' },
                    { make: 'Mercedes-Benz', model: 'E-Class', yearStart: 2017, yearEnd: 2020, position: 'Front' },
                ],
            },
            {
                partNumber: 'P85020',
                name: 'Brembo Sport Brake Pads P85020',
                description: 'High-performance brake pads for spirited driving',
                category: 'Brake Pads',
                brand: 'Brembo',
                weight: 3.0,
                dimensions: '7" x 4.5" x 1.1"',
                images: [],
                alternatePartNumbers: ['P-85-020', 'BRS85020'],
                fitment: [
                    { make: 'Audi', model: 'A4', yearStart: 2013, yearEnd: 2020, position: 'Front' },
                    { make: 'Audi', model: 'A6', yearStart: 2012, yearEnd: 2018, position: 'Front' },
                ],
            },
            {
                partNumber: 'P50084',
                name: 'Brembo Rear Brake Pads P50084',
                description: 'Premium rear brake pads',
                category: 'Brake Pads',
                brand: 'Brembo',
                weight: 1.8,
                dimensions: '4.5" x 3.5" x 0.8"',
                images: [],
                alternatePartNumbers: ['P-50-084'],
                fitment: [
                    { make: 'BMW', model: '3 Series', yearStart: 2012, yearEnd: 2018, position: 'Rear' },
                    { make: 'BMW', model: '4 Series', yearStart: 2014, yearEnd: 2020, position: 'Rear' },
                ],
            },

            // Brake Discs (Rotors)
            {
                partNumber: '09.9145.11',
                name: 'Brembo UV Coated Brake Disc 09.9145.11',
                description: 'UV-coated brake rotor for rust prevention',
                category: 'Brake Discs',
                brand: 'Brembo',
                weight: 18.5,
                dimensions: '13.6" diameter x 1.1" thick',
                images: [],
                alternatePartNumbers: ['09914511', 'BR-914511'],
                fitment: [
                    { make: 'BMW', model: '3 Series', yearStart: 2012, yearEnd: 2018, position: 'Front' },
                    { make: 'BMW', model: '4 Series', yearStart: 2014, yearEnd: 2020, position: 'Front' },
                ],
            },
            {
                partNumber: '09.A747.11',
                name: 'Brembo Xtra Drilled Brake Disc 09.A747.11',
                description: 'Cross-drilled performance brake rotor',
                category: 'Brake Discs',
                brand: 'Brembo',
                weight: 20.0,
                dimensions: '14.2" diameter x 1.2" thick',
                images: [],
                alternatePartNumbers: ['09A74711', 'XTR-A74711'],
                fitment: [
                    { make: 'Audi', model: 'A4', yearStart: 2013, yearEnd: 2020, position: 'Front' },
                    { make: 'Audi', model: 'S4', yearStart: 2013, yearEnd: 2017, position: 'Front' },
                ],
            },
            {
                partNumber: '08.A417.11',
                name: 'Brembo Rear Brake Disc 08.A417.11',
                description: 'Solid rear brake rotor',
                category: 'Brake Discs',
                brand: 'Brembo',
                weight: 12.5,
                dimensions: '12.6" diameter x 0.9" thick',
                images: [],
                alternatePartNumbers: ['08A41711'],
                fitment: [
                    { make: 'Mercedes-Benz', model: 'C-Class', yearStart: 2015, yearEnd: 2021, position: 'Rear' },
                    { make: 'Mercedes-Benz', model: 'E-Class', yearStart: 2017, yearEnd: 2020, position: 'Rear' },
                ],
            },

            // Brake Fluid
            {
                partNumber: 'L04010',
                name: 'Brembo DOT 4 LV Brake Fluid',
                description: 'Low viscosity DOT 4 brake fluid for modern vehicles',
                category: 'Brake Fluid',
                brand: 'Brembo',
                weight: 1.1,
                dimensions: '500ml bottle',
                images: [],
                alternatePartNumbers: ['BF-L04010', 'DOT4-LV'],
                fitment: [
                    { make: 'BMW', model: '3 Series', yearStart: 2012, yearEnd: 2021 },
                    { make: 'BMW', model: '4 Series', yearStart: 2014, yearEnd: 2021 },
                    { make: 'BMW', model: '5 Series', yearStart: 2012, yearEnd: 2021 },
                    { make: 'Audi', model: 'A4', yearStart: 2013, yearEnd: 2021 },
                    { make: 'Mercedes-Benz', model: 'C-Class', yearStart: 2015, yearEnd: 2021 },
                ],
            },
        ];
    }
}
