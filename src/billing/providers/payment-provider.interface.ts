export interface CheckoutSessionOptions {
  tenantId: string;
  planId: string;
  email: string;
  successUrl: string;
  cancelUrl: string;
  currency: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface PaymentProvider {
  createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResponse>;
  handleWebhook(payload: any, signature: string): Promise<any>;
  cancelSubscription(subscriptionId: string): Promise<void>;
}
