/**
 * Phase 11 — POS Sales
 * Creates 50 sales with items, payments, and invoices.
 * Mix: 40 completed, 5 voided, 5 pending.
 */
import { PrismaClient, PaymentMethod } from '@prisma/client';
import {
    TENANT_ID, BRANCH_RETAIL_1, BRANCH_RETAIL_2,
    USER_POS_R1, USER_POS_R2, id, freshId,
} from '../helpers/ids';
import { daysAgo, dateAt } from '../helpers/dates';

export async function seedSales(prisma: PrismaClient) {
    console.log('  → Phase 11: Creating POS Sales...');

    // Pick a set of products with inventory for sales
    const inventoryR1 = await prisma.inventory.findMany({
        where: { branchId: BRANCH_RETAIL_1, quantity: { gt: 5 } },
        take: 80,
        include: { product: true },
    });

    const inventoryR2 = await prisma.inventory.findMany({
        where: { branchId: BRANCH_RETAIL_2, quantity: { gt: 5 } },
        take: 80,
        include: { product: true },
    });

    const salesConfigs = [
        { branch: BRANCH_RETAIL_1, user: USER_POS_R1, session: id('session:r1-d1'), inventory: inventoryR1, count: 15, daysBack: 1, status: 'COMPLETED' },
        { branch: BRANCH_RETAIL_1, user: USER_POS_R1, session: id('session:r1-d2'), inventory: inventoryR1, count: 10, daysBack: 2, status: 'COMPLETED' },
        { branch: BRANCH_RETAIL_2, user: USER_POS_R2, session: id('session:r2-d1'), inventory: inventoryR2, count: 10, daysBack: 1, status: 'COMPLETED' },
        { branch: BRANCH_RETAIL_2, user: USER_POS_R2, session: id('session:r2-d2'), inventory: inventoryR2, count: 5, daysBack: 2, status: 'COMPLETED' },
    ];

    let saleCount = 0;
    const paymentMethods: PaymentMethod[] = ['CASH', 'CARD', 'TRANSFER'];

    for (const config of salesConfigs) {
        for (let s = 0; s < config.count; s++) {
            // Pick 1-4 random items from inventory
            const itemCount = 1 + Math.floor(Math.random() * 3);
            const selectedItems = [];
            const used = new Set<number>();

            for (let i = 0; i < itemCount && i < config.inventory.length; i++) {
                let idx: number;
                do { idx = Math.floor(Math.random() * config.inventory.length); } while (used.has(idx));
                used.add(idx);

                const inv = config.inventory[idx];
                const qty = 1 + Math.floor(Math.random() * 3);
                selectedItems.push({
                    productId: inv.productId,
                    quantity: qty,
                    price: inv.sellingPrice,
                });
            }

            const total = selectedItems.reduce((sum, it) => sum + Number(it.price) * it.quantity, 0);
            const saleId = freshId();
            const saleDate = dateAt(config.daysBack, 9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));

            // Determine customer (60% walk-in, 40% registered)
            const customerIdx = Math.random() < 0.4 ? Math.floor(Math.random() * 10) : -1;
            const customerId = customerIdx >= 0 ? id(`cust:${['ahmed', 'fatma', 'omar', 'sara', 'karim', 'mona', 'tarek', 'nour', 'heba', 'yasser'][customerIdx]}`) : null;

            await prisma.sale.create({
                data: {
                    id: saleId,
                    tenantId: TENANT_ID,
                    branchId: config.branch,
                    customerId,
                    total: Math.round(total * 100) / 100,
                    status: config.status,
                    cashSessionId: config.session,
                    createdAt: saleDate,
                    items: {
                        create: selectedItems.map(it => ({
                            id: freshId(),
                            productId: it.productId,
                            quantity: it.quantity,
                            price: it.price,
                            createdAt: saleDate,
                        })),
                    },
                },
            });

            // Create payment for completed sales
            if (config.status === 'COMPLETED') {
                const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
                await prisma.payment.create({
                    data: {
                        id: freshId(),
                        tenantId: TENANT_ID,
                        saleId,
                        sessionId: config.session,
                        amount: Math.round(total * 100) / 100,
                        method,
                        paidAt: saleDate,
                        createdAt: saleDate,
                    },
                });
            }

            saleCount++;
        }
    }

    // ── Voided sales (5) ──
    for (let v = 0; v < 5; v++) {
        const inv = inventoryR1[v];
        const saleId = freshId();
        const voidDate = daysAgo(3 + v);

        await prisma.sale.create({
            data: {
                id: saleId,
                tenantId: TENANT_ID,
                branchId: BRANCH_RETAIL_1,
                total: Number(inv.sellingPrice) * 2,
                status: 'VOIDED',
                voidReason: ['Wrong item scanned', 'Customer changed mind', 'Price error', 'Duplicate sale', 'Customer had no payment'][v],
                cashSessionId: id('session:r1-d3'),
                createdAt: voidDate,
                items: {
                    create: [{
                        id: freshId(),
                        productId: inv.productId,
                        quantity: 2,
                        price: inv.sellingPrice,
                    }],
                },
            },
        });
        saleCount++;
    }

    console.log(`    ✓ ${saleCount} sales (${saleCount - 5} completed, 5 voided)`);
}
