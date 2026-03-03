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
exports.StripePaymentsService = void 0;
const common_1 = require("@nestjs/common");
const tenant_aware_prisma_service_1 = require("../prisma/tenant-aware-prisma.service");
const stripe_1 = require("stripe");
const translation_service_1 = require("../i18n/translation.service");
let StripePaymentsService = class StripePaymentsService {
    constructor(prisma, t) {
        this.prisma = prisma;
        this.t = t;
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2024-12-18.acacia',
        });
    }
    async createIntent(dto) {
        const { saleId, amount, currency = 'usd' } = dto;
        const sale = await this.prisma.client.sale.findUnique({ where: { id: saleId } });
        if (!sale)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Sale' }));
        try {
            const intent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency,
                metadata: { saleId, tenantId: this.prisma.tenantId || '' },
            });
            return this.prisma.client.stripePayment.create({
                data: {
                    tenantId: this.prisma.tenantId,
                    saleId,
                    paymentIntentId: intent.id,
                    clientSecret: intent.client_secret || '',
                    amount,
                    currency,
                    status: 'PENDING',
                },
            });
        }
        catch (error) {
            console.error('[StripePaymentsService] Error:', error);
            throw new common_1.InternalServerErrorException(this.t.translate('errors.payments.stripe_failed', 'EN'));
        }
    }
    async confirm(paymentIntentId) {
        const stripePayment = await this.prisma.client.stripePayment.findUnique({
            where: { paymentIntentId },
        });
        if (!stripePayment)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Stripe payment' }));
        if (stripePayment.status === 'SUCCEEDED')
            return stripePayment;
        try {
            const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
            if (intent.status !== 'succeeded') {
                throw new common_1.BadRequestException(`Payment not succeeded: ${intent.status}`);
            }
            return this.prisma.client.$transaction(async (tx) => {
                const sale = await tx.sale.findUnique({
                    where: { id: stripePayment.saleId },
                    include: { payments: true },
                });
                if (!sale)
                    throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Sale' }));
                const session = await tx.cashSession.findFirst({
                    where: { branchId: sale.branchId, status: 'OPEN' },
                });
                const payment = await tx.payment.create({
                    data: {
                        tenantId: this.prisma.tenantId,
                        saleId: stripePayment.saleId,
                        sessionId: session === null || session === void 0 ? void 0 : session.id,
                        amount: stripePayment.amount,
                        method: 'STRIPE',
                        reference: paymentIntentId,
                    },
                });
                const updated = await tx.stripePayment.update({
                    where: { id: stripePayment.id },
                    data: { status: 'SUCCEEDED', paymentId: payment.id, sessionId: session === null || session === void 0 ? void 0 : session.id },
                });
                const receiptNumber = `RCP-ST-${Date.now()}-${payment.id.slice(0, 4)}`.toUpperCase();
                await tx.receipt.create({
                    data: {
                        tenantId: this.prisma.tenantId,
                        paymentId: payment.id,
                        receiptNumber,
                        amount: stripePayment.amount,
                    },
                });
                const totalPaid = sale.payments.reduce((s, p) => s + Number(p.amount), 0) + Number(stripePayment.amount);
                if (totalPaid >= Number(sale.total)) {
                    await tx.invoice.update({ where: { saleId: stripePayment.saleId }, data: { status: 'PAID' } });
                }
                return updated;
            });
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException)
                throw error;
            console.error('[StripePaymentsService] Error:', error);
            throw new common_1.InternalServerErrorException(this.t.translate('errors.payments.stripe_failed', 'EN'));
        }
    }
    async findBySale(saleId) {
        return this.prisma.client.stripePayment.findFirst({
            where: { saleId },
            include: { payment: true },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.StripePaymentsService = StripePaymentsService;
exports.StripePaymentsService = StripePaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_aware_prisma_service_1.TenantAwarePrismaService,
        translation_service_1.TranslationService])
], StripePaymentsService);
//# sourceMappingURL=stripe-payments.service.js.map