import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RefundStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class RefundsService {
    constructor(private prisma: PrismaService) { }

    async createRefund(
        tenantId: string,
        orderId: string,
        amount: number,
        reason: string,
        createdBy: string,
        returnId?: string,
        deliveryExceptionId?: string,
    ) {
        // LAW 4: A refund is ILLEGAL unless backed by exactly one proof
        if (!returnId && !deliveryExceptionId) {
            throw new BadRequestException('COMMERCIAL SAFETY LAW 4: Refund must be linked to a Return or Delivery Exception');
        }
        if (returnId && deliveryExceptionId) {
            throw new BadRequestException('COMMERCIAL SAFETY LAW 4: Refund cannot be linked to both Return and Delivery Exception');
        }

        const order = await this.prisma.order.findFirst({
            where: { id: orderId, tenantId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Validate refund amount (cannot exceed total order value) -- simplified check
        // In strict system, we'd sum existing refunds and checks balance.
        // For now, assume single refund logic or naive check.

        // Generate refund number
        const refundCount = await this.prisma.refund.count({ where: { tenantId } });
        const refundNumber = `REF-${new Date().getFullYear()}-${paddedNumber(refundCount + 1)}`;

        return this.prisma.refund.create({
            data: {
                tenantId,
                branchId: order.branchId,
                orderId,
                returnId,
                deliveryExceptionId,
                refundNumber,
                amount,
                reason,
                status: RefundStatus.PENDING,
                createdById: createdBy,
            },
        });
    }

    async processRefund(tenantId: string, refundId: string, processedBy: string) {
        const refund = await this.prisma.refund.findFirst({
            where: { id: refundId, tenantId },
            include: { return: true, deliveryException: true },
        });

        if (!refund) {
            throw new NotFoundException('Refund not found');
        }

        if (refund.status !== RefundStatus.PENDING) {
            throw new BadRequestException('Refund must be PENDING to process');
        }

        // LAW 4: Authorization
        if (refund.returnId) {
            // Case A: Return -> Must be RECEIVED
            if (refund.return?.status !== 'RECEIVED') {
                throw new BadRequestException('COMMERCIAL SAFETY LAW 4: Return must be RECEIVED to process refund');
            }

            // LAW P1: Partial Return Fraud Check
            // Refund amount cannot exceed the value of the returned types
            const returnItems = await this.prisma.returnItem.findMany({
                where: { returnId: refund.returnId },
                include: { orderItem: true }
            });

            // Calculate max refundable amount
            // We only count items that are linked to an OrderItem (to get price)
            let maxRefundable = new Decimal(0);
            for (const item of returnItems) {
                if (item.orderItem) {
                    // item.quantity is number, unitPrice is Decimal
                    maxRefundable = maxRefundable.plus(item.orderItem.unitPrice.mul(item.quantity));
                }
            }

            // Allow for floating point epsilon if needed, but usually strict comparison for currency
            if (refund.amount.gt(maxRefundable)) {
                throw new BadRequestException(`COMMERCIAL SAFETY P1: Refund amount (${refund.amount}) exceeds value of returned goods (${maxRefundable})`);
            }

        } else if (refund.deliveryExceptionId) {
            // Case B: Lost/Damaged -> Must be LOST_IN_TRANSIT or DAMAGED_IN_TRANSIT
            const validTypes = ['LOST_IN_TRANSIT', 'DAMAGED_IN_TRANSIT'];
            if (!validTypes.includes(refund.deliveryException?.exceptionType)) {
                throw new BadRequestException('COMMERCIAL SAFETY LAW 4: Delivery Exception must be LOST or DAMAGED to process refund');
            }
        } else {
            // Should never happen if createRefund is guarded, but critical safety net
            throw new BadRequestException('COMMERCIAL SAFETY LAW 4: No valid proof linked to this refund');
        }

        return this.prisma.$transaction(async (tx) => {
            const processedRefund = await tx.refund.update({
                where: { id: refundId },
                data: {
                    status: RefundStatus.COMPLETED,
                    processedById: processedBy,
                    processedAt: new Date(),
                },
            });

            // TODO: Create Accounting Entry
            // 1. Debit Revenue/Liability
            // 2. Credit Cash/Customer Balance

            return processedRefund;
        });
    }

    async cancelRefund(tenantId: string, refundId: string, cancelledBy: string, reason: string) {
        const refund = await this.prisma.refund.findFirst({
            where: { id: refundId, tenantId },
        });

        if (!refund) {
            throw new NotFoundException('Refund not found');
        }

        if (refund.status !== RefundStatus.PENDING) {
            throw new BadRequestException('Only PENDING refunds can be cancelled');
        }

        return this.prisma.refund.update({
            where: { id: refundId },
            data: {
                status: RefundStatus.CANCELLED,
                cancelledById: cancelledBy,
                cancelledAt: new Date(),
                reason: `${refund.reason} [CANCELLED: ${reason}]`,
            },
        });
    }

    async findAll(tenantId: string, status?: RefundStatus, orderId?: string) {
        return this.prisma.refund.findMany({
            where: {
                tenantId,
                ...(status && { status }),
                ...(orderId && { orderId }),
            },
            include: {
                order: { select: { orderNumber: true } },
                return: { select: { returnNumber: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getPendingTotal(tenantId: string) {
        const aggregations = await this.prisma.refund.aggregate({
            where: { tenantId, status: RefundStatus.PENDING },
            _sum: { amount: true },
        });
        return aggregations._sum.amount || 0;
    }
}

function paddedNumber(num: number): string {
    return num.toString().padStart(6, '0');
}
