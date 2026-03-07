/**
 * Phase 06 — Product Catalog
 * Creates 10 categories, 20 brands, and 1000+ products with EN/AR fields.
 */
import { PrismaClient } from '@prisma/client';
import { id, freshId } from '../helpers/ids';
import { CATEGORIES, BRANDS, generateProductList } from '../helpers/arabic';

export async function seedCatalog(prisma: PrismaClient) {
    console.log('  → Phase 06: Creating Product Catalog...');

    // 1. Create categories
    const categoryIds: string[] = [];
    for (let i = 0; i < CATEGORIES.length; i++) {
        const catId = id(`cat:${i}`);
        categoryIds.push(catId);
        await prisma.productCategory.create({
            data: {
                id: catId,
                name: CATEGORIES[i].name,
                nameAr: CATEGORIES[i].nameAr,
            },
        });
    }
    console.log(`    ✓ ${CATEGORIES.length} categories`);

    // 2. Create brands
    const brandIds: string[] = [];
    for (let i = 0; i < BRANDS.length; i++) {
        const brandId = id(`brand:${i}`);
        brandIds.push(brandId);
        await prisma.brand.create({
            data: {
                id: brandId,
                name: BRANDS[i].name,
                nameAr: BRANDS[i].nameAr,
                country: BRANDS[i].country,
                isOem: BRANDS[i].isOem,
            },
        });
    }
    console.log(`    ✓ ${BRANDS.length} brands`);

    // 3. Create products (1000+)
    const products = generateProductList();
    const productIds: string[] = [];

    // Batch insert in chunks of 50 for performance
    const BATCH_SIZE = 50;
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
        const batch = products.slice(i, i + BATCH_SIZE);
        await prisma.product.createMany({
            data: batch.map((p, idx) => {
                const pId = id(`product:${i + idx}`);
                productIds.push(pId);
                return {
                    id: pId,
                    brandId: brandIds[p.brandIndex],
                    categoryId: categoryIds[p.categoryIndex],
                    name: p.name,
                    nameAr: p.nameAr,
                    description: p.description,
                    descriptionAr: p.descriptionAr,
                    weight: p.weight,
                    status: 'ACTIVE',
                    unitOfMeasure: 'EA',
                };
            }),
            skipDuplicates: true,
        });
    }

    console.log(`    ✓ ${products.length} products created`);
    return { categoryIds, brandIds, productIds, products };
}
