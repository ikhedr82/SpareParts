/**
 * Phase 08 — Inventory
 * Distributes stock across 3 branches with realistic levels:
 * - Central Warehouse: high stock (bulk quantities)
 * - Retail branches: medium stock with some zero/low items
 * Includes cost/selling prices and allocated quantities.
 */
import { PrismaClient } from '@prisma/client';
import { TENANT_ID, BRANCH_WAREHOUSE, BRANCH_RETAIL_1, BRANCH_RETAIL_2, id, freshId } from '../helpers/ids';
import { generateProductList } from '../helpers/arabic';

export async function seedInventory(prisma: PrismaClient) {
    console.log('  → Phase 08: Creating Inventory...');

    const products = generateProductList();
    const branches = [
        { id: BRANCH_WAREHOUSE, name: 'Warehouse', highStockPct: 0.85 },
        { id: BRANCH_RETAIL_1, name: 'Downtown', highStockPct: 0.60 },
        { id: BRANCH_RETAIL_2, name: 'Industrial', highStockPct: 0.55 },
    ];

    let totalRecords = 0;

    for (const branch of branches) {
        const BATCH = 100;
        for (let i = 0; i < products.length; i += BATCH) {
            const batch = products.slice(i, i + BATCH);
            await prisma.inventory.createMany({
                data: batch.map((p, idx) => {
                    const globalIdx = i + idx;
                    const productId = id(`product:${globalIdx}`);

                    // Stock distribution:
                    // - branch.highStockPct of products have high stock
                    // - 10% have low stock (1-5)
                    // - remainder have zero stock
                    const rand = Math.random();
                    let quantity: number;
                    let allocated = 0;

                    if (rand < branch.highStockPct) {
                        // High stock: warehouse gets more
                        quantity = branch.id === BRANCH_WAREHOUSE
                            ? 20 + Math.floor(Math.random() * 180) // 20-200
                            : 5 + Math.floor(Math.random() * 45);   // 5-50
                        // 15% of high-stock items have some allocated
                        if (Math.random() < 0.15) {
                            allocated = Math.floor(quantity * 0.1 * Math.random());
                        }
                    } else if (rand < branch.highStockPct + 0.10) {
                        quantity = 1 + Math.floor(Math.random() * 4); // Low stock: 1-5
                    } else {
                        quantity = 0; // Out of stock
                    }

                    // Bin location for warehouse
                    const section = String.fromCharCode(65 + (globalIdx % 8)); // A-H
                    const shelf = Math.floor(globalIdx / 8) % 20 + 1;
                    const binLocation = `${section}-${String(shelf).padStart(2, '0')}-${String((globalIdx % 5) + 1).padStart(2, '0')}`;

                    return {
                        id: freshId(),
                        tenantId: TENANT_ID,
                        branchId: branch.id,
                        productId,
                        quantity,
                        allocated,
                        costPrice: p.costPrice,
                        sellingPrice: p.sellingPrice,
                        barcode: `${p.sku}-${branch.id.slice(0, 4)}`,
                        binLocation: branch.id === BRANCH_WAREHOUSE ? binLocation : null,
                    };
                }),
                skipDuplicates: true,
            });
        }

        totalRecords += products.length;
    }

    console.log(`    ✓ ${totalRecords} inventory records across ${branches.length} branches`);
}
