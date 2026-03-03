import { PrismaClient } from '@prisma/client';
import { NormalizedProduct } from '../normalizers/product-normalizer';
import { ProductDeduplicator } from '../normalizers/deduplicator';
import { mapCategory, getOrCreateCategory } from '../normalizers/category-mapper';
import { PlanEnforcementService } from '../../tenant-admin/plan-enforcement.service';

/**
 * Batch imports normalized products into the database
 */
export class ProductImporter {
    private prisma: PrismaClient;
    private deduplicator: ProductDeduplicator;
    private planEnforcement: PlanEnforcementService;

    constructor(prisma: PrismaClient, planEnforcement: PlanEnforcementService) {
        this.prisma = prisma;
        this.deduplicator = new ProductDeduplicator(prisma);
        this.planEnforcement = planEnforcement;
    }

    /**
     * Import a batch of normalized products
     */
    async importProducts(
        tenantId: string,
        products: NormalizedProduct[],
        dataSourceName: string
    ): Promise<{
        imported: number;
        skipped: number;
        updated: number;
        errors: string[];
    }> {
        let imported = 0;
        let skipped = 0;
        let updated = 0;
        const errors: string[] = [];

        console.log(`Starting import of ${products.length} products from ${dataSourceName}...`);

        // Get or create data source
        const dataSource = await this.getOrCreateDataSource(dataSourceName);

        for (const product of products) {
            try {
                // Check for existing product
                const match = await this.deduplicator.findExistingProduct(
                    product.partNumber,
                    product.brandName,
                    product.alternatePartNumbers
                );

                if (match.confidence === 'exact' || match.confidence === 'alternate') {
                    console.log(`  ⊙ Skipping duplicate: ${product.partNumber} (matched by ${match.matchedBy})`);
                    skipped++;
                    continue;
                }

                // Get or create brand
                const brand = await this.getOrCreateBrand(product.brandName);

                // Get or create category
                const mappedCategoryName = mapCategory(product.categoryName);
                const category = await getOrCreateCategory(this.prisma, mappedCategoryName);

                // Check plan limits
                await this.planEnforcement.checkProductLimit(tenantId);

                // Create product
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

                // Create alternate part numbers
                if (product.alternatePartNumbers.length > 0) {
                    await this.createAlternatePartNumbers(
                        createdProduct.id,
                        product.alternatePartNumbers,
                        product.brandName
                    );
                }

                // Create fitment records
                if (product.fitments.length > 0) {
                    await this.createFitments(createdProduct.id, product.fitments);
                }

                // Create product source tracking
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

            } catch (error) {
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

    /**
     * Get or create brand
     */
    private async getOrCreateBrand(brandName: string): Promise<{ id: string }> {
        let brand = await this.prisma.brand.findUnique({
            where: { name: brandName },
            select: { id: true },
        });

        if (!brand) {
            brand = await this.prisma.brand.create({
                data: {
                    name: brandName,
                    isOem: false, // Aftermarket by default
                },
                select: { id: true },
            });
        }

        return brand;
    }

    /**
     * Get or create data source
     */
    private async getOrCreateDataSource(sourceName: string): Promise<{ id: string }> {
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

    /**
     * Create alternate part numbers
     */
    private async createAlternatePartNumbers(
        productId: string,
        partNumbers: string[],
        manufacturer: string
    ): Promise<void> {
        for (const partNumber of partNumbers) {
            try {
                await this.prisma.alternatePartNumber.create({
                    data: {
                        productId,
                        partNumber,
                        manufacturer,
                    },
                });
            } catch (error) {
                // Ignore duplicate part number errors
                if (!error.message?.includes('Unique constraint')) {
                    console.warn(`    Warning: Could not create alternate part number ${partNumber}: ${error.message}`);
                }
            }
        }
    }

    /**
     * Create fitment records
     */
    private async createFitments(
        productId: string,
        fitments: Array<{
            make: string;
            model: string;
            yearStart: number;
            yearEnd?: number;
            engineType?: string;
            position?: string;
            notes?: string;
        }>
    ): Promise<void> {
        for (const fitment of fitments) {
            try {
                // Get or create vehicle make
                const make = await this.getOrCreateVehicleMake(fitment.make);

                // Get or create vehicle model
                const model = await this.getOrCreateVehicleModel({
                    makeId: make.id,
                    name: fitment.model,
                    yearStart: fitment.yearStart,
                    yearEnd: fitment.yearEnd,
                    engineType: fitment.engineType,
                });

                // Create product fitment
                await this.prisma.productFitment.create({
                    data: {
                        productId,
                        vehicleModelId: model.id,
                        position: fitment.position,
                        notes: fitment.notes,
                    },
                });
            } catch (error) {
                // Ignore duplicate fitment errors
                if (!error.message?.includes('Unique constraint')) {
                    console.warn(`    Warning: Could not create fitment: ${error.message}`);
                }
            }
        }
    }

    /**
     * Get or create vehicle make
     */
    private async getOrCreateVehicleMake(makeName: string): Promise<{ id: string }> {
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

    /**
     * Get or create vehicle model
     */
    private async getOrCreateVehicleModel(data: {
        makeId: string;
        name: string;
        yearStart: number;
        yearEnd?: number;
        engineType?: string;
    }): Promise<{ id: string }> {
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
