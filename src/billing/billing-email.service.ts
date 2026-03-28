import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BillingEmailService {
  private readonly logger = new Logger(BillingEmailService.name);

  constructor(@InjectQueue('billing-emails') private emailQueue: Queue) {}

  async sendInvoiceEmail(tenantId: string, invoiceNumber: string, amount: string, language: 'EN' | 'AR' = 'EN') {
    await this.emailQueue.add('send-email', {
      tenantId,
      type: 'INVOICE_ISSUED',
      data: { invoiceNumber, amount },
      language,
    });
  }

  async sendPaymentSuccessEmail(tenantId: string, invoiceNumber: string, language: 'EN' | 'AR' = 'EN') {
    await this.emailQueue.add('send-email', {
      tenantId,
      type: 'PAYMENT_SUCCESS',
      data: { invoiceNumber },
      language,
    });
  }

  async sendPaymentFailedEmail(tenantId: string, invoiceNumber: string, language: 'EN' | 'AR' = 'EN') {
    await this.emailQueue.add('send-email', {
      tenantId,
      type: 'PAYMENT_FAILED',
      data: { invoiceNumber },
      language,
    });
  }

  async sendExpiringEmail(tenantId: string, daysLeft: number, language: 'EN' | 'AR' = 'EN') {
    await this.emailQueue.add('send-email', {
      tenantId,
      type: 'SUBSCRIPTION_EXPIRING',
      data: { daysLeft },
      language,
    });
  }

  async sendSuspendedEmail(tenantId: string, reason: string, language: 'EN' | 'AR' = 'EN') {
    await this.emailQueue.add('send-email', {
      tenantId,
      type: 'SUBSCRIPTION_SUSPENDED',
      data: { reason },
      language,
    });
  }
}
