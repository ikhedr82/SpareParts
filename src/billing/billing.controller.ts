import { Controller, Post, Get, Body, Param, UseGuards, Request, Headers, RawBodyRequest } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(@Body() data: { planId: string; provider: 'STRIPE' | 'PAYMOB' }, @Request() req) {
    const tenantId = req.user.tenantId;
    return this.billingService.createCheckout(tenantId, data.planId, data.provider);
  }

  @Post('webhook/stripe')
  async stripeWebhook(@Body() payload: any, @Headers('stripe-signature') signature: string) {
    return this.billingService.handleStripeWebhook(payload, signature);
  }

  @Post('webhook/paymob')
  async paymobWebhook(@Body() payload: any) {
    return this.billingService.handlePaymobWebhook(payload);
  }

  @Get('verify/paymob')
  async verifyPaymob(@Request() req) {
    return this.billingService.verifyPaymobTransaction(req.query);
  }

  @Get('invoices')
  @UseGuards(JwtAuthGuard)
  async getInvoices(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.billingService.getInvoices(tenantId);
  }

  @Get('invoices/:id/pdf')
  @UseGuards(JwtAuthGuard)
  async getInvoicePdf(@Param('id') id: string, @Request() req) {
    const tenantId = req.user.tenantId;
    return this.billingService.getInvoicePdf(tenantId, id);
  }

  @Get('plan')
  @UseGuards(JwtAuthGuard)
  async getPlanStatus(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.billingService.getPlanStatus(tenantId);
  }
}
