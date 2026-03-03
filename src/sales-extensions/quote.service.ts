import {
    Injectable, BadRequestException, NotFoundException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../shared/audit.service';
import { EventBus } from '../shared/event-bus.service';
import { OutboxService } from '../shared/outbox.service';
import { assertTransition, QUOTE_TRANSITIONS } from '../common/guards/fsm.guard';
import { CreateQuoteDto } from './dtos/create-quote.dto';
import { TranslationService } from '../i18n/translation.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class QuoteService {
    constructor(
        private prisma: PrismaService,
        private auditService: AuditService,
        private outbox: OutboxService,
        private t: TranslationService,
    ) { }

    // G-11: Fetch real selling price from inventory instead of placeholder
    async createQuote(tenantId: string, userId: string, dto: CreateQuoteDto) {
        return this.prisma.$transaction(async (tx) => {
            let subtotal = 0;

            const resolvedItems: Array<{
                productId: string;
                quantity: number;
                unitPrice: number;
                discount: number;
                lineTotal: number;
            }> = [];

            for (const item of dto.items) {
                // G-11: Fetch actual selling price from inventory
                const inventory = await tx.inventory.findFirst({
                    where: { productId: item.productId, tenantId },
                    select: { sellingPrice: true },
                });

                if (!inventory) {
                    throw new NotFoundException(
                        `Product ${item.productId} has no inventory record for this tenant. Cannot price quote.`
                    );
                }

                const unitPrice = Number(inventory.sellingPrice);
                const discount = item.discount || 0;
                const lineTotal = unitPrice * item.quantity * (1 - discount);
                subtotal += lineTotal;

                resolvedItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice,
                    discount,
                    lineTotal,
                });
            }

            const tax = subtotal * 0.1; // 10% tax — should be configurable via TaxRate in future
            const total = subtotal + tax;

            const count = await tx.quote.count({ where: { tenantId } });
            const quoteNumber = `QT-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

            const quote = await tx.quote.create({
                data: {
                    tenantId,
                    quoteNumber,
                    businessClientId: dto.businessClientId,
                    customerName: dto.customerName,
                    validUntil: new Date(dto.validUntil),
                    subtotal,
                    tax,
                    total,
                    status: 'DRAFT',
                    createdById: userId,
                    items: {
                        create: resolvedItems,
                    },
                },
                include: { items: true },
            });

            await this.auditService.logAction(
                tenantId,
                userId,
                'CREATE_QUOTE',
                'Quote',
                quote.id,
                null,
                quote,
                undefined,
                undefined,
                tx,
            );
            return quote;
        });
    }

    async findOne(tenantId: string, quoteId: string) {
        const quote = await this.prisma.quote.findFirst({
            where: { id: quoteId, tenantId },
            include: { items: { include: { product: true } } },
        });
        if (!quote) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Quote' }));
        return quote;
    }

    async findAll(tenantId: string) {
        return this.prisma.quote.findMany({
            where: { tenantId },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    // ─── G-06: Convert ACCEPTED Quote → Order ──────────────────────────────────
    async convertToOrder(tenantId: string, userId: string, quoteId: string) {
        return this.prisma.$transaction(async (tx) => {
            const quote = await tx.quote.findFirst({
                where: { id: quoteId, tenantId },
                include: { items: true },
            });

            if (!quote) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Quote' }));
            if (quote.status !== 'ACCEPTED') {
                throw new BadRequestException(this.t.translate('errors.quotes.not_convertible', 'EN'));
            }

            // G-06: Enforce validUntil expiry check
            if (new Date() > quote.validUntil) {
                throw new BadRequestException(this.t.translate('errors.quotes.expired', 'EN'));
            }

            const orderCount = await tx.order.count({ where: { tenantId } });
            const orderNumber = `ORD-${new Date().getFullYear()}-${(orderCount + 1).toString().padStart(5, '0')}`;

            const order = await tx.order.create({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data: {
                    tenantId,
                    orderNumber,
                    businessClientId: quote.businessClientId,
                    subtotal: quote.subtotal,
                    tax: quote.tax,
                    total: quote.total,
                    status: 'PENDING',
                    sourceQuoteId: quoteId,   // G-06: trace back to origin quote
                    items: {
                        create: quote.items.map((i: any) => ({
                            productId: i.productId,
                            quantity: i.quantity,
                            unitPrice: i.unitPrice,
                            discount: i.discount,
                            lineTotal: i.lineTotal,   // G-11: populated from inventory
                        })),
                    },
                } as any,
                include: { items: true },
            });

            // ✅ G-08: FSM Enforcement
            assertTransition('Quote', quoteId, quote.status, 'CONVERTED', QUOTE_TRANSITIONS);

            // ✅ G-05: Optimistic Locking & Race Condition Prevention
            // We use updateMany with version + current status check to ensure atomic conversion
            const updateCount = await tx.quote.updateMany({
                where: {
                    id: quoteId,
                    status: 'ACCEPTED',
                    version: (quote as any).version
                } as any,
                data: {
                    status: 'CONVERTED',
                    version: { increment: 1 }
                } as any,
            });

            if (updateCount.count === 0) {
                // If update fails, it means someone else changed the quote or version in the meantime
                throw new ConflictException(this.t.translate('errors.quotes.concurrent_update', 'EN'));
            }

            await this.auditService.logAction(
                tenantId,
                userId,
                'CONVERT_QUOTE_TO_ORDER',
                'Quote',
                quoteId,
                { status: 'ACCEPTED' },
                { status: 'CONVERTED', orderId: order.id },
                undefined,
                undefined,
                tx,
            );

            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'quote.converted',
                payload: { quoteId, orderId: order.id, tenantId },
            });

            return order;
        });
    }

    // ─── G-06: Reject Quote ─────────────────────────────────────────────────────
    async rejectQuote(tenantId: string, userId: string, quoteId: string, reason: string) {
        return this.prisma.$transaction(async (tx) => {
            const quote = await tx.quote.findFirst({ where: { id: quoteId, tenantId } });
            if (!quote) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Quote' }));
            if (!['DRAFT', 'SENT', 'ACCEPTED'].includes(quote.status)) {
                throw new BadRequestException(this.t.translate('errors.fsm.invalid_transition', 'EN', { entity: 'Quote', from: quote.status, to: 'REJECTED' }));
            }

            const updated = await tx.quote.update({
                where: { id: quoteId },
                data: { status: 'REJECTED', rejectionReason: reason },
            });

            await this.auditService.logAction(
                tenantId,
                userId,
                'REJECT_QUOTE',
                'Quote',
                quoteId,
                { status: quote.status },
                { status: 'REJECTED', reason },
                undefined,
                undefined,
                tx,
            );

            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'quote.rejected',
                payload: { quoteId, tenantId, reason },
            });

            return updated;
        });
    }

    // ─── G-06: Send Quote to client (DRAFT → SENT) ─────────────────────────────
    async sendQuote(tenantId: string, userId: string, quoteId: string) {
        return this.prisma.$transaction(async (tx) => {
            const quote = await tx.quote.findFirst({ where: { id: quoteId, tenantId } });
            if (!quote) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Quote' }));
            if (quote.status !== 'DRAFT') {
                throw new BadRequestException(this.t.translate('errors.fsm.invalid_transition', 'EN', { entity: 'Quote', from: quote.status, to: 'SENT' }));
            }
            if (new Date() > quote.validUntil) {
                throw new BadRequestException(this.t.translate('errors.quotes.expired', 'EN'));
            }

            const updated = await tx.quote.update({
                where: { id: quoteId },
                data: { status: 'SENT', sentAt: new Date() },
            });

            await this.auditService.logAction(
                tenantId,
                userId,
                'SEND_QUOTE',
                'Quote',
                quoteId,
                { status: 'DRAFT' },
                { status: 'SENT' },
                undefined,
                undefined,
                tx,
            );

            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'quote.sent',
                payload: { quoteId, tenantId },
            });

            return updated;
        });
    }

    // ─── G-06: Accept Quote (SENT → ACCEPTED) ──────────────────────────────────
    async acceptQuote(tenantId: string, userId: string, quoteId: string) {
        return this.prisma.$transaction(async (tx) => {
            const quote = await tx.quote.findFirst({ where: { id: quoteId, tenantId } });
            if (!quote) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Quote' }));
            if (quote.status !== 'SENT') {
                throw new BadRequestException(this.t.translate('errors.fsm.invalid_transition', 'EN', { entity: 'Quote', from: quote.status, to: 'ACCEPTED' }));
            }
            if (new Date() > quote.validUntil) {
                throw new BadRequestException(this.t.translate('errors.quotes.expired', 'EN'));
            }

            const updated = await tx.quote.update({
                where: { id: quoteId },
                data: { status: 'ACCEPTED' },
            });

            await this.auditService.logAction(
                tenantId,
                userId,
                'ACCEPT_QUOTE',
                'Quote',
                quoteId,
                { status: 'SENT' },
                { status: 'ACCEPTED' },
                undefined,
                undefined,
                tx,
            );

            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'quote.accepted',
                payload: { quoteId, tenantId },
            });

            return updated;
        });
    }

    // ─── G-06: Auto-expire sent quotes past validUntil (runs every hour) ───────
    @Cron(CronExpression.EVERY_HOUR)
    async expireStaleQuotes() {
        const result = await this.prisma.quote.updateMany({
            where: {
                status: 'SENT',
                validUntil: { lt: new Date() },
            },
            data: { status: 'EXPIRED' },
        });

        if (result.count > 0) {
            console.log(`[QuoteService] Auto-expired ${result.count} quotes`);
        }
    }
}
