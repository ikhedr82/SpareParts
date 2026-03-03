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
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const stripe_service_1 = require("./stripe.service");
let BillingService = class BillingService {
    constructor(prisma, stripeService) {
        this.prisma = prisma;
        this.stripeService = stripeService;
    }
    async generateInvoice(subscriptionId) {
        const sub = await this.prisma.subscription.findUnique({
            where: { id: subscriptionId },
            include: { plan: true, tenant: true },
        });
        if (!sub)
            throw new common_1.NotFoundException('Subscription not found');
        const amount = sub.billingCycle === 'MONTHLY' ? sub.plan.price : sub.plan.price.mul(12).mul(0.9);
        return this.prisma.billingInvoice.create({
            data: {
                tenantId: sub.tenantId,
                subscriptionId: sub.id,
                amount,
                currency: sub.plan.currency,
                status: 'ISSUED',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            }
        });
    }
    async createStripeCheckout(tenantId, priceId, successUrl, cancelUrl) {
        return this.stripeService.createCheckoutSession(tenantId, priceId, successUrl, cancelUrl);
    }
    async createStripePortal(tenantId, returnUrl) {
        return this.stripeService.createPortalSession(tenantId, returnUrl);
    }
    async getBillingHistory(tenantId) {
        return this.prisma.billingInvoice.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async logBillingEvent(tenantId, type, metadata) {
        return this.prisma.billingEvent.create({
            data: {
                tenantId,
                type,
                metadata: metadata || {},
            }
        });
    }
    async applyPayment(subscriptionId, amount) {
        const sub = await this.prisma.subscription.findUnique({
            where: { id: subscriptionId },
        });
        if (!sub)
            throw new common_1.NotFoundException('Subscription not found');
        await this.logBillingEvent(sub.tenantId, 'PAYMENT_SUCCESS', { amount, subscriptionId });
        return this.prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
                status: 'ACTIVE',
                startDate: new Date(),
                endDate: sub.billingCycle === 'MONTHLY'
                    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
        });
    }
    async handleRenewal(subscriptionId) {
        const sub = await this.prisma.subscription.findUnique({
            where: { id: subscriptionId },
        });
        if (!sub)
            throw new common_1.NotFoundException('Subscription not found');
        if (!sub.autoRenew)
            return;
        return this.applyPayment(subscriptionId, 0);
    }
    async processStripePaymentSuccess(stripeInvoice) {
        var _a;
        const stripeSubscriptionId = stripeInvoice.subscription;
        const sub = await this.prisma.subscription.findFirst({
            where: { stripeSubscriptionId },
        });
        if (!sub)
            return;
        await this.prisma.billingInvoice.upsert({
            where: { id: stripeInvoice.id || 'new' },
            update: { status: 'PAID', paidAt: new Date() },
            create: {
                tenantId: sub.tenantId,
                subscriptionId: sub.id,
                amount: stripeInvoice.amount_paid / 100,
                currency: stripeInvoice.currency.toUpperCase(),
                status: 'PAID',
                dueDate: new Date(),
                paidAt: new Date(),
                stripeInvoiceId: stripeInvoice.id,
            },
        });
        await this.prisma.subscription.update({
            where: { id: sub.id },
            data: {
                status: 'ACTIVE',
                currentPeriodEnd: new Date(stripeInvoice.period_end * 1000)
            },
        });
        const tenant = await this.prisma.tenant.findUnique({ where: { id: sub.tenantId } });
        if ((tenant === null || tenant === void 0 ? void 0 : tenant.status) === 'SUSPENDED' && ((_a = tenant.suspensionReason) === null || _a === void 0 ? void 0 : _a.includes('Dunning'))) {
            await this.prisma.tenant.update({
                where: { id: sub.tenantId },
                data: { status: 'ACTIVE', suspensionReason: null }
            });
        }
        await this.logBillingEvent(sub.tenantId, 'PAYMENT_SUCCESS', { stripeInvoiceId: stripeInvoice.id });
    }
    async processStripePaymentFailure(stripeInvoice) {
        const stripeSubscriptionId = stripeInvoice.subscription;
        const sub = await this.prisma.subscription.findFirst({
            where: { stripeSubscriptionId },
        });
        if (!sub)
            return;
        await this.prisma.subscription.update({
            where: { id: sub.id },
            data: { status: 'PAST_DUE' },
        });
        await this.logBillingEvent(sub.tenantId, 'PAYMENT_FAILED', {
            stripeInvoiceId: stripeInvoice.id,
            attempt: stripeInvoice.attempt_count
        });
        if (stripeInvoice.attempt_count >= 3) {
            await this.prisma.tenant.update({
                where: { id: sub.tenantId },
                data: {
                    status: 'SUSPENDED',
                    suspensionReason: 'Payment failure limit reached (Dunning threshold exceeded)'
                }
            });
            await this.logBillingEvent(sub.tenantId, 'TENANT_SUSPENDED', {
                reason: 'Dunning Fail',
                invoiceId: stripeInvoice.id
            });
        }
    }
    async processStripeSubscriptionUpdate(stripeSub) {
        var _a;
        const tenantId = (_a = stripeSub.metadata) === null || _a === void 0 ? void 0 : _a.tenantId;
        if (!tenantId)
            return;
        await this.prisma.subscription.update({
            where: { tenantId },
            data: {
                stripeSubscriptionId: stripeSub.id,
                currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
                status: this.mapStripeStatus(stripeSub.status),
            }
        });
    }
    async processStripeSubscriptionDeleted(stripeSub) {
        var _a;
        const tenantId = (_a = stripeSub.metadata) === null || _a === void 0 ? void 0 : _a.tenantId;
        if (!tenantId)
            return;
        await this.prisma.subscription.update({
            where: { tenantId },
            data: { status: 'CANCELED' }
        });
    }
    mapStripeStatus(status) {
        switch (status) {
            case 'active': return 'ACTIVE';
            case 'trialing': return 'TRIAL';
            case 'past_due':
            case 'unpaid': return 'PAST_DUE';
            case 'canceled':
            case 'incomplete_expired': return 'CANCELED';
            default: return 'ACTIVE';
        }
    }
    async handlePlanChange(tenantId, newPlanId, cycle) {
        const sub = await this.prisma.subscription.findUnique({
            where: { tenantId },
            include: { plan: true },
        });
        if (!sub)
            throw new common_1.NotFoundException('Subscription not found');
        const newPlan = await this.prisma.plan.findUnique({ where: { id: newPlanId } });
        if (!newPlan)
            throw new common_1.NotFoundException('New plan not found');
        const now = new Date();
        const totalDuration = sub.endDate.getTime() - sub.startDate.getTime();
        const elapsed = now.getTime() - sub.startDate.getTime();
        const remainingRatio = Math.max(0, 1 - (elapsed / totalDuration));
        const currentPrice = Number(sub.plan.price);
        const unusedValue = currentPrice * remainingRatio;
        await this.logBillingEvent(tenantId, unusedValue > 0 ? 'UPGRADE' : 'DOWNGRADE', {
            from: sub.planId,
            to: newPlanId,
            unusedValue
        });
        return this.prisma.subscription.update({
            where: { id: sub.id },
            data: {
                planId: newPlanId,
                billingCycle: cycle,
                startDate: now,
                endDate: cycle === 'MONTHLY'
                    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                status: 'ACTIVE',
            },
        });
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stripe_service_1.StripeService])
], BillingService);
//# sourceMappingURL=billing.service.js.map