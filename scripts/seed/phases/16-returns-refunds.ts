/**
 * Phase 16 — Returns & Refunds
 * Creates:
 *   - Customer returns (from orders & POS sales)
 *   - Purchase returns (to suppliers)
 *   - Refunds (linked to returns)
 */
import { PrismaClient } from '@prisma/client';
import {
    TENANT_ID, BRANCH_RETAIL_1, BRANCH_RETAIL_2,
    USER_POS_R1, USER_POS_R2, USER_BRANCH_MGR_R1, USER_FINANCE,
    USER_BRANCH_MGR_WH, USER_WH_STAFF_1,
    id, freshId,
} from '../helpers/ids';
import { daysAgo, dateAt } from '../helpers/dates';

export async function seedReturnsRefunds(prisma: PrismaClient) {
    console.log('  → Phase 16: Creating Returns & Refunds...');

    // ── 1. Customer Returns (from delivered orders) ──
    const deliveredOrders = await prisma.order.findMany({
        where: { tenantId: TENANT_ID, status: 'DELIVERED' },
        include: { items: true },
        take: 3,
    });

    let returnCount = 0;
    let refundCount = 0;

    const returnReasons = ['WRONG_ITEM', 'DEFECTIVE', 'NOT_AS_DESCRIBED', 'QUALITY_ISSUE'] as const;
    const returnStatuses = ['COMPLETED', 'RECEIVED', 'REQUESTED'] as const;

    for (let i = 0; i < Math.min(deliveredOrders.length, 3); i++) {
        const order = deliveredOrders[i];
        const status = returnStatuses[i] || 'REQUESTED';
        returnCount++;
        const returnId = freshId();
        const returnDate = daysAgo(8 - i * 2);

        await prisma.return.create({
            data: {
                id: returnId,
                tenantId: TENANT_ID,
                branchId: order.branchId,
                orderId: order.id,
                returnNumber: `RET-2025-${String(returnCount).padStart(4, '0')}`,
                reason: returnReasons[i],
                reasonNotes: [
                    'Customer received wrong brake pads for their vehicle model',
                    'Alternator defective out of the box - not charging',
                    'Oil filter dimensions don\'t match listing specification',
                ][i],
                status: status as any,
                requestedBy: USER_POS_R1,
                requestedAt: returnDate,
                approvedBy: status !== 'REQUESTED' ? USER_BRANCH_MGR_R1 : null,
                approvedAt: status !== 'REQUESTED' ? dateAt(8 - i * 2 - 1, 10) : null,
                receivedAt: status === 'COMPLETED' || status === 'RECEIVED' ? dateAt(8 - i * 2 - 2, 14) : null,
                completedAt: status === 'COMPLETED' ? dateAt(8 - i * 2 - 3, 16) : null,
                returnItems: {
                    create: order.items.slice(0, 1).map(item => ({
                        id: freshId(),
                        orderItemId: item.id,
                        productId: item.productId,
                        quantity: 1,
                        condition: status === 'COMPLETED' ? 'Good - restockable' : null,
                        inspectionNotes: status === 'COMPLETED' ? 'Inspected and approved for restocking' : null,
                        restockable: true,
                    })),
                },
            },
        });

        // Create refund for completed returns
        if (status === 'COMPLETED') {
            refundCount++;
            const refundAmount = Number(order.items[0].unitPrice);

            await prisma.refund.create({
                data: {
                    id: freshId(),
                    tenantId: TENANT_ID,
                    branchId: order.branchId,
                    orderId: order.id,
                    returnId,
                    refundNumber: `RF-2025-${String(refundCount).padStart(4, '0')}`,
                    amount: refundAmount,
                    reason: 'Product return - wrong item shipped',
                    status: 'COMPLETED',
                    createdById: USER_POS_R1,
                    processedById: USER_FINANCE,
                    processedAt: dateAt(5, 10),
                },
            });
        }
    }

    // ── 2. POS Sale Return ──
    const completedSale = await prisma.sale.findFirst({
        where: { tenantId: TENANT_ID, status: 'COMPLETED', branchId: BRANCH_RETAIL_2 },
        include: { items: true },
    });

    if (completedSale && completedSale.items.length > 0) {
        returnCount++;
        const saleReturnId = freshId();
        await prisma.return.create({
            data: {
                id: saleReturnId,
                tenantId: TENANT_ID,
                branchId: BRANCH_RETAIL_2,
                saleId: completedSale.id,
                returnNumber: `RET-2025-${String(returnCount).padStart(4, '0')}`,
                reason: 'CUSTOMER_CHANGED_MIND',
                reasonNotes: 'Customer returned within 24 hours, item unopened',
                status: 'COMPLETED',
                requestedBy: USER_POS_R2,
                requestedAt: daysAgo(2),
                approvedBy: USER_POS_R2,
                approvedAt: daysAgo(2),
                receivedAt: daysAgo(2),
                completedAt: daysAgo(2),
                returnItems: {
                    create: [{
                        id: freshId(),
                        productId: completedSale.items[0].productId,
                        quantity: 1,
                        condition: 'New - unopened',
                        inspectionNotes: 'Original packaging intact',
                        restockable: true,
                    }],
                },
            },
        });

        // Refund for POS return
        refundCount++;
        await prisma.refund.create({
            data: {
                id: freshId(),
                tenantId: TENANT_ID,
                branchId: BRANCH_RETAIL_2,
                saleId: completedSale.id,
                returnId: saleReturnId,
                refundNumber: `RF-2025-${String(refundCount).padStart(4, '0')}`,
                amount: Number(completedSale.items[0].price),
                reason: 'Customer changed mind - full refund',
                status: 'COMPLETED',
                createdById: USER_POS_R2,
                processedById: USER_POS_R2,
                processedAt: daysAgo(2),
            },
        });
    }

    // ── 3. Delivery Exception Return ──
    // Create return from the failed delivery order
    const failedOrder = await prisma.order.findFirst({
        where: { tenantId: TENANT_ID, status: 'DELIVERY_FAILED' },
        include: { items: true },
    });

    if (failedOrder && failedOrder.items.length > 0) {
        returnCount++;
        await prisma.return.create({
            data: {
                id: freshId(),
                tenantId: TENANT_ID,
                branchId: failedOrder.branchId,
                orderId: failedOrder.id,
                deliveryExceptionId: id('exception:order:11'),
                returnNumber: `RET-2025-${String(returnCount).padStart(4, '0')}`,
                reason: 'DAMAGED_IN_DELIVERY',
                reasonNotes: 'Package damaged during failed delivery attempt',
                status: 'REQUESTED',
                requestedBy: USER_BRANCH_MGR_R1,
                requestedAt: daysAgo(2),
            },
        });
    }

    // ── 4. Purchase Return (to supplier) ──
    const receivedPO = await prisma.purchaseOrder.findFirst({
        where: { tenantId: TENANT_ID, status: 'RECEIVED' },
        include: { items: true },
    });

    if (receivedPO && receivedPO.items.length > 0) {
        const prId = freshId();
        await prisma.purchaseReturn.create({
            data: {
                id: prId,
                tenantId: TENANT_ID,
                purchaseOrderId: receivedPO.id,
                status: 'COMPLETED',
                reason: 'Defective batch - supplier acknowledged quality issue',
                totalValue: Number(receivedPO.items[0].unitCost) * 5,
                createdById: USER_BRANCH_MGR_WH,
                createdAt: daysAgo(12),
                items: {
                    create: [{
                        id: freshId(),
                        productId: receivedPO.items[0].productId,
                        quantity: 5,
                        reason: 'Defective - cracked housing',
                    }],
                },
            },
        });

        // Second purchase return (pending)
        await prisma.purchaseReturn.create({
            data: {
                id: freshId(),
                tenantId: TENANT_ID,
                purchaseOrderId: receivedPO.id,
                status: 'DRAFT',
                reason: 'Wrong SKU shipped by supplier',
                totalValue: Number(receivedPO.items[1]?.unitCost || receivedPO.items[0].unitCost) * 3,
                createdById: USER_WH_STAFF_1,
                createdAt: daysAgo(1),
                items: {
                    create: [{
                        id: freshId(),
                        productId: (receivedPO.items[1] || receivedPO.items[0]).productId,
                        quantity: 3,
                        reason: 'Wrong SKU - expected SP-01020, received SP-01025',
                    }],
                },
            },
        });
    }

    // ── 5. Pending Refund (not yet processed) ──
    const secondDelivered = deliveredOrders[1];
    if (secondDelivered) {
        refundCount++;
        await prisma.refund.create({
            data: {
                id: freshId(),
                tenantId: TENANT_ID,
                branchId: secondDelivered.branchId,
                orderId: secondDelivered.id,
                refundNumber: `RF-2025-${String(refundCount).padStart(4, '0')}`,
                amount: Number(secondDelivered.items[0].unitPrice) * 2,
                reason: 'Partial damage discovered after delivery',
                status: 'PENDING',
                createdById: USER_BRANCH_MGR_R1,
            },
        });
    }

    console.log(`    ✓ ${returnCount} returns, ${refundCount} refunds, 2 purchase returns`);
}
