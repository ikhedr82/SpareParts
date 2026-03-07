import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    ReturnReason,
    ReturnStatus,
    RefundStatus,
    InventoryReferenceType,
    InventoryTransactionType,
} from '@prisma/client';
import { InventorySafetyService } from '../warehouse/inventory-safety.service';
import { assertTransition, RETURN_TRANSITIONS, REFUND_TRANSITIONS } from '../common/guards/fsm.guard';
import { AuditService } from '../shared/audit.service';
import { TranslationService } from '../i18n/translation.service';

@Injectable()
export class ReturnsService {
    constructor(
        private prisma: PrismaService,
        private inventorySafetyService: InventorySafetyService,
        private auditService: AuditService,
        private t: TranslationService,
    ) { }

    async initiateReturn(
        tenantId: string,
        orderId: string,
        reason: ReturnReason,
        items: { orderItemId: string; quantity: number }[],
        requestedBy: string,
        reasonNotes?: string,
        deliveryExceptionId?: string,
    ) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, tenantId },
            include: { items: true },
        });

        if (!order) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Order' }));
        }

        // Validate items belong to order
        for (const item of items) {
            const orderItem = order.items.find((i) => i.id === item.orderItemId);
            if (!orderItem) {
                throw new BadRequestException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Order item' }));
            }
            if (item.quantity > orderItem.quantity) {
                throw new BadRequestException(this.t.translate('errors.orders.quantity_exceeds', 'EN'));
            }
        }

        // Generate return number
        const returnCount = await this.prisma.return.count({ where: { tenantId } });
        const returnNumber = `RET-${new Date().getFullYear()}-${paddedNumber(returnCount + 1)}`;

        const result = await this.prisma.return.create({
            data: {
                tenantId,
                orderId,
                returnNumber,
                reason,
                reasonNotes,
                requestedBy,
                deliveryExceptionId,
                status: ReturnStatus.REQUESTED,
                returnItems: {
                    create: items.map((item) => ({
                        orderItemId: item.orderItemId,
                        quantity: item.quantity,
                    })),
                },
            },
            include: {
                returnItems: true,
            },
        });

        await this.auditService.logAction(tenantId, requestedBy, 'INITIATE_RETURN', 'Return', result.id, null, result);
        return result;
    }

    async approveReturn(tenantId: string, returnId: string, approvedBy: string) {
        const returnRequest = await this.prisma.return.findFirst({
            where: { id: returnId, tenantId },
            include: { order: true, returnItems: { include: { orderItem: true } } },
        });

        if (!returnRequest) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Return' }));
        }

        if (returnRequest.status !== ReturnStatus.REQUESTED) {
            throw new BadRequestException(this.t.translate('errors.fsm.invalid_transition', 'EN', { entity: 'Return', from: returnRequest.status, to: 'APPROVED' }));
        }

        // Calculate refund amount based on return items
        const totalRefundAmount = returnRequest.returnItems.reduce((sum, item) => {
            return sum + Number(item.orderItem.unitPrice) * item.quantity;
        }, 0);

        // Generate refund number
        const refundCount = await this.prisma.refund.count({ where: { tenantId } });
        const refundNumber = `REF-${new Date().getFullYear()}-${paddedNumber(refundCount + 1)}`;

        return this.prisma.$transaction(async (tx) => {
            // ✅ G-08: FSM Guard
            assertTransition('Return', returnId, returnRequest.status, ReturnStatus.APPROVED, RETURN_TRANSITIONS);

            // Approve return with Optimistic Locking
            const result = await tx.return.updateMany({
                where: { id: returnId, tenantId, version: returnRequest.version },
                data: {
                    status: ReturnStatus.APPROVED,
                    approvedBy,
                    approvedAt: new Date(),
                    version: { increment: 1 }
                },
            });

            if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

            const updatedReturn = await tx.return.findFirst({ where: { id: returnId, tenantId } });

            // Create PENDING refund
            const refund = await tx.refund.create({
                data: {
                    tenantId,
                    branchId: returnRequest.order.branchId,
                    orderId: returnRequest.orderId,
                    returnId,
                    refundNumber,
                    amount: totalRefundAmount,
                    reason: `Refund for Return ${returnRequest.returnNumber}`,
                    status: RefundStatus.PENDING,
                    createdById: approvedBy,
                },
            });

            await this.auditService.logAction(tenantId, approvedBy, 'APPROVE_RETURN', 'Return', returnId, { status: returnRequest.status }, { status: ReturnStatus.APPROVED, refundId: refund.id });
            return updatedReturn;
        });
    }

    async rejectReturn(tenantId: string, returnId: string, rejectedBy: string, reason: string) {
        const returnRequest = await this.prisma.return.findFirst({
            where: { id: returnId, tenantId },
        });

        if (!returnRequest) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Return' }));
        }

        if (returnRequest.status !== ReturnStatus.REQUESTED) {
            throw new BadRequestException(this.t.translate('errors.fsm.invalid_transition', 'EN', { entity: 'Return', from: returnRequest.status, to: 'REJECTED' }));
        }

        const result = await this.prisma.return.updateMany({
            where: { id: returnId, tenantId, version: returnRequest.version },
            data: {
                status: ReturnStatus.REJECTED,
                reasonNotes: reason ? `${returnRequest.reasonNotes || ''} [REJECTED: ${reason}]` : undefined,
                version: { increment: 1 }
            },
        });

        if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

        return this.prisma.return.findFirst({ where: { id: returnId, tenantId } });
    }

    async receiveReturn(
        tenantId: string,
        returnId: string,
        items: { returnItemId: string; condition: string; restockable: boolean; inspectionNotes?: string }[],
        receivedBy: string,
    ) {
        const returnRequest = await this.prisma.return.findFirst({
            where: { id: returnId, tenantId },
            include: {
                returnItems: {
                    include: {
                        orderItem: true,
                    },
                },
                order: true,
            },
        });

        if (!returnRequest) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Return' }));
        }

        // ✅ G-08: FSM Guard
        assertTransition('Return', returnId, returnRequest.status, ReturnStatus.RECEIVED, RETURN_TRANSITIONS);

        return this.prisma.$transaction(async (tx) => {
            const itemsToRestock: { productId: string; quantity: number }[] = [];

            // Update items
            for (const item of items) {
                await tx.returnItem.update({
                    where: { id: item.returnItemId },
                    data: {
                        condition: item.condition,
                        restockable: item.restockable,
                        inspectionNotes: item.inspectionNotes,
                        // Removed receivedAt as it's not in ReturnItem model
                    },
                });

                if (item.restockable) {
                    const returnItem = returnRequest.returnItems.find((ri) => ri.id === item.returnItemId);
                    if (returnItem && returnItem.orderItem) {
                        itemsToRestock.push({
                            productId: returnItem.orderItem.productId,
                            quantity: returnItem.quantity,
                        });
                    }
                }
            }

            // Restock items if any (Commercial Safety)
            if (itemsToRestock.length > 0) {
                await this.inventorySafetyService.restock(
                    tenantId,
                    returnRequest.order.branchId,
                    itemsToRestock,
                    InventoryTransactionType.RETURN,
                    InventoryReferenceType.RETURN,
                    returnId,
                    receivedBy,
                    tx,
                );
            }

            // Update return status with Optimistic Locking
            const result = await tx.return.updateMany({
                where: { id: returnId, tenantId, version: returnRequest.version },
                data: {
                    status: ReturnStatus.RECEIVED,
                    receivedAt: new Date(),
                    version: { increment: 1 }
                },
            });

            if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

            const updated = await tx.return.findFirst({
                where: { id: returnId, tenantId },
                include: { returnItems: true },
            });

            await this.auditService.logAction(tenantId, receivedBy, 'RECEIVE_RETURN', 'Return', returnId, { status: returnRequest.status }, { status: ReturnStatus.RECEIVED });
            return updated;
        });
    }

    async completeReturn(tenantId: string, returnId: string, completedBy: string) {
        const returnRequest = await this.prisma.return.findFirst({
            where: { id: returnId, tenantId },
            include: {
                returnItems: { include: { orderItem: true } },
                refund: true,
            },
        });

        if (!returnRequest) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Return' }));
        }

        // ✅ G-08: FSM Guard
        assertTransition('Return', returnId, returnRequest.status, ReturnStatus.COMPLETED, RETURN_TRANSITIONS);

        return this.prisma.$transaction(async (tx) => {
            // 1. Update Inventory for restockable items
            // (This logic might need connection to Warehouse service, but we'll adapt for now)
            // Assuming naive inventory update for now, ideally call InventoryService

            // 2. Complete Refund if exists
            if (returnRequest.refund && returnRequest.refund.status === RefundStatus.PENDING) {
                const refundResult = await tx.refund.updateMany({
                    where: { id: returnRequest.refund.id, tenantId, version: returnRequest.refund.version },
                    data: {
                        status: RefundStatus.COMPLETED,
                        processedById: completedBy,
                        processedAt: new Date(),
                        version: { increment: 1 }
                    },
                });

                if (refundResult.count === 0) throw new Error('CONCURRENCY_CONFLICT');
            }

            // 3. Complete Return with Optimistic Locking
            const result = await tx.return.updateMany({
                where: { id: returnId, tenantId, version: returnRequest.version },
                data: {
                    status: ReturnStatus.COMPLETED,
                    completedAt: new Date(),
                    version: { increment: 1 }
                },
            });

            if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

            return tx.return.findFirst({ where: { id: returnId, tenantId } });

            await this.auditService.logAction(tenantId, completedBy, 'COMPLETE_RETURN', 'Return', returnId, { status: returnRequest.status }, { status: ReturnStatus.COMPLETED });
            return result;
        });
    }

    async findAll(tenantId: string, status?: ReturnStatus, orderId?: string) {
        return this.prisma.return.findMany({
            where: {
                tenantId,
                ...(status && { status }),
                ...(orderId && { orderId }),
            },
            include: {
                order: { select: { orderNumber: true } },
                returnItems: true,
                refund: true,
            },
            orderBy: { requestedAt: 'desc' },
        });
    }

    async findOne(tenantId: string, id: string) {
        return this.prisma.return.findFirst({
            where: { id, tenantId },
            include: {
                order: true,
                returnItems: { include: { orderItem: true } },
                refund: true,
            },
        });
    }
}

function paddedNumber(num: number): string {
    return num.toString().padStart(6, '0');
}
