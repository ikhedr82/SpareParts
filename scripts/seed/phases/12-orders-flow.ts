/**
 * Phase 12 — B2B Orders Flow
 * Creates 25 orders with full lifecycle:
 *   5 DELIVERED (with picklists → packs)
 *   2 PARTIALLY_FULFILLED
 *   3 OUT_FOR_DELIVERY (with packs)
 *   1 DELIVERY_FAILED
 *   2 CANCELLED
 *   3 PENDING
 *   3 CONFIRMED
 *   3 PROCESSING
 *   3 SHIPPED
 *
 * Orders that reach PROCESSING+ get PickLists and Packs.
 */
import { PrismaClient } from '@prisma/client';
import {
    TENANT_ID, BRANCH_RETAIL_1, BRANCH_RETAIL_2, BRANCH_WAREHOUSE,
    USER_WH_STAFF_1, USER_WH_STAFF_2,
    id, freshId,
} from '../helpers/ids';
import { daysAgo, dateAt } from '../helpers/dates';

interface OrderDef {
    key: string;
    bcKey: string;
    branch: string;
    status: string;
    daysBack: number;
    itemCount: number;
    createPickList: boolean;
    packStatus?: string;
}

const ORDER_DEFS: OrderDef[] = [
    // ── DELIVERED (5) ── fully processed with packs + trips
    { key: 'order:1', bcKey: 'bc:sphinx', branch: BRANCH_RETAIL_1, status: 'DELIVERED', daysBack: 14, itemCount: 4, createPickList: true, packStatus: 'SEALED' },
    { key: 'order:2', bcKey: 'bc:pharaoh', branch: BRANCH_RETAIL_1, status: 'DELIVERED', daysBack: 12, itemCount: 3, createPickList: true, packStatus: 'SEALED' },
    { key: 'order:3', bcKey: 'bc:oasis', branch: BRANCH_RETAIL_2, status: 'DELIVERED', daysBack: 10, itemCount: 5, createPickList: true, packStatus: 'SEALED' },
    { key: 'order:4', bcKey: 'bc:sahara', branch: BRANCH_RETAIL_2, status: 'DELIVERED', daysBack: 8, itemCount: 3, createPickList: true, packStatus: 'SEALED' },
    { key: 'order:5', bcKey: 'bc:delta', branch: BRANCH_RETAIL_1, status: 'DELIVERED', daysBack: 6, itemCount: 4, createPickList: true, packStatus: 'SEALED' },
    // ── PARTIALLY_FULFILLED (2) ──
    { key: 'order:6', bcKey: 'bc:pyramids', branch: BRANCH_RETAIL_1, status: 'PARTIALLY_FULFILLED', daysBack: 5, itemCount: 4, createPickList: true, packStatus: 'OPEN' },
    { key: 'order:7', bcKey: 'bc:lotus', branch: BRANCH_RETAIL_2, status: 'PARTIALLY_FULFILLED', daysBack: 4, itemCount: 3, createPickList: true, packStatus: 'OPEN' },
    // ── OUT_FOR_DELIVERY (3) ── fully packed, on the road
    { key: 'order:8', bcKey: 'bc:sphinx', branch: BRANCH_RETAIL_1, status: 'OUT_FOR_DELIVERY', daysBack: 1, itemCount: 3, createPickList: true, packStatus: 'SEALED' },
    { key: 'order:9', bcKey: 'bc:oasis', branch: BRANCH_RETAIL_2, status: 'OUT_FOR_DELIVERY', daysBack: 1, itemCount: 4, createPickList: true, packStatus: 'SEALED' },
    { key: 'order:10', bcKey: 'bc:sinai', branch: BRANCH_RETAIL_2, status: 'OUT_FOR_DELIVERY', daysBack: 0, itemCount: 2, createPickList: true, packStatus: 'SEALED' },
    // ── DELIVERY_FAILED (1) ──
    { key: 'order:11', bcKey: 'bc:sahara', branch: BRANCH_RETAIL_1, status: 'DELIVERY_FAILED', daysBack: 3, itemCount: 3, createPickList: true, packStatus: 'SEALED' },
    // ── CANCELLED (2) ──
    { key: 'order:12', bcKey: 'bc:pyramids', branch: BRANCH_RETAIL_1, status: 'CANCELLED', daysBack: 7, itemCount: 2, createPickList: false },
    { key: 'order:13', bcKey: 'bc:sinai', branch: BRANCH_RETAIL_2, status: 'CANCELLED', daysBack: 9, itemCount: 2, createPickList: false },
    // ── PENDING (3) ──
    { key: 'order:14', bcKey: 'bc:sphinx', branch: BRANCH_RETAIL_1, status: 'PENDING', daysBack: 0, itemCount: 3, createPickList: false },
    { key: 'order:15', bcKey: 'bc:pharaoh', branch: BRANCH_RETAIL_1, status: 'PENDING', daysBack: 0, itemCount: 2, createPickList: false },
    { key: 'order:16', bcKey: 'bc:delta', branch: BRANCH_RETAIL_2, status: 'PENDING', daysBack: 0, itemCount: 4, createPickList: false },
    // ── CONFIRMED (3) ──
    { key: 'order:17', bcKey: 'bc:lotus', branch: BRANCH_RETAIL_1, status: 'CONFIRMED', daysBack: 1, itemCount: 3, createPickList: false },
    { key: 'order:18', bcKey: 'bc:oasis', branch: BRANCH_RETAIL_2, status: 'CONFIRMED', daysBack: 1, itemCount: 2, createPickList: false },
    { key: 'order:19', bcKey: 'bc:sahara', branch: BRANCH_RETAIL_1, status: 'CONFIRMED', daysBack: 0, itemCount: 3, createPickList: false },
    // ── PROCESSING (3) — these get picklists
    { key: 'order:20', bcKey: 'bc:sphinx', branch: BRANCH_RETAIL_1, status: 'PROCESSING', daysBack: 1, itemCount: 3, createPickList: true, packStatus: 'OPEN' },
    { key: 'order:21', bcKey: 'bc:oasis', branch: BRANCH_RETAIL_2, status: 'PROCESSING', daysBack: 0, itemCount: 2, createPickList: true, packStatus: 'OPEN' },
    { key: 'order:22', bcKey: 'bc:pharaoh', branch: BRANCH_RETAIL_2, status: 'PROCESSING', daysBack: 0, itemCount: 4, createPickList: true },
    // ── SHIPPED (3) ──
    { key: 'order:23', bcKey: 'bc:delta', branch: BRANCH_RETAIL_1, status: 'SHIPPED', daysBack: 2, itemCount: 3, createPickList: true, packStatus: 'SEALED' },
    { key: 'order:24', bcKey: 'bc:sinai', branch: BRANCH_RETAIL_2, status: 'SHIPPED', daysBack: 2, itemCount: 2, createPickList: true, packStatus: 'SEALED' },
    { key: 'order:25', bcKey: 'bc:pyramids', branch: BRANCH_RETAIL_1, status: 'SHIPPED', daysBack: 1, itemCount: 3, createPickList: true, packStatus: 'SEALED' },
];

