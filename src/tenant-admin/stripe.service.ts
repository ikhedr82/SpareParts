import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StripeService {
    private stripe: Stripe;
    private readonly logger = new Logger(StripeService.name);

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        this.stripe = new Stripe(secretKey, {
            apiVersion: '2025-01-27-acacia' as any,
        });
    }

    async createCustomer(tenantId: string, email: string) {
        const customer = await this.stripe.customers.create({
            email,
            metadata: { tenantId },
        });

        await (this.prisma.tenant as any).update({
            where: { id: tenantId },
            data: {
                stripeCustomerId: customer.id,
                billingEmail: email
            },
        });

        return customer;
    }

    async createCheckoutSession(tenantId: string, priceId: string, successUrl: string, cancelUrl: string) {
        const tenant = await (this.prisma.tenant as any).findUnique({
            where: { id: tenantId },
        });

        if (!tenant) throw new Error('Tenant not found');

        let customerId = (tenant as any).stripeCustomerId;
        if (!customerId) {
            const customer = await this.createCustomer(tenantId, (tenant as any).billingEmail || 'billing@' + (tenant as any).subdomain + '.com');
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

    async createPortalSession(tenantId: string, returnUrl: string) {
        const tenant = await (this.prisma.tenant as any).findUnique({ where: { id: tenantId } });
        if (!(tenant as any)?.stripeCustomerId) throw new Error('No Stripe customer found');

        return this.stripe.billingPortal.sessions.create({
            customer: (tenant as any).stripeCustomerId,
            return_url: returnUrl,
        });
    }

    async constructEvent(payload: string, signature: string) {
        const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
        return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    }
}
