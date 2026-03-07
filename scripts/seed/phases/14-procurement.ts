/**
 * Phase 14 — Procurement
 * Creates purchase orders at various lifecycle stages:
 *   - 4 RECEIVED (fully received)
 *   - 2 PARTIALLY_RECEIVED
 *   - 2 ORDERED (awaiting delivery)
 *   - 2 DRAFT
 */
import { PrismaClient } from '@prisma/client';
import {
    TENANT_ID, BRANCH_WAREHOUSE, BRANCH_RETAIL_1,
    USER_BRANCH_MGR_WH, USER_WH_STAFF_1,
    id, freshId,
} from '../helpers/ids';
import { daysAgo, dateAt } from '../helpers/dates';

const PO_DEFS = [
    // RECEIVED — fully received with GRNs
    { key: 'po:1', supplier: 'sup:bosch-me', branch: BRANCH_WAREHOUSE, status: 'RECEIVED', daysBack: 30, itemCount: 5, currency: 'USD' },
    { key: 'po:2', supplier: 'sup:denso-gulf', branch: BRANCH_WAREHOUSE, status: 'RECEIVED', daysBack: 25, itemCount: 4, currency: 'USD' },
    { key: 'po:3', supplier: 'sup:cairo-parts', branch: BRANCH_WAREHOUSE, status: 'RECEIVED', daysBack: 20, itemCount: 6, currency: 'EGP' },
    { key: 'po:4', supplier: 'sup:valeo-egypt', branch: BRANCH_WAREHOUSE, status: 'RECEIVED', daysBack: 15, itemCount: 3, currency: 'EGP' },
    // PARTIALLY_RECEIVED — some items received
    { key: 'po:5', supplier: 'sup:mann-hummel', branch: BRANCH_WAREHOUSE, status: 'PARTIALLY_RECEIVED', daysBack: 10, itemCount: 4, currency: 'EUR' },
    { key: 'po:6', supplier: 'sup:nile-dist', branch: BRANCH_RETAIL_1, status: 'PARTIALLY_RECEIVED', daysBack: 7, itemCount: 3, currency: 'EGP' },
    // ORDERED — awaiting delivery
    { key: 'po:7', supplier: 'sup:bosch-me', branch: BRANCH_WAREHOUSE, status: 'ORDERED', daysBack: 3, itemCount: 5, currency: 'USD' },
    { key: 'po:8', supplier: 'sup:alexandria', branch: BRANCH_WAREHOUSE, status: 'ORDERED', daysBack: 2, itemCount: 3, currency: 'EGP' },
    // DRAFT — not yet submitted
    { key: 'po:9', supplier: 'sup:delta-motors', branch: BRANCH_WAREHOUSE, status: 'DRAFT', daysBack: 1, itemCount: 4, currency: 'EGP' },
    { key: 'po:10', supplier: 'sup:denso-gulf', branch: BRANCH_WAREHOUSE, status: 'DRAFT', daysBack: 0, itemCount: 3, currency: 'USD' },
];

export async function seedProcurement(prisma: PrismaClient) {
    console.log('  → Phase 14: Creating Purchase Orders...');

    // Get available products
    const products = await prisma.product.findMany({ take: 100 });

    let poCount = 0;
    let receiptCount = 0;

    for (const poDef of PO_DEFS) {
        const poId = id(poDef.key);
        const supplierId = id(poDef.supplier);
        const poDate = daysAgo(poDef.daysBack);
        const poNum = `PO-2025-${String(poCount + 1).padStart(4, '0')}`;

        // Select random products for PO items
        const selectedProducts = [];
        const used = new Set<number>();
        for (let i = 0; i < poDef.itemCount; i++) {
            let idx: number;
            do { idx = Math.floor(Math.random() * products.length); } while (used.has(idx));
            used.add(idx);
            const qty = 10 + Math.floor(Math.random() * 90); // 10-100 units
            const unitCost = 5 + Math.floor(Math.random() * 95); // $5-$100
            selectedProducts.push({ product: products[idx], quantity: qty, unitCost });
        }

        const totalCost = selectedProducts.reduce((s, p) => s + p.unitCost * p.quantity, 0);

        // Get supplier name
        const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });

        await prisma.purchaseOrder.create({
            data: {
                id: poId,
                tenantId: TENANT_ID,
                branchId: poDef.branch,
                supplierId,
                supplierName: supplier!.name,
                status: poDef.status as any,
                currency: poDef.currency,
                exchangeRate: poDef.currency === 'USD' ? 30.90 : poDef.currency === 'EUR' ? 33.50 : 1.0,
                totalCost,
                createdById: USER_BRANCH_MGR_WH,
                createdAt: poDate,
                items: {
                    create: selectedProducts.map(p => ({
                        id: freshId(),
                        productId: p.product.id,
                        quantity: p.quantity,
                        unitCost: p.unitCost,
                    })),
                },
            },
        });
        poCount++;

        // Create receipts for RECEIVED and PARTIALLY_RECEIVED
        if (poDef.status === 'RECEIVED' || poDef.status === 'PARTIALLY_RECEIVED') {
            const receivePct = poDef.status === 'RECEIVED' ? 1.0 : 0.5;
            receiptCount++;

            await prisma.purchaseOrderReceipt.create({
                data: {
                    id: freshId(),
                    tenantId: TENANT_ID,
                    purchaseOrderId: poId,
                    receiptNumber: `GRN-2025-${String(receiptCount).padStart(4, '0')}`,
                    receivedAt: dateAt(poDef.daysBack - 1, 10),
                    receivedById: USER_WH_STAFF_1,
                    notes: poDef.status === 'RECEIVED' ? 'Full shipment received' : 'Partial shipment - awaiting backorder',
                    items: {
                        create: selectedProducts.map(p => ({
                            id: freshId(),
                            productId: p.product.id,
                            quantity: Math.ceil(p.quantity * receivePct),
                            acceptedUnitCost: p.unitCost,
                        })),
                    },
                },
            });
        }
    }

    console.log(`    ✓ ${poCount} purchase orders, ${receiptCount} receipts`);
}
