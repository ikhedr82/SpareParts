#!/usr/bin/env ts-node

/**
 * Import Manufacturer Catalog Data
 * 
 * This script extracts manufacturer data and imports it into the database
 * 
 * Usage:
 *   npm run import-catalog           Import all manufacturers
 *   npm run import-catalog -- bosch  Import only Bosch
 *   npm run import-catalog -- ngk    Import only NGK
 */

import { PrismaService } from '../prisma/prisma.service';
import { TranslationService } from '../i18n/translation.service';
import { PlanEnforcementService } from '../tenant-admin/plan-enforcement.service';
import { BoschExtractor } from '../catalog/extractors/bosch/bosch-extractor';
import { NGKExtractor } from '../catalog/extractors/ngk/ngk-extractor';
import { DensoExtractor } from '../catalog/extractors/denso/denso-extractor';
import { BremboExtractor } from '../catalog/extractors/brembo/brembo-extractor';
import { MahleExtractor } from '../catalog/extractors/mahle/mahle-extractor';
import { MannExtractor } from '../catalog/extractors/mann/mann-extractor';
import { ProductNormalizer } from '../catalog/normalizers/product-normalizer';
import { ProductImporter } from '../catalog/importers/product-importer';

const prisma = new PrismaService();
const translationService = new TranslationService();
(translationService as any).onModuleInit();
const planEnforcement = new PlanEnforcementService(prisma, translationService);

async function main() {
    const args = process.argv.slice(2);
    const manufacturer = args[0]?.toLowerCase();

    console.log('═══════════════════════════════════════════════════════');
    console.log('  Automotive Catalog Import Tool');
    console.log('═══════════════════════════════════════════════════════\n');

    const normalizer = new ProductNormalizer(prisma);
    const importer = new ProductImporter(prisma, planEnforcement);

    const manufacturers = {
        bosch: {
            name: 'Bosch',
            extractor: new BoschExtractor(),
        },
        ngk: {
            name: 'NGK',
            extractor: new NGKExtractor(),
        },
        denso: {
            name: 'Denso',
            extractor: new DensoExtractor(),
        },
        brembo: {
            name: 'Brembo',
            extractor: new BremboExtractor(),
        },
        mahle: {
            name: 'Mahle',
            extractor: new MahleExtractor(),
        },
        mann: {
            name: 'Mann-Filter',
            extractor: new MannExtractor(),
        },
    };

    // Determine which manufacturers to process
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
            // Step 1: Extract raw data
            console.log(`[1/3] Extracting ${mfg.name} data...`);
            const extractionResult = await mfg.extractor.extract();

            if (extractionResult.errors.length > 0) {
                console.warn(`⚠️  Extraction errors: ${extractionResult.errors.length}`);
                extractionResult.errors.forEach(err => console.warn(`    ${err}`));
            }

            // Step 2: Normalize products
            console.log(`\n[2/3] Normalizing ${extractionResult.products.length} products...`);
            const normalizedProducts = [];

            for (const rawProduct of extractionResult.products) {
                try {
                    const normalized = await normalizer.normalize(rawProduct, mfg.name);
                    normalizedProducts.push(normalized);
                } catch (error) {
                    console.error(`  ✗ Failed to normalize ${rawProduct.partNumber}: ${error.message}`);
                }
            }

            console.log(`  ✓ Normalized ${normalizedProducts.length} products`);

            // Step 3: Import to database
            console.log(`\n[3/3] Importing to database...`);
            const importResult = await importer.importProducts('PLATFORM', normalizedProducts, mfg.name);

            totalImported += importResult.imported;
            totalSkipped += importResult.skipped;
            totalErrors += importResult.errors.length;

            if (importResult.errors.length > 0) {
                console.warn(`\n⚠️  Import errors for ${mfg.name}:`);
                importResult.errors.forEach(err => console.warn(`    ${err}`));
            }

        } catch (error) {
            console.error(`\n❌ Fatal error processing ${mfg.name}:`, error);
            totalErrors++;
        }
    }

    // Summary
    console.log(`\n${'='.repeat(55)}`);
    console.log('  Import Summary');
    console.log(`${'='.repeat(55)}`);
    console.log(`  ✓ Imported: ${totalImported} products`);
    console.log(`  ⊙ Skipped:  ${totalSkipped} duplicates`);
    if (totalErrors > 0) {
        console.log(`  ✗ Errors:   ${totalErrors}`);
    }
    console.log(`${'='.repeat(55)}\n`);

    // Query some stats
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
