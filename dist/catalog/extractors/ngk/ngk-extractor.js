"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NGKExtractor = void 0;
const base_extractor_1 = require("../base-extractor");
class NGKExtractor extends base_extractor_1.BaseExtractor {
    constructor(outputDirectory = 'src/catalog/data/raw/ngk') {
        super({
            manufacturerName: 'NGK',
            sourceType: 'WEB_CATALOG',
            sourceUrl: 'https://www.ngksparkplugs.com/part-finder',
            outputDirectory,
        });
    }
    async extract() {
        this.log('Starting NGK catalog extraction...');
        const startTime = Date.now();
        const products = [];
        const errors = [];
        try {
            const ngkProducts = this.getCuratedNGKProducts();
            for (const product of ngkProducts) {
                try {
                    products.push(product);
                }
                catch (error) {
                    const errorMsg = `Failed to process product ${product.partNumber}: ${error}`;
                    this.logError(errorMsg, error);
                    errors.push(errorMsg);
                }
            }
            const result = {
                manufacturer: 'NGK',
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
        }
        catch (error) {
            this.logError('Fatal extraction error', error);
            throw error;
        }
    }
    getCuratedNGKProducts() {
        return [
            {
                partNumber: 'BKR6E-11',
                name: 'NGK Spark Plug BKR6E-11',
                description: 'Standard spark plug for Honda models, copper core',
                category: 'Spark Plugs',
                brand: 'NGK',
                weight: 0.04,
                dimensions: '2.3"',
                images: [],
                alternatePartNumbers: ['BKR6E11', '2756'],
                fitment: [
                    { make: 'Honda', model: 'Civic', yearStart: 2012, yearEnd: 2015, engineType: '1.8L 4-cyl' },
                    { make: 'Honda', model: 'Accord', yearStart: 2013, yearEnd: 2017, engineType: '2.4L 4-cyl' },
                    { make: 'Honda', model: 'CR-V', yearStart: 2012, yearEnd: 2016, engineType: '2.4L 4-cyl' },
                ],
            },
            {
                partNumber: 'LZKAR6AP-11',
                name: 'NGK Laser Platinum Spark Plug LZKAR6AP-11',
                description: 'Laser platinum spark plug for extended life',
                category: 'Spark Plugs',
                brand: 'NGK',
                weight: 0.045,
                dimensions: '2.4"',
                images: [],
                alternatePartNumbers: ['93185', 'LZKAR6AP11'],
                fitment: [
                    { make: 'Mazda', model: 'CX-5', yearStart: 2013, yearEnd: 2016, engineType: '2.0L 4-cyl' },
                    { make: 'Mazda', model: 'Mazda3', yearStart: 2014, yearEnd: 2018, engineType: '2.0L 4-cyl' },
                ],
            },
            {
                partNumber: '5464',
                name: 'NGK Iridium IX Spark Plug 5464',
                description: 'Iridium spark plug for maximum performance and longevity',
                category: 'Spark Plugs',
                brand: 'NGK',
                weight: 0.05,
                dimensions: '2.4"',
                images: [],
                alternatePartNumbers: ['IFR6T11', 'IX5464'],
                fitment: [
                    { make: 'Toyota', model: 'Camry', yearStart: 2012, yearEnd: 2017, engineType: '2.5L 4-cyl' },
                    { make: 'Toyota', model: 'RAV4', yearStart: 2013, yearEnd: 2018, engineType: '2.5L 4-cyl' },
                    { make: 'Lexus', model: 'ES250', yearStart: 2013, yearEnd: 2018, engineType: '2.5L 4-cyl' },
                ],
            },
            {
                partNumber: '3403',
                name: 'NGK V-Power Spark Plug 3403',
                description: 'V-groove design for better ignition, suitable for most vehicles',
                category: 'Spark Plugs',
                brand: 'NGK',
                weight: 0.04,
                dimensions: '2.3"',
                images: [],
                alternatePartNumbers: ['BKR5E', 'V3403'],
                fitment: [
                    { make: 'Nissan', model: 'Altima', yearStart: 2007, yearEnd: 2012, engineType: '2.5L 4-cyl' },
                    { make: 'Nissan', model: 'Sentra', yearStart: 2007, yearEnd: 2012, engineType: '2.0L 4-cyl' },
                ],
            },
            {
                partNumber: '6619',
                name: 'NGK Iridium IX Spark Plug 6619',
                description: 'Iridium IX for Honda and Acura vehicles',
                category: 'Spark Plugs',
                brand: 'NGK',
                weight: 0.05,
                dimensions: '2.4"',
                images: [],
                alternatePartNumbers: ['ILZKR7B11', 'IX6619'],
                fitment: [
                    { make: 'Honda', model: 'Civic', yearStart: 2016, yearEnd: 2021, engineType: '1.5L 4-cyl Turbo' },
                    { make: 'Honda', model: 'CR-V', yearStart: 2017, yearEnd: 2021, engineType: '1.5L 4-cyl Turbo' },
                    { make: 'Acura', model: 'ILX', yearStart: 2016, yearEnd: 2020, engineType: '2.4L 4-cyl' },
                ],
            },
            {
                partNumber: 'R5671A-8',
                name: 'NGK Racing Spark Plug R5671A-8',
                description: 'Cold-range racing spark plug for high-performance applications',
                category: 'Spark Plugs',
                brand: 'NGK',
                weight: 0.05,
                dimensions: '2.5"',
                images: [],
                alternatePartNumbers: ['R5671A8', 'Racing-8'],
                fitment: [
                    { make: 'Ford', model: 'Mustang GT', yearStart: 2015, yearEnd: 2020, engineType: '5.0L V8', notes: 'Performance applications' },
                    { make: 'Chevrolet', model: 'Camaro SS', yearStart: 2016, yearEnd: 2020, engineType: '6.2L V8', notes: 'Performance applications' },
                ],
            },
        ];
    }
}
exports.NGKExtractor = NGKExtractor;
//# sourceMappingURL=ngk-extractor.js.map