import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Processor('billing-emails')
export class BillingEmailProcessor extends WorkerHost {
  private readonly logger = new Logger(BillingEmailProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { tenantId, type, data, language } = job.data;
    
    // In a real system, fetch more tenant data (email, name)
    const tenant = await (this.prisma as any).tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) return;

    const email = tenant.billingEmail || 'tenant@partivo.com';
    const emailContent = this.getTemplate(type, data, language);

    this.logger.log(`[EMAIL QUEUE] Sending ${type} to ${email} (Lang: ${language})`);
    this.logger.log(`Subject: ${emailContent.subject}`);
    this.logger.log(`Body: ${emailContent.body}`);

    return { sent: true, to: email };
  }

  private getTemplate(type: string, data: any, language: string) {
    const templates = {
      EN: {
        INVOICE_ISSUED: {
          subject: `Invoice Issued: ${data.invoiceNumber}`,
          body: `An invoice for ${data.amount} has been issued. Please pay by the due date.`,
        },
        PAYMENT_SUCCESS: {
          subject: `Payment Successful: ${data.invoiceNumber}`,
          body: `Thank you. Your payment for invoice ${data.invoiceNumber} has been received.`,
        },
        PAYMENT_FAILED: {
          subject: `Payment Failed: ${data.invoiceNumber}`,
          body: `Urgent: Payment for invoice ${data.invoiceNumber} failed. Please update your payment method.`,
        },
        SUBSCRIPTION_EXPIRING: {
          subject: `Subscription Expiring soon`,
          body: `Your subscription will expire in ${data.daysLeft} days.`,
        },
        SUBSCRIPTION_SUSPENDED: {
          subject: `Service Suspended`,
          body: `Your service has been suspended due to: ${data.reason}.`,
        },
      },
      AR: {
        INVOICE_ISSUED: {
          subject: `تم إصدار الفاتورة: ${data.invoiceNumber}`,
          body: `تم إصدار فاتورة بمبلغ ${data.amount}. يرجى السداد في موعده.`,
        },
        PAYMENT_SUCCESS: {
          subject: `تم نجاح الدفع: ${data.invoiceNumber}`,
          body: `شكراً لك. تم استلام دفعتك للفاتورة ${data.invoiceNumber}.`,
        },
        PAYMENT_FAILED: {
          subject: `فشل الدفع: ${data.invoiceNumber}`,
          body: `هام: فشل دفع الفاتورة ${data.invoiceNumber}. يرجى تحديث طريقة الدفع.`,
        },
        SUBSCRIPTION_EXPIRING: {
          subject: `قرب انتهاء الاشتراك`,
          body: `سينتهي اشتراكك خلال ${data.daysLeft} أيام.`,
        },
        SUBSCRIPTION_SUSPENDED: {
          subject: `تم تعليق الخدمة`,
          body: `تم تعليق الخدمة بسبب: ${data.reason}.`,
        },
      },
    };

    return templates[language][type] || templates['EN'][type];
  }
}
