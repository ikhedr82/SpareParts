import { StripeService } from './stripe.service';
import { BillingService } from './billing.service';
export declare class StripeWebhookController {
    private readonly stripeService;
    private readonly billingService;
    constructor(stripeService: StripeService, billingService: BillingService);
    handleWebhook(signature: string, req: any): Promise<{
        received: boolean;
    }>;
}
