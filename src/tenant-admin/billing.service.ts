import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BillingCycle } from '@prisma/client';
import { StripeService } from './stripe.service';

@Injectable()
export class BillingService {
    constructor(
        private prisma: PrismaService,
        private stripeService: StripeService,
    ) { }

    async generateInvoice(subscriptionId: string) {
        const sub = await (this.prisma as any).subscription.findUnique({
            where: { id: subscriptionId },
            include: { plan: true, tenant: true },
        });

        if (!sub) throw new NotFoundException('Subscription not found');

        const amount = (sub as any).billingCycle === 'MONTHLY' ? sub.plan.price : sub.plan.price.mul(12).mul(0.9);

        // Persistent record
        return (this.prisma as any).billingInvoice.create({
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

    async createStripeCheckout(tenantId: string, priceId: string, successUrl: string, cancelUrl: string) {
        return this.stripeService.createCheckoutSession(tenantId, priceId, successUrl, cancelUrl);
    }

    async createStripePortal(tenantId: string, returnUrl: string) {
        return this.stripeService.createPortalSession(tenantId, returnUrl);
    }

    async getBillingHistory(tenantId: string) {
        return (this.prisma as any).billingInvoice.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async logBillingEvent(tenantId: string, type: any, metadata: any) {
        return (this.prisma as any).billingEvent.create({
            data: {
                tenantId,
                type,
                metadata: metadata || {},
            }
        });
    }

    async applyPayment(subscriptionId: string, amount: number) {
        const sub = await (this.prisma as any).subscription.findUnique({
            where: { id: subscriptionId },
        });

        if (!sub) throw new NotFoundException('Subscription not found');

        await this.logBillingEvent((sub as any).tenantId, 'PAYMENT_SUCCESS', { amount, subscriptionId });

        return (this.prisma as any).subscription.update({
            where: { id: subscriptionId },
            data: {
                status: 'ACTIVE',
                startDate: new Date(),
                endDate: (sub as any).billingCycle === 'MONTHLY'
                    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
        });
    }

    async handleRenewal(subscriptionId: string) {
        const sub = await (this.prisma as any).subscription.findUnique({
            where: { id: subscriptionId },
        });

        if (!sub) throw new NotFoundException('Subscription not found');
        if (!(sub as any).autoRenew) return;

        return this.applyPayment(subscriptionId, 0);
    }

    async processStripePaymentSuccess(stripeInvoice: any) {
        const stripeSubscriptionId = stripeInvoice.subscription as string;
        const sub = await (this.prisma as any).subscription.findFirst({
            where: { stripeSubscriptionId },
        });

        if (!sub) return;

        await (this.prisma as any).billingInvoice.upsert({
            where: { id: stripeInvoice.id || 'new' }, // Using stripe id for mapping
            update: { status: 'PAID', paidAt: new Date() },
            create: {
                tenantId: (sub as any).tenantId,
                subscriptionId: (sub as any).id,
                amount: stripeInvoice.amount_paid / 100,
                currency: stripeInvoice.currency.toUpperCase(),
                status: 'PAID',
                dueDate: new Date(),
                paidAt: new Date(),
                stripeInvoiceId: stripeInvoice.id,
            },
        });

        await (this.prisma as any).subscription.update({
            where: { id: (sub as any).id },
            data: {
                status: 'ACTIVE',
                currentPeriodEnd: new Date(stripeInvoice.period_end * 1000)
            },
        });

        // Reactivate tenant if they were suspended due to dunning
        const tenant = await this.prisma.tenant.findUnique({ where: { id: (sub as any).tenantId } });
        if (tenant?.status === 'SUSPENDED' && tenant.suspensionReason?.includes('Dunning')) {
            await this.prisma.tenant.update({
                where: { id: (sub as any).tenantId },
                data: { status: 'ACTIVE', suspensionReason: null }
            });
        }

        await this.logBillingEvent((sub as any).tenantId, 'PAYMENT_SUCCESS', { stripeInvoiceId: stripeInvoice.id });
    }

    async processStripePaymentFailure(stripeInvoice: any) {
        const stripeSubscriptionId = stripeInvoice.subscription as string;
        const sub = await (this.prisma as any).subscription.findFirst({
            where: { stripeSubscriptionId },
        });

        if (!sub) return;

        await (this.prisma as any).subscription.update({
            where: { id: (sub as any).id },
            data: { status: 'PAST_DUE' },
        });

        await this.logBillingEvent((sub as any).tenantId, 'PAYMENT_FAILED', {
            stripeInvoiceId: stripeInvoice.id,
            attempt: stripeInvoice.attempt_count
        });

        // Dunning Threshold: Suspend tenant after 3 failed attempts
        if (stripeInvoice.attempt_count >= 3) {
            await this.prisma.tenant.update({
                where: { id: (sub as any).tenantId },
                data: {
                    status: 'SUSPENDED',
                    suspensionReason: 'Payment failure limit reached (Dunning threshold exceeded)'
                }
            });

            await this.logBillingEvent((sub as any).tenantId, 'TENANT_SUSPENDED', {
                reason: 'Dunning Fail',
                invoiceId: stripeInvoice.id
            });
        }
    }

    async processStripeSubscriptionUpdate(stripeSub: any) {
        const tenantId = stripeSub.metadata?.tenantId;
        if (!tenantId) return;

        await (this.prisma as any).subscription.update({
            where: { tenantId },
            data: {
                stripeSubscriptionId: stripeSub.id,
                currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
                status: this.mapStripeStatus(stripeSub.status),
            }
        });
    }

    async processStripeSubscriptionDeleted(stripeSub: any) {
        const tenantId = stripeSub.metadata?.tenantId;
        if (!tenantId) return;

        await (this.prisma as any).subscription.update({
            where: { tenantId },
            data: { status: 'CANCELED' }
        });
    }

    private mapStripeStatus(status: string): string {
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

    async handlePlanChange(tenantId: string, newPlanId: string, cycle: BillingCycle) {
        const sub = await (this.prisma as any).subscription.findUnique({
            where: { tenantId },
            include: { plan: true },
        });

        if (!sub) throw new NotFoundException('Subscription not found');

        const newPlan = await this.prisma.plan.findUnique({ where: { id: newPlanId } });
        if (!newPlan) throw new NotFoundException('New plan not found');

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

        return (this.prisma as any).subscription.update({
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
}
