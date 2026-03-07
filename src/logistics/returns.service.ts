
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

@Injectable()
export class ReturnsService {
    constructor(
        private prisma: PrismaService,
        private inventorySafetyService: InventorySafetyService,
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
            throw new NotFoundException('Order not found');
        }

        // Validate items belong to order
        for (const item of items) {
            const orderItem = order.items.find((i) => i.id === item.orderItemId);
            if (!orderItem) {
                throw new BadRequestException(`Order item ${item.orderItemId} not found in order`);
            }
            if (item.quantity > orderItem.quantity) {
                throw new BadRequestException(`Return quantity cannot exceed order quantity for item ${item.orderItemId}`);
            }
        }

        // Generate return number
        const returnCount = await this.prisma.return.count({ where: { tenantId } });
        const returnNumber = `RET - ${new Date().getFullYear()} -${paddedNumber(returnCount + 1)} `;

        return this.prisma.return.create({
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
    }

    async approveReturn(tenantId: string, returnId: string, approvedBy: string) {
        const returnRequest = await this.prisma.return.findFirst({
            where: { id: returnId, tenantId },
            include: { order: true, returnItems: { include: { orderItem: true } } },
        });

        if (!returnRequest) {
            throw new NotFoundException('Return not found');
        }

        if (returnRequest.status !== ReturnStatus.REQUESTED) {
            throw new BadRequestException('Return must be in REQUESTED status');
        }

        // Calculate refund amount based on return items
        const totalRefundAmount = returnRequest.returnItems.reduce((sum, item) => {
            return sum + Number(item.orderItem.unitPrice) * item.quantity;
        }, 0);

        // Generate refund number
        const refundCount = await this.prisma.refund.count({ where: { tenantId } });
        const refundNumber = `REF - ${new Date().getFullYear()} -${paddedNumber(refundCount + 1)} `;

        return this.prisma.$transaction(async (tx) => {
            // Approve return
            const updatedReturn = await tx.return.update({
                where: { id: returnId },
                data: {
                    status: ReturnStatus.APPROVED,
                    approvedBy,
                    approvedAt: new Date(),
                },
            });

            // Create PENDING refund
            await tx.refund.create({
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

            return updatedReturn;
        });
    }

    async rejectReturn(tenantId: string, returnId: string, rejectedBy: string, reason: string) {
        const returnRequest = await this.prisma.return.findFirst({
            where: { id: returnId, tenantId },
        });

        if (!returnRequest) {
            throw new NotFoundException('Return not found');
        }

        if (returnRequest.status !== ReturnStatus.REQUESTED) {
            throw new BadRequestException('Return must be in REQUESTED status');
        }

        return this.prisma.return.update({
            where: { id: returnId },
            data: {
                status: ReturnStatus.REJECTED,
                reasonNotes: reason ? `${returnRequest.reasonNotes || ''} [REJECTED: ${reason}]` : undefined,
            },
        });
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
            throw new NotFoundException('Return not found');
        }

        if (returnRequest.status !== ReturnStatus.APPROVED) {
            throw new BadRequestException('Return must be APPROVED before receiving items');
        }

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

            // Update return status
            return tx.return.update({
                where: { id: returnId },
                data: {
                    status: ReturnStatus.RECEIVED,
                    receivedAt: new Date(),
                },
                include: { returnItems: true },
            });
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
            throw new NotFoundException('Return not found');
        }

        if (returnRequest.status !== ReturnStatus.RECEIVED) {
            throw new BadRequestException('Return items must be RECEIVED before completion');
        }

        return this.prisma.$transaction(async (tx) => {
            // 1. Update Inventory for restockable items
            // (This logic might need connection to Warehouse service, but we'll adapt for now)
            // Assuming naive inventory update for now, ideally call InventoryService

            // 2. Complete Refund if exists
            if (returnRequest.refund && returnRequest.refund.status === RefundStatus.PENDING) {
                await tx.refund.update({
                    where: { id: returnRequest.refund.id },
                    data: {
                        status: RefundStatus.COMPLETED,
                        processedById: completedBy,
                        processedAt: new Date(),
                    },
                });
                // TODO: Create accounting entry here
            }

            // 3. Complete Return
            return tx.return.update({
                where: { id: returnId },
                data: {
                    status: ReturnStatus.COMPLETED,
                    completedAt: new Date(),
                },
            });
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
}

function paddedNumber(num: number): string {
    return num.toString().padStart(6, '0');
}
