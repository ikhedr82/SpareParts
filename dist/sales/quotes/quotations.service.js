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
exports.QuotationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const price_engine_service_1 = require("../pricing/price-engine.service");
const translation_service_1 = require("../../i18n/translation.service");
const client_1 = require("@prisma/client");
let QuotationsService = class QuotationsService {
    constructor(prisma, priceEngine, t) {
        this.prisma = prisma;
        this.priceEngine = priceEngine;
        this.t = t;
    }
    async create(userId, tenantId, dto) {
        const { businessClientId, validUntil, items } = dto;
        return this.prisma.$transaction(async (tx) => {
            let subtotal = 0;
            const quoteItems = [];
            for (const item of items) {
                const pricing = await this.priceEngine.calculatePrice({
                    tenantId,
                    productId: item.productId,
                    businessClientId,
                    quantity: item.quantity
                });
                const lineTotal = pricing.finalPrice * item.quantity;
                subtotal += lineTotal;
                quoteItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: pricing.finalPrice
                });
            }
            const tax = subtotal * 0.10;
            const total = subtotal + tax;
            const quote = await tx.quote.create({
                data: {
                    tenantId,
                    quoteNumber: `QT-${Date.now()}`,
                    businessClientId,
                    createdById: userId,
                    validUntil: new Date(validUntil),
                    subtotal,
                    tax,
                    total,
                    status: client_1.QuoteStatus.DRAFT,
                    items: {
                        create: quoteItems
                    }
                },
                include: { items: true }
            });
            return quote;
        });
    }
    async convertToOrder(quoteId, userId) {
        const quote = await this.prisma.quote.findUnique({
            where: { id: quoteId },
            include: { items: true, businessClient: true }
        });
        if (!quote)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Quote' }));
        if (quote.status !== client_1.QuoteStatus.SENT && quote.status !== client_1.QuoteStatus.ACCEPTED) {
            throw new common_1.BadRequestException(this.t.translate('errors.quotes.not_convertible', 'EN'));
        }
        if (new Date() > quote.validUntil)
            throw new common_1.BadRequestException(this.t.translate('errors.quotes.expired', 'EN'));
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    tenantId: quote.tenantId,
                    orderNumber: `ORD-${quote.quoteNumber}-C`,
                    businessClientId: quote.businessClientId,
                    branchId: quote.businessClient.tenantId,
                    status: 'PENDING',
                    subtotal: quote.subtotal,
                    tax: quote.tax,
                    total: quote.total,
                    items: {
                        create: quote.items.map(i => ({
                            productId: i.productId,
                            quantity: i.quantity,
                            unitPrice: i.unitPrice
                        }))
                    }
                }
            });
            await tx.quote.update({
                where: { id: quoteId },
                data: { status: client_1.QuoteStatus.CONVERTED }
            });
            return order;
        });
    }
};
exports.QuotationsService = QuotationsService;
exports.QuotationsService = QuotationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        price_engine_service_1.PriceEngineService,
        translation_service_1.TranslationService])
], QuotationsService);
//# sourceMappingURL=quotations.service.js.map