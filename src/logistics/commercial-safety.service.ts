import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventorySafetyService } from '../warehouse/inventory-safety.service';
import { RefundStatus, ReturnStatus } from '@prisma/client';

@Injectable()
export class CommercialSafetyService {
    constructor(
        private prisma: PrismaService,
        private inventorySafety: InventorySafetyService,
    ) { }

    /**
     * Processes a replacement for a return.
     * Creates a Zero-Value Order and allocates stock.
     */
    /**
     * Processes a replacement order.
     * Enforces COMMERCIAL SAFETY LAW R1: Must have exactly one proof of loss.
     */
    async processReplacement(
        tenantId: string,
        userId: string,
        returnId?: string,
        deliveryExceptionId?: string
    ) {
        // LAW R1: Replacement requires exactly one proof
        if (!returnId && !deliveryExceptionId) {
            throw new BadRequestException('COMMERCIAL SAFETY R1: Replacement requires Return or DeliveryException');
        }
        if (returnId && deliveryExceptionId) {
            throw new BadRequestException('COMMERCIAL SAFETY R1: Replacement cannot have both Return and DeliveryException');
        }

        let itemsToReplace: { productId: string; quantity: number }[] = [];
        let replacementsBranchId: string;
        let replacementsClientId: string | null = null;
        let sourceReturn: any = null;
        let sourceException: any = null;

        if (returnId) {
            const ret = await this.prisma.return.findFirst({
                where: { id: returnId, tenantId },
                include: { returnItems: true, order: true },
            });

            if (!ret) throw new NotFoundException('Return not found');
            if (ret.status !== ReturnStatus.RECEIVED) {
                throw new BadRequestException('COMMERCIAL SAFETY R1: Return must be RECEIVED');
            }

            sourceReturn = ret;
            replacementsBranchId = ret.order?.branchId || '';
            replacementsClientId = ret.order?.businessClientId || null;

            itemsToReplace = ret.returnItems
                .filter(i => i.productId)
                .map(i => ({ productId: i.productId!, quantity: i.quantity }));
        }

        if (deliveryExceptionId) {
            const ex = await this.prisma.deliveryException.findFirst({
                where: { id: deliveryExceptionId, tenantId },
                include: { tripStop: { include: { order: { include: { items: true } } } } },
            });

            if (!ex) throw new NotFoundException('Delivery Exception not found');
            const validTypes = ['LOST_IN_TRANSIT', 'DAMAGED_IN_TRANSIT'];
            if (!validTypes.includes(ex.exceptionType)) {
                throw new BadRequestException('COMMERCIAL SAFETY R1: DeliveryException must be LOST or DAMAGED');
            }

            sourceException = ex;
            const order = ex.tripStop.order;
            if (!order) throw new BadRequestException('Exception not linked to order');

            replacementsBranchId = order.branchId;
            replacementsClientId = order.businessClientId;

            // For lost/damaged shipment, replace the entire order associated with the stop
            // Or specifically items? Usually exceptions are TripStop level.
            // We assume full order replacement for now as per `processLoss` pattern
            itemsToReplace = order.items.map(i => ({ productId: i.productId, quantity: i.quantity }));
        }

        if (itemsToReplace.length === 0) {
            throw new BadRequestException('No items found to replace');
        }

        return this.prisma.$transaction(async (tx) => {
            const orderCount = await tx.order.count({ where: { tenantId } });
            const orderNumber = `EXC-${new Date().getFullYear()}-${(orderCount + 1).toString().padStart(6, '0')}`;

            // Create Order with Proof Link
            const newOrder = await tx.order.create({
                data: {
                    tenantId,
                    branchId: replacementsBranchId,
                    businessClientId: replacementsClientId ?? '', // Handle strictly
                    orderNumber,
                    status: 'PENDING',
                    total: 0,
                    subtotal: 0,
                    tax: 0,
                    createdById: userId,
                    // LAW R1: Link Proof
                    returnId: returnId,
                    deliveryExceptionId: deliveryExceptionId,
                    items: {
                        create: itemsToReplace.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: 0,
                        }))
                    }
                },
                include: { items: true }
            });

            // Allocate Stock
            await this.inventorySafety.allocate(
                tenantId,
                newOrder.branchId,
                newOrder.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
                'ORDER' as any,
                newOrder.id,
                userId,
                tx
            );

            // Confirm
            await tx.order.update({
                where: { id: newOrder.id },
                data: { status: 'CONFIRMED' }
            });

            // Close Proof
            if (sourceReturn) {
                await tx.return.update({
                    where: { id: returnId },
                    data: { status: ReturnStatus.COMPLETED, completedAt: new Date() }
                });
            }

            if (sourceException) {
                await tx.deliveryException.update({
                    where: { id: deliveryExceptionId },
                    data: {
                        resolved: true,
                        resolutionType: 'REPLACEMENT',
                        resolvedBy: userId,
                        resolvedAt: new Date(),
                        resolutionNotes: `Replaced by Order ${newOrder.orderNumber}`
                    }
                });
            }

            return newOrder;
        });
    }

    /**
     * Writes off inventory for lost shipments and triggers refund.
     */
    async processLoss(tenantId: string, exceptionId: string, userId: string) {
        const exception = await this.prisma.deliveryException.findUnique({
            where: { id: exceptionId },
            include: { tripStop: { include: { order: { include: { items: true } } } } }
        });

        if (!exception) throw new NotFoundException('Exception not found');
        if (exception.exceptionType !== 'LOST_IN_TRANSIT') {
            throw new BadRequestException('Only LOST_IN_TRANSIT can be processed as total loss');
        }

        const order = exception.tripStop.order;
        if (!order) throw new BadRequestException('exception not linked to order');

        return this.prisma.$transaction(async (tx) => {
            // 1. Inventory Write-off (Ledger only, as stock was already "committed" when shipped)
            // Actually, if it was in transit, it was "committed" (deducted). 
            // So we just need to log the financial loss, not deduct physical stock again.
            // We create a "LOSS" ledger entry for tracking.

            // 2. Create/Approve Refund
            const refundCount = await tx.refund.count({ where: { tenantId } });
            const refundNumber = `REF-LOSS-${new Date().getFullYear()}-${(refundCount + 1).toString().padStart(6, '0')}`;

            await tx.refund.create({
                data: {
                    tenantId,
                    branchId: order.branchId,
                    orderId: order.id,
                    amount: order.total,
                    reason: 'Lost in Transit - Auto Refund',
                    status: RefundStatus.PENDING, // Reviewed by finance
                    refundNumber,
                    createdById: userId
                }
            });

            // 3. Resolve Exception
            await tx.deliveryException.update({
                where: { id: exceptionId },
                data: {
                    resolved: true,
                    resolutionType: 'LOSS_REFUND',
                    resolvedBy: userId,
                    resolvedAt: new Date()
                }
            });
        });
    }
}
