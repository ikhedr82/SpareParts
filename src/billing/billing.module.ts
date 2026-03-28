import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { StripeProvider } from './providers/stripe.provider';
import { PaymobProvider } from './providers/paymob.provider';
import { InvoiceGeneratorService } from './invoice-generator.service';
import { DunningService } from './dunning.service';
import { SharedModule } from '../shared/shared.module';
import { BullModule } from '@nestjs/bullmq';
import { BillingEmailService } from './billing-email.service';
import { BillingEmailProcessor } from './billing-email.processor';
import { WebhookRetryService } from './webhook-retry.service';

@Module({
  imports: [
    SharedModule,
    BullModule.registerQueue({
      name: 'billing-emails',
    }),
  ],
  controllers: [BillingController],
  providers: [
    BillingService,
    StripeProvider,
    PaymobProvider,
    InvoiceGeneratorService,
    DunningService,
    BillingEmailService,
    BillingEmailProcessor,
    WebhookRetryService,
  ],
  exports: [BillingService],
})
export class BillingModule {}
