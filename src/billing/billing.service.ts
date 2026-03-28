import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeProvider } from './providers/stripe.provider';
import { PaymobProvider } from './providers/paymob.provider';
import { CheckoutSessionOptions } from './providers/payment-provider.interface';
import { BillingEmailService } from './billing-email.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeProvider,
    private readonly paymob: PaymobProvider,
    private readonly emailService: BillingEmailService,
  ) {}

  async createCheckout(tenantId: string, planId: string, provider: 'STRIPE' | 'PAYMOB') {
    const tenant = await (this.prisma.tenant as any).findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });

    if (!tenant) throw new NotFoundException('Tenant not found');

    const plan = await (this.prisma.plan as any).findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    const options: CheckoutSessionOptions = {
      tenantId,
      planId: provider === 'STRIPE' ? plan.id : plan.price.toString(),
      email: tenant.billingEmail || 'billing@partivo.com',
      currency: plan.currency,
      successUrl: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.FRONTEND_URL}/billing/cancel`,
    };

    const session = provider === 'STRIPE' 
      ? await this.stripe.createCheckoutSession(options)
      : await this.paymob.createCheckoutSession(options);

    return session;
  }

  private async recordWebhookEvent(provider: string, eventId: string, payload: any) {
    const existing = await (this.prisma as any).webhookEvent.findUnique({
      where: { eventId },
    });

    if (existing) {
      if (existing.status === 'PROCESSED') {
        this.logger.log(`Webhook ${eventId} already processed.`);
        return null;
      }
      return existing;
    }

    return (this.prisma as any).webhookEvent.create({
      data: {
        provider,
        eventId,
        payload,
        status: 'PENDING' as any,
      },
    });
  }

  async handleStripeWebhook(payload: any, signature: string) {
    const event = await this.stripe.handleWebhook(payload, signature);
    const eventId = event.id;
    const webhookRecord = await this.recordWebhookEvent('stripe', eventId, payload);
    
    if (!webhookRecord) return;

    try {
      const tenantId = (event.data.object as any).metadata?.tenantId;

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleSubscriptionCreated(tenantId, (event.data.object as any).subscription, 'STRIPE');
          break;
        case 'invoice.paid':
          await this.handleInvoicePaid(tenantId, (event.data.object as any).id, 'STRIPE');
          break;
        case 'invoice.payment_failed':
          await this.handleInvoiceFailed(tenantId, (event.data.object as any).id, 'STRIPE');
          break;
      }

      await (this.prisma as any).webhookEvent.update({
        where: { id: (webhookRecord as any).id },
        data: { status: 'PROCESSED' as any, processedAt: new Date() },
      });
    } catch (err) {
      this.logger.error(`Failed to process Stripe webhook ${eventId}: ${err.message}`);
      await (this.prisma as any).webhookEvent.update({
        where: { id: (webhookRecord as any).id },
        data: { status: 'FAILED' as any, error: err.message },
      });
      throw err;
    }
  }

  async handlePaymobWebhook(payload: any) {
    const eventId = payload.obj.id.toString();
    const webhookRecord = await this.recordWebhookEvent('paymob', eventId, payload);

    if (!webhookRecord) return;

    try {
      const isSuccess = payload.obj.success;
      const orderId = payload.obj.order.id.toString();
      const tenantId = payload.obj.extra_config?.tenant_id;

      if (isSuccess) {
        this.logger.log(`Paymob Payment Success: Order ${orderId}`);
        await this.handleInvoicePaid(tenantId, orderId, 'PAYMOB');
      } else {
        this.logger.warn(`Paymob Payment Failed: Order ${orderId}`);
        await this.handleInvoiceFailed(tenantId, orderId, 'PAYMOB');
      }

      await (this.prisma as any).webhookEvent.update({
        where: { id: (webhookRecord as any).id },
        data: { status: 'PROCESSED' as any, processedAt: new Date() },
      });
    } catch (err) {
      this.logger.error(`Failed to process Paymob webhook ${eventId}: ${err.message}`);
      await (this.prisma as any).webhookEvent.update({
        where: { id: (webhookRecord as any).id },
        data: { status: 'FAILED' as any, error: err.message },
      });
      throw err;
    }
  }

  async verifyPaymobTransaction(query: any) {
    const isSuccess = query.success === 'true';
    const orderId = query.order;
    
    if (isSuccess) {
      this.logger.log(`Paymob Transaction Verified Success: Order ${orderId}`);
      return { success: true, message: 'Payment verified successfully' };
    } else {
      this.logger.warn(`Paymob Transaction Verified Failed: Order ${orderId}`);
      return { success: false, message: 'Payment verification failed' };
    }
  }

  async getPlanStatus(tenantId: string) {
    const tenant = await (this.prisma.tenant as any).findUnique({
      where: { id: tenantId },
      include: {
        plan: true,
        subscription: {
          include: { plan: true }
        },
      },
    });

    if (!tenant) throw new NotFoundException('Tenant not found');

    const usage = { users: 2, branches: 1, products: 450, orders: 120 };
    const limits = tenant.plan?.limits as any || { maxUsers: 5, maxBranches: 2, maxProducts: 1000, maxOrders: 500 };

    return {
      plan: tenant.plan || { name: 'Free', price: 0 },
      status: tenant.subscription?.status || 'TRIAL',
      usage,
      limits,
      subscription: tenant.subscription,
    };
  }

  async getInvoicePdf(tenantId: string, invoiceId: string) {
    const invoice = await (this.prisma.billingInvoice as any).findFirst({
      where: { id: invoiceId, tenantId },
      include: { 
        tenant: true,
        subscription: {
          include: { plan: true }
        }
      },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    const { InvoiceGeneratorService } = require('./invoice-generator.service');
    const generator = new InvoiceGeneratorService();
    return generator.generateInvoicePdf(invoice);
  }

  async getInvoices(tenantId: string) {
    return (this.prisma as any).billingInvoice.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateSubscription(tenantId: string, newPlanId: string) {
    const subscription = await (this.prisma.subscription as any).findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!subscription) throw new NotFoundException('Subscription not found');

    const newPlan = await (this.prisma.plan as any).findUnique({ where: { id: newPlanId } });
    if (!newPlan) throw new NotFoundException('New plan not found');

    const isUpgrade = newPlan.price > subscription.plan.price;

    if (isUpgrade) {
      this.logger.log(`Upgrading tenant ${tenantId} to ${newPlan.name}`);
      
      await (this.prisma.subscription as any).update({
        where: { tenantId },
        data: { planId: newPlanId, status: 'ACTIVE' as any },
      });

      await (this.prisma as any).subscriptionChangeHistory.create({
        data: {
          tenantId,
          subscriptionId: subscription.id,
          fromPlanId: subscription.planId,
          toPlanId: newPlanId,
          type: 'UPGRADE',
          reason: 'Customer initiated upgrade',
        },
      });

    } else {
      this.logger.log(`Downgrading tenant ${tenantId} to ${newPlan.name} (deferred)`);
      
      await (this.prisma.subscription as any).update({
        where: { tenantId },
        data: { cancelAtPeriodEnd: false },
      });

      await (this.prisma as any).subscriptionChangeHistory.create({
        data: {
          tenantId,
          subscriptionId: subscription.id,
          fromPlanId: subscription.planId,
          toPlanId: newPlanId,
          type: 'DOWNGRADE',
          reason: 'Customer initiated downgrade (pending)',
          metadata: { effectiveAt: subscription.currentPeriodEnd },
        },
      });
    }

    return { success: true, isUpgrade };
  }

  private async handleSubscriptionCreated(tenantId: string, subscriptionId: string, provider: string) {
    await (this.prisma.subscription as any).upsert({
      where: { tenantId },
      update: {
        stripeSubscriptionId: provider === 'STRIPE' ? subscriptionId : undefined,
        paymobSubscriptionId: provider === 'PAYMOB' ? subscriptionId : undefined,
        status: 'ACTIVE' as any,
        provider,
      },
      create: {
        tenantId,
        planId: 'DEFAULT_PLAN_ID',
        stripeSubscriptionId: provider === 'STRIPE' ? subscriptionId : undefined,
        paymobSubscriptionId: provider === 'PAYMOB' ? subscriptionId : undefined,
        status: 'ACTIVE' as any,
        provider,
      },
    });
  }

  private async handleInvoicePaid(tenantId: string, providerInvoiceId: string, provider: string) {
    const where = provider === 'STRIPE' 
      ? { stripeInvoiceId: providerInvoiceId }
      : { paymobOrderId: providerInvoiceId };

    await (this.prisma.billingInvoice as any).updateMany({
      where: { ...where, tenantId },
      data: {
        status: 'PAID' as any,
        paidAt: new Date(),
      },
    });

    // Send Success Email
    const invoices = await (this.prisma.billingInvoice as any).findMany({ where: { ...where, tenantId } });
    for (const inv of invoices) {
      await this.emailService.sendPaymentSuccessEmail(tenantId, inv.invoiceNumber);
    }
  }

  private async handleInvoiceFailed(tenantId: string, providerInvoiceId: string, provider: string) {
    const where = provider === 'STRIPE' 
      ? { stripeInvoiceId: providerInvoiceId }
      : { paymobOrderId: providerInvoiceId };

    await (this.prisma.billingInvoice as any).updateMany({
      where: { ...where, tenantId },
      data: {
        status: 'FAILED' as any,
      },
    });

    // Send Failed Email
    const invoices = await (this.prisma.billingInvoice as any).findMany({ where: { ...where, tenantId } });
    for (const inv of invoices) {
      await this.emailService.sendPaymentFailedEmail(tenantId, inv.invoiceNumber);
      
      await (this.prisma as any).billingAuditLog.create({
        data: {
          tenantId,
          action: 'PAYMENT_FAILED',
          category: 'PAYMENT',
          message: `Payment failed for invoice ${inv.invoiceNumber} via ${provider}`,
          metadata: { invoiceId: inv.id, provider, providerInvoiceId },
        },
      });
    }
  }

  private async createInvoice(tenantId: string, subscriptionId: string, subtotal: number, currency: string) {
    const year = new Date().getFullYear();
    const tenant = await (this.prisma.tenant as any).findUnique({ where: { id: tenantId } });
    const vatPercentage = Number(tenant?.vatPercentage || 0);
    const taxAmount = subtotal * (vatPercentage / 100);
    const total = subtotal + taxAmount;

    const sequence = await (this.prisma as any).invoiceSequence.upsert({
      where: { 
        tenantId_year: { tenantId, year } 
      },
      update: { lastNumber: { increment: 1 } },
      create: { tenantId, year, lastNumber: 1 },
    });

    const invoiceNumber = `INV-${year}-${sequence.lastNumber.toString().padStart(6, '0')}`;

    const invoice = await (this.prisma.billingInvoice as any).create({
      data: {
        tenantId,
        subscriptionId,
        invoiceNumber,
        subtotal: subtotal,
        taxAmount: taxAmount,
        amount: total,
        currency,
        status: 'ISSUED' as any,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await this.emailService.sendInvoiceEmail(tenantId, invoiceNumber, `${total} ${currency}`);
    return invoice;
  }
}
