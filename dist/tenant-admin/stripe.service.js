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
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
const prisma_service_1 = require("../prisma/prisma.service");
let StripeService = StripeService_1 = class StripeService {
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(StripeService_1.name);
        const secretKey = this.configService.get('STRIPE_SECRET_KEY');
        this.stripe = new stripe_1.default(secretKey, {
            apiVersion: '2025-01-27-acacia',
        });
    }
    async createCustomer(tenantId, email) {
        const customer = await this.stripe.customers.create({
            email,
            metadata: { tenantId },
        });
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                stripeCustomerId: customer.id,
                billingEmail: email
            },
        });
        return customer;
    }
    async createCheckoutSession(tenantId, priceId, successUrl, cancelUrl) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });
        if (!tenant)
            throw new Error('Tenant not found');
        let customerId = tenant.stripeCustomerId;
        if (!customerId) {
            const customer = await this.createCustomer(tenantId, tenant.billingEmail || 'billing@' + tenant.subdomain + '.com');
            customerId = customer.id;
        }
        const session = await this.stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: { tenantId },
        });
        return session;
    }
    async createPortalSession(tenantId, returnUrl) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!(tenant === null || tenant === void 0 ? void 0 : tenant.stripeCustomerId))
            throw new Error('No Stripe customer found');
        return this.stripe.billingPortal.sessions.create({
            customer: tenant.stripeCustomerId,
            return_url: returnUrl,
        });
    }
    async constructEvent(payload, signature) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map