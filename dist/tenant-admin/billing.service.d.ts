import { PrismaService } from '../prisma/prisma.service';
import { BillingCycle } from '@prisma/client';
import { StripeService } from './stripe.service';
export declare class BillingService {
    private prisma;
    private stripeService;
    constructor(prisma: PrismaService, stripeService: StripeService);
    generateInvoice(subscriptionId: string): Promise<any>;
    createStripeCheckout(tenantId: string, priceId: string, successUrl: string, cancelUrl: string): Promise<import("stripe").Stripe.Response<import("stripe").Stripe.Checkout.Session>>;
    createStripePortal(tenantId: string, returnUrl: string): Promise<import("stripe").Stripe.Response<import("stripe").Stripe.BillingPortal.Session>>;
    getBillingHistory(tenantId: string): Promise<any>;
    logBillingEvent(tenantId: string, type: any, metadata: any): Promise<any>;
    applyPayment(subscriptionId: string, amount: number): Promise<any>;
    handleRenewal(subscriptionId: string): Promise<any>;
    processStripePaymentSuccess(stripeInvoice: any): Promise<void>;
    processStripePaymentFailure(stripeInvoice: any): Promise<void>;
    processStripeSubscriptionUpdate(stripeSub: any): Promise<void>;
    processStripeSubscriptionDeleted(stripeSub: any): Promise<void>;
    private mapStripeStatus;
    handlePlanChange(tenantId: string, newPlanId: string, cycle: BillingCycle): Promise<any>;
}