export async function seedOrdersFlow(prisma: PrismaClient) {
    console.log('  → Phase 12: Creating Orders, PickLists, and Packs...');

    let orderCount = 0;
    let picklistCount = 0;
    let packCount = 0;

    for (const def of ORDER_DEFS) {
        const branchId = def.branch;

        // Get inventory items for this branch
        const inventory = await prisma.inventory.findMany({
            where: { branchId, quantity: { gt: 3 } },
            take: 100,
            include: { product: true },
        });

        if (inventory.length < def.itemCount) continue;

        // Select random items
        const items = [];
        const used = new Set<number>();
        for (let i = 0; i < def.itemCount; i++) {
            let idx: number;
            do { idx = Math.floor(Math.random() * Math.min(inventory.length, 50)); } while (used.has(idx));
            used.add(idx);
            const inv = inventory[idx];
            const qty = 1 + Math.floor(Math.random() * 5);
            items.push({ productId: inv.productId, quantity: qty, price: inv.sellingPrice, inventoryId: inv.id });
        }

        const subtotal = items.reduce((s, it) => s + Number(it.price) * it.quantity, 0);
        const tax = Math.round(subtotal * 0.14 * 100) / 100;
        const total = Math.round((subtotal + tax) * 100) / 100;
        const orderId = id(def.key);
        const orderDate = daysAgo(def.daysBack);
        const orderNum = `ORD-2025-${String(orderCount + 1).padStart(4, '0')}`;

        const statusDates: any = {};
        if (['CONFIRMED', 'PROCESSING', 'PARTIALLY_FULFILLED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED'].includes(def.status)) {
            statusDates.confirmedAt = dateAt(def.daysBack, 10);
        }
        if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(def.status)) {
            statusDates.shippedAt = dateAt(def.daysBack, 14);
        }
        if (def.status === 'DELIVERED') {
            statusDates.deliveredAt = dateAt(def.daysBack - 1, 16);
        }
        if (def.status === 'CANCELLED') {
            statusDates.cancelledAt = dateAt(def.daysBack, 11);
        }

        // Create order
        await prisma.order.create({
            data: {
                id: orderId,
                tenantId: TENANT_ID,
                businessClientId: id(def.bcKey),
                branchId,
                orderNumber: orderNum,
                deliveryAddressId: id(`${def.bcKey}:addr`),
                contactId: id(`${def.bcKey}:contact`),
                subtotal: Math.round(subtotal * 100) / 100,
                tax,
                total,
                status: def.status as any,
                createdAt: orderDate,
                ...statusDates,
                items: {
                    create: items.map(it => ({
                        id: freshId(),
                        productId: it.productId,
                        quantity: it.quantity,
                        unitPrice: it.price,
                    })),
                },
            },
        });
        orderCount++;

        // Create PickList + Pack for orders that are processing or beyond
        if (def.createPickList) {
            const pickListId = id(`picklist:${def.key}`);
            const pickListStatus = def.packStatus === 'SEALED' ? 'PACKED' : (def.packStatus === 'OPEN' ? 'PICKING' : 'CREATED');

            await prisma.pickList.create({
                data: {
                    id: pickListId,
                    tenantId: TENANT_ID,
                    branchId,
                    orderId,
                    status: pickListStatus as any,
                    assignedToId: branchId === BRANCH_RETAIL_1 ? USER_WH_STAFF_1 : USER_WH_STAFF_2,
                    startedAt: pickListStatus !== 'CREATED' ? dateAt(def.daysBack, 11) : null,
                    completedAt: pickListStatus === 'PACKED' ? dateAt(def.daysBack, 12) : null,
                    items: {
                        create: items.map(it => ({
                            id: freshId(),
                            productId: it.productId,
                            inventoryId: it.inventoryId,
                            requiredQty: it.quantity,
                            pickedQty: pickListStatus !== 'CREATED' ? it.quantity : 0,
                            status: pickListStatus !== 'CREATED' ? 'PICKED' : 'PENDING',
                        })),
                    },
                },
            });
            picklistCount++;

            // Create Pack if status warrants it
            if (def.packStatus) {
                const packId = id(`pack:${def.key}`);
                await prisma.pack.create({
                    data: {
                        id: packId,
                        pickListId,
                        packNumber: `PKG-${String(packCount + 1).padStart(4, '0')}`,
                        weight: items.length * 2.5,
                        status: def.packStatus as any,
                        items: {
                            create: items.map(it => ({
                                id: freshId(),
                                productId: it.productId,
                                quantity: it.quantity,
                            })),
                        },
                    },
                });
                packCount++;
            }
        }
    }

    console.log(`    ✓ ${orderCount} orders, ${picklistCount} picklists, ${packCount} packs`);
}
