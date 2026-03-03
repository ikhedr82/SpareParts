import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
export declare class StripeService {
    private configService;
    private prisma;
    private stripe;
    private readonly logger;
    constructor(configService: ConfigService, prisma: PrismaService);
    createCustomer(tenantId: string, email: string): Promise<Stripe.Response<Stripe.Customer>>;
    createCheckoutSession(tenantId: string, priceId: string, successUrl: string, cancelUrl: string): Promise<Stripe.Response<Stripe.Checkout.Session>>;
    createPortalSession(tenantId: string, returnUrl: string): Promise<Stripe.Response<Stripe.BillingPortal.Session>>;
    constructEvent(payload: string, signature: string): Promise<Stripe.Event>;
}
