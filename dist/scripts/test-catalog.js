#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  Catalog Engine - Test Queries');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Test 1: Search for Bosch Oil Filter "0 986 452 061"');
    console.log('─'.repeat(55));
    const oilFilter = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: '0 986 452 061', mode: 'insensitive' } },
                { alternateNumbers: { some: { partNumber: { contains: '0986452061' } } } },
            ],
        },
        include: {
            brand: true,
            category: true,
            alternateNumbers: true,
            fitments: {
                include: {
                    vehicleModel: {
                        include: {
                            make: true,
                        },
                    },
                },
            },
        },
    });
    if (oilFilter.length > 0) {
        const product = oilFilter[0];
        console.log(`✓ Found: ${product.name}`);
        console.log(`  Brand: ${product.brand.name}`);
        console.log(`  Category: ${product.category.name}`);
        console.log(`  Alternate Part Numbers: ${product.alternateNumbers.length}`);
        console.log(`  Fitments: ${product.fitments.length} vehicles`);
        if (product.fitments.length > 0) {
            console.log('\n  Sample Fitments:');
            product.fitments.slice(0, 3).forEach(f => {
                const year = f.vehicleModel.yearEnd
                    ? `${f.vehicleModel.yearStart}-${f.vehicleModel.yearEnd}`
                    : `${f.vehicleModel.yearStart}+`;
                console.log(`    • ${f.vehicleModel.make.name} ${f.vehicleModel.name} (${year})`);
            });
        }
    }
    else {
        console.log('✗ Product not found');
    }
    console.log('\n\nTest 2: Find parts for 2015 Honda Civic');
    console.log('─'.repeat(55));
    const civicParts = await prisma.product.findMany({
        where: {
            fitments: {
                some: {
                    vehicleModel: {
                        make: { name: 'Honda' },
                        name: { contains: 'Civic', mode: 'insensitive' },
                        yearStart: { lte: 2015 },
                        OR: [
                            { yearEnd: { gte: 2015 } },
                            { yearEnd: null },
                        ],
                    },
                },
            },
        },
        include: {
            brand: true,
            category: true,
            fitments: {
                include: {
                    vehicleModel: {
                        include: {
                            make: true,
                        },
                    },
                },
                where: {
                    vehicleModel: {
                        make: { name: 'Honda' },
                        name: { contains: 'Civic', mode: 'insensitive' },
                    },
                },
            },
        },
    });
    console.log(`✓ Found ${civicParts.length} compatible parts:\n`);
    civicParts.forEach((part, index) => {
        console.log(`  ${index + 1}. ${part.name}`);
        console.log(`     Category: ${part.category.name}`);
        console.log(`     Brand: ${part.brand.name}`);
    });
    console.log('\n\nTest 3: Find all NGK Spark Plugs');
    console.log('─'.repeat(55));
    const ngkPlugs = await prisma.product.findMany({
        where: {
            brand: { name: 'NGK' },
            category: { name: 'Spark Plugs' },
        },
        include: {
            brand: true,
            fitments: {
                include: {
                    vehicleModel: {
                        include: {
                            make: true,
                        },
                    },
                },
            },
        },
    });
    console.log(`✓ Found ${ngkPlugs.length} NGK spark plugs:\n`);
    ngkPlugs.forEach((plug, index) => {
        console.log(`  ${index + 1}. ${plug.name}`);
        console.log(`     Fits ${plug.fitments.length} vehicle models`);
    });
    console.log('\n\nTest 4: Database Statistics');
    console.log('─'.repeat(55));
    const stats = {
        totalProducts: await prisma.product.count(),
        totalBrands: await prisma.brand.count(),
        totalCategories: await prisma.productCategory.count(),
        vehicleMakes: await prisma.vehicleMake.count(),
        vehicleModels: await prisma.vehicleModel.count(),
        fitments: await prisma.productFitment.count(),
        alternatePartNumbers: await prisma.alternatePartNumber.count(),
        dataSources: await prisma.dataSource.count(),
    };
    console.log(`  Total Products:           ${stats.totalProducts}`);
    console.log(`  Brands:                   ${stats.totalBrands}`);
    console.log(`  Categories:               ${stats.totalCategories}`);
    console.log(`  Vehicle Makes:            ${stats.vehicleMakes}`);
    console.log(`  Vehicle Models:           ${stats.vehicleModels}`);
    console.log(`  Fitment Records:          ${stats.fitments}`);
    console.log(`  Alternate Part Numbers:   ${stats.alternatePartNumbers}`);
    console.log(`  Data Sources:             ${stats.dataSources}`);
    console.log('\n═══════════════════════════════════════════════════════\n');
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=test-catalog.js.map