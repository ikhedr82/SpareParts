import { Controller, Post, Headers, Request, BadRequestException } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { BillingService } from './billing.service';

@Controller('api/webhooks/stripe')
export class StripeWebhookController {
    constructor(
        private readonly stripeService: StripeService,
        private readonly billingService: BillingService,
    ) { }

    @Post()
    async handleWebhook(@Headers('stripe-signature') signature: string, @Request() req) {
        if (!signature) {
            throw new BadRequestException('Missing stripe-signature header');
        }

        const rawBody = req.rawBody; // Note: You need to enable rawBody in NestJS main.ts
        let event;

        try {
            event = await this.stripeService.constructEvent(rawBody, signature);
        } catch (err) {
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }

        switch (event.type) {
            case 'invoice.payment_succeeded':
                await this.billingService.processStripePaymentSuccess(event.data.object);
                break;
            case 'invoice.payment_failed':
                await this.billingService.processStripePaymentFailure(event.data.object);
                break;
            case 'customer.subscription.updated':
                await this.billingService.processStripeSubscriptionUpdate(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await this.billingService.processStripeSubscriptionDeleted(event.data.object);
                break;
        }

        return { received: true };
    }
}
