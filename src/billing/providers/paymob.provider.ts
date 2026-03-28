import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PaymentProvider, CheckoutSessionOptions, CheckoutSessionResponse } from './payment-provider.interface';

@Injectable()
export class PaymobProvider implements PaymentProvider {
  private readonly logger = new Logger(PaymobProvider.name);
  private readonly baseUrl = 'https://egypt.paymob.com/api';

  constructor(private readonly configService: ConfigService) {}

  private async getAuthToken(): Promise<string> {
    const apiKey = this.configService.get<string>('PAYMOB_API_KEY');
    const response = await axios.post(`${this.baseUrl}/auth/tokens`, {
      api_key: apiKey,
    });
    return response.data.token;
  }

  async createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResponse> {
    try {
      this.logger.log(`Creating Paymob checkout session for tenant: ${options.tenantId}`);
      const authToken = await this.getAuthToken();

      // 1. Register Order
      const orderResponse = await axios.post(`${this.baseUrl}/ecommerce/orders`, {
        auth_token: authToken,
        delivery_needed: 'false',
        amount_cents: Math.round(Number(options.planId) * 100), // Assuming planId is amount for Paymob if no PriceID
        currency: options.currency,
        items: [],
      });

      const orderId = orderResponse.data.id;

      // 2. Get Payment Key
      const integrationId = this.configService.get<number>('PAYMOB_INTEGRATION_ID');
      const paymentKeyResponse = await axios.post(`${this.baseUrl}/acceptance/payment_keys`, {
        auth_token: authToken,
        amount_cents: Math.round(Number(options.planId) * 100),
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          apartment: 'NA',
          email: options.email,
          floor: 'NA',
          first_name: 'Partivo',
          street: 'NA',
          building: 'NA',
          phone_number: 'NA',
          shipping_method: 'NA',
          postal_code: 'NA',
          city: 'NA',
          country: 'EG',
          last_name: 'Customer',
          state: 'NA',
        },
        currency: options.currency,
        integration_id: integrationId,
      });

      const paymentToken = paymentKeyResponse.data.token;
      const iframeId = this.configService.get<string>('PAYMOB_IFRAME_ID');

      return {
        sessionId: orderId.toString(),
        url: `https://egypt.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`,
      };
    } catch (err) {
      this.logger.error(`Paymob session creation failed: ${err.message}`);
      throw new Error(`Paymob error: ${err.response?.data?.message || err.message}`);
    }
  }

  async handleWebhook(payload: any, signature: string): Promise<void> {
    // Paymob HMAC verification logic here
    this.logger.log(`Handling Paymob webhook for order: ${payload.obj.order.id}`);
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    // Logic to stop recurring payments in Paymob
    this.logger.log(`Cancelling Paymob subscription: ${subscriptionId}`);
  }
}
