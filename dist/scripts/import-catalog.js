#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_service_1 = require("../prisma/prisma.service");
const translation_service_1 = require("../i18n/translation.service");
const plan_enforcement_service_1 = require("../tenant-admin/plan-enforcement.service");
const bosch_extractor_1 = require("../catalog/extractors/bosch/bosch-extractor");
const ngk_extractor_1 = require("../catalog/extractors/ngk/ngk-extractor");
const denso_extractor_1 = require("../catalog/extractors/denso/denso-extractor");
const brembo_extractor_1 = require("../catalog/extractors/brembo/brembo-extractor");
const mahle_extractor_1 = require("../catalog/extractors/mahle/mahle-extractor");
const mann_extractor_1 = require("../catalog/extractors/mann/mann-extractor");
const product_normalizer_1 = require("../catalog/normalizers/product-normalizer");
const product_importer_1 = require("../catalog/importers/product-importer");
const prisma = new prisma_service_1.PrismaService();
const translationService = new translation_service_1.TranslationService();
translationService.onModuleInit();
const planEnforcement = new plan_enforcement_service_1.PlanEnforcementService(prisma, translationService);
async function main() {
    var _a;
    const args = process.argv.slice(2);
    const manufacturer = (_a = args[0]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Automotive Catalog Import Tool');
    console.log('═══════════════════════════════════════════════════════\n');
    const normalizer = new product_normalizer_1.ProductNormalizer(prisma);
    const importer = new product_importer_1.ProductImporter(prisma, planEnforcement);
    const manufacturers = {
        bosch: {
            name: 'Bosch',
            extractor: new bosch_extractor_1.BoschExtractor(),
        },
        ngk: {
            name: 'NGK',
            extractor: new ngk_extractor_1.NGKExtractor(),
        },
        denso: {
            name: 'Denso',
            extractor: new denso_extractor_1.DensoExtractor(),
        },
        brembo: {
            name: 'Brembo',
            extractor: new brembo_extractor_1.BremboExtractor(),
        },
        mahle: {
            name: 'Mahle',
            extractor: new mahle_extractor_1.MahleExtractor(),
        },
        mann: {
            name: 'Mann-Filter',
            extractor: new mann_extractor_1.MannExtractor(),
        },
    };
    const toProcess = manufacturer
        ? [manufacturer]
        : Object.keys(manufacturers);
    let totalImported = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    for (const key of toProcess) {
        const mfg = manufacturers[key];
        if (!mfg) {
            console.error(`❌ Unknown manufacturer: ${key}`);
            console.error(`Available: ${Object.keys(manufacturers).join(', ')}`);
            process.exit(1);
        }
        console.log(`\n${'='.repeat(55)}`);
        console.log(`  Processing: ${mfg.name}`);
        console.log(`${'='.repeat(55)}\n`);
        try {
            console.log(`[1/3] Extracting ${mfg.name} data...`);
            const extractionResult = await mfg.extractor.extract();
            if (extractionResult.errors.length > 0) {
                console.warn(`⚠️  Extraction errors: ${extractionResult.errors.length}`);
                extractionResult.errors.forEach(err => console.warn(`    ${err}`));
            }
            console.log(`\n[2/3] Normalizing ${extractionResult.products.length} products...`);
            const normalizedProducts = [];
            for (const rawProduct of extractionResult.products) {
                try {
                    const normalized = await normalizer.normalize(rawProduct, mfg.name);
                    normalizedProducts.push(normalized);
                }
                catch (error) {
                    console.error(`  ✗ Failed to normalize ${rawProduct.partNumber}: ${error.message}`);
                }
            }
            console.log(`  ✓ Normalized ${normalizedProducts.length} products`);
            console.log(`\n[3/3] Importing to database...`);
            const importResult = await importer.importProducts('PLATFORM', normalizedProducts, mfg.name);
            totalImported += importResult.imported;
            totalSkipped += importResult.skipped;
            totalErrors += importResult.errors.length;
            if (importResult.errors.length > 0) {
                console.warn(`\n⚠️  Import errors for ${mfg.name}:`);
                importResult.errors.forEach(err => console.warn(`    ${err}`));
            }
        }
        catch (error) {
            console.error(`\n❌ Fatal error processing ${mfg.name}:`, error);
            totalErrors++;
        }
    }
    console.log(`\n${'='.repeat(55)}`);
    console.log('  Import Summary');
    console.log(`${'='.repeat(55)}`);
    console.log(`  ✓ Imported: ${totalImported} products`);
    console.log(`  ⊙ Skipped:  ${totalSkipped} duplicates`);
    if (totalErrors > 0) {
        console.log(`  ✗ Errors:   ${totalErrors}`);
    }
    console.log(`${'='.repeat(55)}\n`);
    console.log('Database Stats:');
    const productCount = await prisma.product.count();
    const fitmentCount = await prisma.productFitment.count();
    const altPartCount = await prisma.alternatePartNumber.count();
    const vehicleMakeCount = await prisma.vehicleMake.count();
    const vehicleModelCount = await prisma.vehicleModel.count();
    console.log(`  Products:          ${productCount}`);
    console.log(`  Vehicle Makes:     ${vehicleMakeCount}`);
    console.log(`  Vehicle Models:    ${vehicleModelCount}`);
    console.log(`  Fitments:          ${fitmentCount}`);
    console.log(`  Alternate PNs:     ${altPartCount}`);
    console.log('');
}
main()
    .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=import-catalog.js.map