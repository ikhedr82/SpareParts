"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../shared/audit.service");
const outbox_service_1 = require("../shared/outbox.service");
const fsm_guard_1 = require("../common/guards/fsm.guard");
const translation_service_1 = require("../i18n/translation.service");
const schedule_1 = require("@nestjs/schedule");
let QuoteService = class QuoteService {
    constructor(prisma, auditService, outbox, t) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.outbox = outbox;
        this.t = t;
    }
    async createQuote(tenantId, userId, dto) {
        return this.prisma.$transaction(async (tx) => {
            let subtotal = 0;
            const resolvedItems = [];
            for (const item of dto.items) {
                const inventory = await tx.inventory.findFirst({
                    where: { productId: item.productId, tenantId },
                    select: { sellingPrice: true },
                });
                if (!inventory) {
                    throw new common_1.NotFoundException(`Product ${item.productId} has no inventory record for this tenant. Cannot price quote.`);
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
            const tax = subtotal * 0.1;
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
            await this.auditService.logAction(tenantId, userId, 'CREATE_QUOTE', 'Quote', quote.id, null, quote, undefined, undefined, tx);
            return quote;
        });
    }
    async findOne(tenantId, quoteId) {
        const quote = await this.prisma.quote.findFirst({
            where: { id: quoteId, tenantId },
            include: { items: { include: { product: true } } },
        });
        if (!quote)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Quote' }));
        return quote;
    }
    async findAll(tenantId) {
        return this.prisma.quote.findMany({
            where: { tenantId },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async convertToOrder(tenantId, userId, quoteId) {
        return this.prisma.$transaction(async (tx) => {
            const quote = await tx.quote.findFirst({
                where: { id: quoteId, tenantId },
                include: { items: true },
            });
            if (!quote)
                throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Quote' }));
            if (quote.status !== 'ACCEPTED') {
                throw new common_1.BadRequestException(this.t.translate('errors.quotes.not_convertible', 'EN'));
            }
            if (new Date() > quote.validUntil) {
                throw new common_1.BadRequestException(this.t.translate('errors.quotes.expired', 'EN'));
            }
            const orderCount = await tx.order.count({ where: { tenantId } });
            const orderNumber = `ORD-${new Date().getFullYear()}-${(orderCount + 1).toString().padStart(5, '0')}`;
            const order = await tx.order.create({
                data: {
                    tenantId,
                    orderNumber,
                    businessClientId: quote.businessClientId,
                    subtotal: quote.subtotal,
                    tax: quote.tax,
                    total: quote.total,
                    status: 'PENDING',
                    sourceQuoteId: quoteId,
                    items: {
                        create: quote.items.map((i) => ({
                            productId: i.productId,
                            quantity: i.quantity,
                            unitPrice: i.unitPrice,
                            discount: i.discount,
                            lineTotal: i.lineTotal,
                        })),
                    },
                },
                include: { items: true },
            });
            (0, fsm_guard_1.assertTransition)('Quote', quoteId, quote.status, 'CONVERTED', fsm_guard_1.QUOTE_TRANSITIONS);
            const updateCount = await tx.quote.updateMany({
                where: {
                    id: quoteId,
                    status: 'ACCEPTED',
                    version: quote.version
                },
                data: {
                    status: 'CONVERTED',
                    version: { increment: 1 }
                },
            });
            if (updateCount.count === 0) {
                throw new common_1.ConflictException(this.t.translate('errors.quotes.concurrent_update', 'EN'));
            }
            await this.auditService.logAction(tenantId, userId, 'CONVERT_QUOTE_TO_ORDER', 'Quote', quoteId, { status: 'ACCEPTED' }, { status: 'CONVERTED', orderId: order.id }, undefined, undefined, tx);
            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'quote.converted',
                payload: { quoteId, orderId: order.id, tenantId },
            });
            return order;
        });
    }
    async rejectQuote(tenantId, userId, quoteId, reason) {
        return this.prisma.$transaction(async (tx) => {
            const quote = await tx.quote.findFirst({ where: { id: quoteId, tenantId } });
            if (!quote)
                throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Quote' }));
            if (!['DRAFT', 'SENT', 'ACCEPTED'].includes(quote.status)) {
                throw new common_1.BadRequestException(this.t.translate('errors.fsm.invalid_transition', 'EN', { entity: 'Quote', from: quote.status, to: 'REJECTED' }));
            }
            const updated = await tx.quote.update({
                where: { id: quoteId },
                data: { status: 'REJECTED', rejectionReason: reason },
            });
            await this.auditService.logAction(tenantId, userId, 'REJECT_QUOTE', 'Quote', quoteId, { status: quote.status }, { status: 'REJECTED', reason }, undefined, undefined, tx);
            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'quote.rejected',
                payload: { quoteId, tenantId, reason },
            });
            return updated;
        });
    }
    async sendQuote(tenantId, userId, quoteId) {
        return this.prisma.$transaction(async (tx) => {
            const quote = await tx.quote.findFirst({ where: { id: quoteId, tenantId } });
            if (!quote)
                throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Quote' }));
            if (quote.status !== 'DRAFT') {
                throw new common_1.BadRequestException(this.t.translate('errors.fsm.invalid_transition', 'EN', { entity: 'Quote', from: quote.status, to: 'SENT' }));
            }
            if (new Date() > quote.validUntil) {
                throw new common_1.BadRequestException(this.t.translate('errors.quotes.expired', 'EN'));
            }
            const updated = await tx.quote.update({
                where: { id: quoteId },
                data: { status: 'SENT', sentAt: new Date() },
            });
            await this.auditService.logAction(tenantId, userId, 'SEND_QUOTE', 'Quote', quoteId, { status: 'DRAFT' }, { status: 'SENT' }, undefined, undefined, tx);
            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'quote.sent',
                payload: { quoteId, tenantId },
            });
            return updated;
        });
    }
    async acceptQuote(tenantId, userId, quoteId) {
        return this.prisma.$transaction(async (tx) => {
            const quote = await tx.quote.findFirst({ where: { id: quoteId, tenantId } });
            if (!quote)
                throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Quote' }));
            if (quote.status !== 'SENT') {
                throw new common_1.BadRequestException(this.t.translate('errors.fsm.invalid_transition', 'EN', { entity: 'Quote', from: quote.status, to: 'ACCEPTED' }));
            }
            if (new Date() > quote.validUntil) {
                throw new common_1.BadRequestException(this.t.translate('errors.quotes.expired', 'EN'));
            }
            const updated = await tx.quote.update({
                where: { id: quoteId },
                data: { status: 'ACCEPTED' },
            });
            await this.auditService.logAction(tenantId, userId, 'ACCEPT_QUOTE', 'Quote', quoteId, { status: 'SENT' }, { status: 'ACCEPTED' }, undefined, undefined, tx);
            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'quote.accepted',
                payload: { quoteId, tenantId },
            });
            return updated;
        });
    }
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
};
exports.QuoteService = QuoteService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QuoteService.prototype, "expireStaleQuotes", null);
exports.QuoteService = QuoteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        outbox_service_1.OutboxService,
        translation_service_1.TranslationService])
], QuoteService);
//# sourceMappingURL=quote.service.js.map