import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { StripePaymentsService } from './stripe-payments.service';
import { CreateIntentDto } from './dto/create-intent.dto';

@Controller('stripe-payments')
export class StripePaymentsController {
    constructor(private readonly stripePaymentsService: StripePaymentsService) { }

    @Post('create-intent')
    createIntent(@Body() dto: CreateIntentDto) {
        return this.stripePaymentsService.createIntent(dto);
    }

    @Post('confirm')
    confirm(@Body() body: { paymentIntentId: string }) {
        return this.stripePaymentsService.confirm(body.paymentIntentId);
    }

    @Get('sale/:saleId')
    findBySale(@Param('saleId') saleId: string) {
        return this.stripePaymentsService.findBySale(saleId);
    }
}
