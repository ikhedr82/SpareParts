"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductImporter = void 0;
const deduplicator_1 = require("../normalizers/deduplicator");
const category_mapper_1 = require("../normalizers/category-mapper");
class ProductImporter {
    constructor(prisma, planEnforcement) {
        this.prisma = prisma;
        this.deduplicator = new deduplicator_1.ProductDeduplicator(prisma);
        this.planEnforcement = planEnforcement;
    }
    async importProducts(tenantId, products, dataSourceName) {
        let imported = 0;
        let skipped = 0;
        let updated = 0;
        const errors = [];
        console.log(`Starting import of ${products.length} products from ${dataSourceName}...`);
        const dataSource = await this.getOrCreateDataSource(dataSourceName);
        for (const product of products) {
            try {
                const match = await this.deduplicator.findExistingProduct(product.partNumber, product.brandName, product.alternatePartNumbers);
                if (match.confidence === 'exact' || match.confidence === 'alternate') {
                    console.log(`  ⊙ Skipping duplicate: ${product.partNumber} (matched by ${match.matchedBy})`);
                    skipped++;
                    continue;
                }
                const brand = await this.getOrCreateBrand(product.brandName);
                const mappedCategoryName = (0, category_mapper_1.mapCategory)(product.categoryName);
                const category = await (0, category_mapper_1.getOrCreateCategory)(this.prisma, mappedCategoryName);
                await this.planEnforcement.checkProductLimit(tenantId);
                const createdProduct = await this.prisma.product.create({
                    data: {
                        name: product.name,
                        description: product.description,
                        brandId: brand.id,
                        categoryId: category.id,
                        weight: product.weight,
                        dimensions: product.dimensions,
                        unitOfMeasure: product.unitOfMeasure,
                        images: product.images,
                        status: 'ACTIVE',
                    },
                });
                if (product.alternatePartNumbers.length > 0) {
                    await this.createAlternatePartNumbers(createdProduct.id, product.alternatePartNumbers, product.brandName);
                }
                if (product.fitments.length > 0) {
                    await this.createFitments(createdProduct.id, product.fitments);
                }
                await this.prisma.productSource.create({
                    data: {
                        productId: createdProduct.id,
                        dataSourceId: dataSource.id,
                        externalId: product.partNumber,
                        rawData: product.rawData,
                    },
                });
                console.log(`  ✓ Imported: ${product.name}`);
                imported++;
            }
            catch (error) {
                const errorMsg = `Failed to import ${product.partNumber}: ${error.message}`;
                console.error(`  ✗ ${errorMsg}`);
                errors.push(errorMsg);
            }
        }
        console.log(`\nImport complete!`);
        console.log(`  ✓ Imported: ${imported}`);
        console.log(`  ⊙ Skipped (duplicates): ${skipped}`);
        console.log(`  ↻ Updated: ${updated}`);
        if (errors.length > 0) {
            console.log(`  ✗ Errors: ${errors.length}`);
        }
        return { imported, skipped, updated, errors };
    }
    async getOrCreateBrand(brandName) {
        let brand = await this.prisma.brand.findUnique({
            where: { name: brandName },
            select: { id: true },
        });
        if (!brand) {
            brand = await this.prisma.brand.create({
                data: {
                    name: brandName,
                    isOem: false,
                },
                select: { id: true },
            });
        }
        return brand;
    }
    async getOrCreateDataSource(sourceName) {
        let source = await this.prisma.dataSource.findUnique({
            where: { name: sourceName },
            select: { id: true },
        });
        if (!source) {
            source = await this.prisma.dataSource.create({
                data: {
                    name: sourceName,
                    type: 'WEB_CATALOG',
                    isActive: true,
                },
                select: { id: true },
            });
        }
        return source;
    }
    async createAlternatePartNumbers(productId, partNumbers, manufacturer) {
        var _a;
        for (const partNumber of partNumbers) {
            try {
                await this.prisma.alternatePartNumber.create({
                    data: {
                        productId,
                        partNumber,
                        manufacturer,
                    },
                });
            }
            catch (error) {
                if (!((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('Unique constraint'))) {
                    console.warn(`    Warning: Could not create alternate part number ${partNumber}: ${error.message}`);
                }
            }
        }
    }
    async createFitments(productId, fitments) {
        var _a;
        for (const fitment of fitments) {
            try {
                const make = await this.getOrCreateVehicleMake(fitment.make);
                const model = await this.getOrCreateVehicleModel({
                    makeId: make.id,
                    name: fitment.model,
                    yearStart: fitment.yearStart,
                    yearEnd: fitment.yearEnd,
                    engineType: fitment.engineType,
                });
                await this.prisma.productFitment.create({
                    data: {
                        productId,
                        vehicleModelId: model.id,
                        position: fitment.position,
                        notes: fitment.notes,
                    },
                });
            }
            catch (error) {
                if (!((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('Unique constraint'))) {
                    console.warn(`    Warning: Could not create fitment: ${error.message}`);
                }
            }
        }
    }
    async getOrCreateVehicleMake(makeName) {
        let make = await this.prisma.vehicleMake.findUnique({
            where: { name: makeName },
            select: { id: true },
        });
        if (!make) {
            make = await this.prisma.vehicleMake.create({
                data: {
                    name: makeName,
                    isActive: true,
                },
                select: { id: true },
            });
        }
        return make;
    }
    async getOrCreateVehicleModel(data) {
        let model = await this.prisma.vehicleModel.findFirst({
            where: {
                makeId: data.makeId,
                name: data.name,
                yearStart: data.yearStart,
                engineType: data.engineType || null,
            },
            select: { id: true },
        });
        if (!model) {
            model = await this.prisma.vehicleModel.create({
                data: {
                    makeId: data.makeId,
                    name: data.name,
                    yearStart: data.yearStart,
                    yearEnd: data.yearEnd,
                    engineType: data.engineType,
                },
                select: { id: true },
            });
        }
        return model;
    }
}
exports.ProductImporter = ProductImporter;
//# sourceMappingURL=product-importer.js.map