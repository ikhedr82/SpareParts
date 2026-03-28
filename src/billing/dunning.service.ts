import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from './billing.service';
import { BillingEmailService } from './billing-email.service';

@Injectable()
export class DunningService {
  private readonly logger = new Logger(DunningService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly billingService: BillingService,
    private readonly emailService: BillingEmailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDunning() {
    this.logger.log('Starting daily dunning process...');

    const pastDueInvoices = await (this.prisma as any).billingInvoice.findMany({
      where: {
        status: 'ISSUED',
        dueDate: { lt: new Date() },
        dunningCount: { lt: 3 },
      },
      include: { tenant: true },
    });

    for (const invoice of pastDueInvoices) {
      await this.processDunningStep(invoice);
    }

    await this.checkGracePeriodExpirations();
  }

  private async processDunningStep(invoice: any) {
    this.logger.log(`Processing dunning for invoice ${invoice.invoiceNumber} (Tenant: ${invoice.tenantId})`);

    const subscription = await (this.prisma.subscription as any).findUnique({
      where: { tenantId: invoice.tenantId },
    });

    // 1. Increment dunning count
    await (this.prisma as any).billingInvoice.update({
      where: { id: invoice.id },
      data: {
        dunningCount: { increment: 1 },
        lastDunningAt: new Date(),
      },
    });

    // 2. Mock Email Notification
    this.logger.log(`[EMAIL SEND] To: ${invoice.tenant.billingEmail}, Subject: Payment Reminder for ${invoice.invoiceNumber}`);

    // 3. Grace Period Activation
    if (subscription && (subscription as any).gracePeriodDays > 0 && !(subscription as any).isGracePeriodActive) {
      this.logger.log(`Activating grace period for tenant ${invoice.tenantId}`);
      await (this.prisma.subscription as any).update({
        where: { id: subscription.id },
        data: { isGracePeriodActive: true, status: 'GRACE_PERIOD' as any },
      });
    }

    // 4. If count reaches 3 AND grace period is over (or doesn't exist), suspend tenant
    const isGraceOver = !subscription || !(subscription as any).isGracePeriodActive;
    
    if (invoice.dunningCount >= 2 && isGraceOver) {
      this.logger.warn(`Suspending tenant ${invoice.tenantId} due to unpaid invoice ${invoice.invoiceNumber}`);
      await (this.prisma.tenant as any).update({
        where: { id: invoice.tenantId },
        data: {
          status: 'SUSPENDED',
          suspensionReason: `Unpaid invoice ${invoice.invoiceNumber} after multiple attempts.`,
        },
      });

      await this.emailService.sendSuspendedEmail(invoice.tenantId, `Unpaid invoice ${invoice.invoiceNumber}`);

      await (this.prisma as any).billingAuditLog.create({
        data: {
          tenantId: invoice.tenantId,
          action: 'SUSPENSION',
          category: 'SUBSCRIPTION',
          message: `Tenant suspended due to unpaid invoice ${invoice.invoiceNumber}`,
          metadata: { invoiceId: invoice.id, dunningCount: invoice.dunningCount },
        },
      });
    }
  }

  private async checkGracePeriodExpirations() {
    const expiredGraceSubscriptions = await (this.prisma.subscription as any).findMany({
      where: {
        isGracePeriodActive: true,
        updatedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    for (const sub of expiredGraceSubscriptions) {
      this.logger.warn(`Grace period expired for tenant ${sub.tenantId}. Suspending.`);
      await (this.prisma.tenant as any).update({
        where: { id: sub.tenantId },
        data: {
          status: 'SUSPENDED',
          suspensionReason: `Grace period expired for unpaid invoices.`,
        },
      });

      await this.emailService.sendSuspendedEmail(sub.tenantId, 'Grace period expired');

      await (this.prisma as any).billingAuditLog.create({
        data: {
          tenantId: sub.tenantId,
          action: 'SUSPENSION',
          category: 'SUBSCRIPTION',
          message: `Tenant suspended after grace period expired.`,
          metadata: { subscriptionId: sub.id },
        },
      });

      await (this.prisma.subscription as any).update({
        where: { id: sub.id },
        data: { isGracePeriodActive: false, status: 'PAST_DUE' as any },
      });
    }
  }
}
