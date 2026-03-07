import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BillingCycle } from '@prisma/client';

@Controller('api/tenant/billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
    constructor(private readonly billingService: BillingService) { }

    @Get('invoice/:id')
    async getInvoice(@Param('id') id: string) {
        return this.billingService.generateInvoice(id);
    }

    @Post('pay')
    async pay(@Body() dto: { subscriptionId: string, amount: number }) {
        return this.billingService.applyPayment(dto.subscriptionId, dto.amount);
    }

    @Post('upgrade')
    async upgrade(@Request() req, @Body() dto: { planId: string, cycle: BillingCycle }) {
        return this.billingService.handlePlanChange(req.user.tenantId, dto.planId, dto.cycle);
    }

    @Post('create-checkout-session')
    async createCheckoutSession(@Request() req, @Body() dto: { priceId: string }) {
        // success/cancel urls would ideally come from the frontend or config
        const successUrl = `${process.env.frontend_url || 'http://localhost:3000'}/tenant/billing?success=true`;
        const cancelUrl = `${process.env.frontend_url || 'http://localhost:3000'}/tenant/billing?canceled=true`;
        return this.billingService.createStripeCheckout(req.user.tenantId, dto.priceId, successUrl, cancelUrl);
    }

    @Get('portal')
    async getPortal(@Request() req) {
        const returnUrl = `${process.env.frontend_url || 'http://localhost:3000'}/tenant/billing`;
        return this.billingService.createStripePortal(req.user.tenantId, returnUrl);
    }

    @Get('history')
    async getHistory(@Request() req) {
        return this.billingService.getBillingHistory(req.user.tenantId);
    }
}
