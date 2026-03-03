import { BillingService } from './billing.service';
import { BillingCycle } from '@prisma/client';
export declare class BillingController {
    private readonly billingService;
    constructor(billingService: BillingService);
    getInvoice(id: string): Promise<any>;
    pay(dto: {
        subscriptionId: string;
        amount: number;
    }): Promise<any>;
    upgrade(req: any, dto: {
        planId: string;
        cycle: BillingCycle;
    }): Promise<any>;
    createCheckoutSession(req: any, dto: {
        priceId: string;
    }): Promise<import("stripe").Stripe.Response<import("stripe").Stripe.Checkout.Session>>;
    getPortal(req: any): Promise<import("stripe").Stripe.Response<import("stripe").Stripe.BillingPortal.Session>>;
    getHistory(req: any): Promise<any>;
}
