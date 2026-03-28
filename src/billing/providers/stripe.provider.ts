import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentProvider, CheckoutSessionOptions, CheckoutSessionResponse } from './payment-provider.interface';

@Injectable()
export class StripeProvider implements PaymentProvider {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeProvider.name);

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-01-27' as any,
    });
  }

  async createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResponse> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: options.planId, // This assumes planId is the Stripe Price ID
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      customer_email: options.email,
      metadata: {
        tenantId: options.tenantId,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async handleWebhook(payload: any, signature: string): Promise<any> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new Error('Invalid signature');
    }

    this.logger.log(`Handling Stripe event: ${event.type}`);
    return event;
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
}
