import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from './billing.service';

@Injectable()
export class WebhookRetryService {
  private readonly logger = new Logger(WebhookRetryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly billingService: BillingService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async retryFailedWebhooks() {
    this.logger.log('Checking for failed or pending webhook events...');

    const pendingEvents = await this.prisma.webhookEvent.findMany({
      where: {
        status: { in: ['PENDING', 'FAILED'] },
        createdAt: { lt: new Date(Date.now() - 15 * 60 * 1000) }, // Older than 15 mins
      },
      take: 50,
    });

    for (const event of pendingEvents) {
      this.logger.log(`Retrying webhook event ${event.eventId} (${event.provider})`);
      try {
        if (event.provider === 'stripe') {
          // Note: Stripe requires signature for handleWebhook, but for retry 
          // we might need a bypass or store the verified event.
          // For simplicity, we trigger the processing logic directly if payload is already verified.
          await this.billingService.handleStripeWebhook(event.payload, 'RETRY_BYPASS');
        } else if (event.provider === 'paymob') {
          await this.billingService.handlePaymobWebhook(event.payload);
        }
      } catch (err) {
        this.logger.error(`Retry failed for event ${event.eventId}: ${err.message}`);
      }
    }
  }
}
