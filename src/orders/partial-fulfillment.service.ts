import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
import { assertTransition, ORDER_TRANSITIONS } from '../common/guards/fsm.guard';
import { InvariantException } from '../common/exceptions/invariant.exception';
import { TranslationService } from '../i18n/translation.service';

@Injectable()
export class PartialFulfillmentService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditService: AuditService,
        private readonly outbox: OutboxService,
        private readonly t: TranslationService,
    ) { }

    /**
     * UC-4: Partially fulfill an order - split items into fulfilled and backordered.
     * FSM: PROCESSING → PARTIALLY_FULFILLED
     */
    async partialFulfill(
        tenantId: string, orderId: string, userId: string,
        fulfillmentLines: { orderItemId: string; fulfilledQty: number }[],
        correlationId?: string,
    ) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, tenantId },
            include: { items: true },
        });

        if (!order) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Order' }));

        assertTransition(
            'Order', orderId,
            order.status, OrderStatus.PARTIALLY_FULFILLED,
            ORDER_TRANSITIONS,
        );

        // Validate each line
        for (const line of fulfillmentLines) {
            const orderItem = order.items.find(i => i.id === line.orderItemId);
            if (!orderItem) throw new BadRequestException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Order item' }));

            if (line.fulfilledQty < 0 || line.fulfilledQty > orderItem.quantity) {
                throw new InvariantException('PF-01', this.t.translate('errors.orders.quantity_exceeds', 'EN'), {
                    orderItemId: line.orderItemId, ordered: orderItem.quantity, fulfilled: line.fulfilledQty,
                });
            }
        }

        // At least one item must be partially fulfilled (not all full, not all zero)
        const allFull = fulfillmentLines.every(l => {
            const item = order.items.find(i => i.id === l.orderItemId)!;
            return l.fulfilledQty === item.quantity;
        });
        const allZero = fulfillmentLines.every(l => l.fulfilledQty === 0);
        if (allFull) throw new InvariantException('PF-02', this.t.translate('errors.orders.invalid_transition', 'EN', { entity: 'Order', from: 'PARTIAL', to: 'FULL' }), {});
        if (allZero) throw new InvariantException('PF-03', this.t.translate('errors.orders.no_items', 'EN'), {});

        return this.prisma.$transaction(async (tx) => {
            // Create fulfillment lines
            for (const line of fulfillmentLines) {
                const orderItem = order.items.find(i => i.id === line.orderItemId)!;
                const backordered = orderItem.quantity - line.fulfilledQty;

                await tx.orderFulfillmentLine.create({
                    data: {
                        orderId, orderItemId: line.orderItemId,
                        fulfilledQty: line.fulfilledQty,
                        backorderedQty: backordered,
                    },
                });
            }

            // Update order status with optimistic lock
            const result = await tx.order.updateMany({
                where: { id: orderId, tenantId, version: order.version },
                data: {
                    status: OrderStatus.PARTIALLY_FULFILLED,
                    version: { increment: 1 },
                },
            });
            if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

            await this.outbox.schedule(tx as any, {
                tenantId, topic: 'orders.partially_fulfilled',
                payload: { orderId, lines: fulfillmentLines },
                correlationId,
            });

            await this.auditService.logAction(
                tenantId, userId, 'PARTIAL_FULFILL', 'Order', orderId,
                { status: order.status },
                { status: OrderStatus.PARTIALLY_FULFILLED, lines: fulfillmentLines },
                correlationId, undefined, tx as any,
            );

            return tx.order.findUnique({
                where: { id: orderId },
                include: { items: true },
            });
        });
    }

    async getFulfillmentLines(tenantId: string, orderId: string) {
        // Verify tenant access
        const order = await this.prisma.order.findFirst({ where: { id: orderId, tenantId } });
        if (!order) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Order' }));

        return this.prisma.orderFulfillmentLine.findMany({
            where: { orderId },
            orderBy: { createdAt: 'desc' },
        });
    }
}
