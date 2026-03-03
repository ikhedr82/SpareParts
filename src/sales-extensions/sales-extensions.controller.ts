import { Controller, Post, Get, Body, UseGuards, Param, Req } from '@nestjs/common';
import { AuthGuard, Roles, Permissions } from '../shared/auth.guard';
import { SalesExtensionsService } from './sales-extensions.service';
import { QuoteService } from './quote.service';
import { VoidSaleDto } from './dtos/void-sale.dto';
import { CreateQuoteDto } from './dtos/create-quote.dto';

class RejectQuoteDto {
    reason: string;
}

@Controller('api/v1/sales-extensions')
@UseGuards(AuthGuard)
export class SalesExtensionsController {
    constructor(
        private readonly salesService: SalesExtensionsService,
        private readonly quoteService: QuoteService,
    ) { }

    // ─── Void Sale ──────────────────────────────────────────────────────────────
    @Post('sales/:id/void')
    @Roles('Manager', 'Admin')
    @Permissions('VOID_SALE')
    async voidSale(@Req() req, @Param('id') saleId: string, @Body() dto: VoidSaleDto) {
        return this.salesService.voidSale(req.user.tenantId, req.user.id, saleId, dto);
    }

    // ─── Quote CRUD ─────────────────────────────────────────────────────────────
    @Get('quotes')
    @Roles('Sales', 'Admin', 'Manager')
    @Permissions('MANAGE_QUOTES')
    async listQuotes(@Req() req) {
        return this.quoteService.findAll(req.user.tenantId);
    }

    @Get('quotes/:id')
    @Roles('Sales', 'Admin', 'Manager')
    @Permissions('MANAGE_QUOTES')
    async getQuote(@Req() req, @Param('id') id: string) {
        return this.quoteService.findOne(req.user.tenantId, id);
    }

    @Post('quotes')
    @Roles('Sales', 'Admin')
    @Permissions('MANAGE_QUOTES')
    async createQuote(@Req() req, @Body() dto: CreateQuoteDto) {
        return this.quoteService.createQuote(req.user.tenantId, req.user.id, dto);
    }

    // ─── G-06: Quote Lifecycle ──────────────────────────────────────────────────
    @Post('quotes/:id/send')
    @Roles('Sales', 'Admin')
    @Permissions('MANAGE_QUOTES')
    async sendQuote(@Req() req, @Param('id') id: string) {
        return this.quoteService.sendQuote(req.user.tenantId, req.user.id, id);
    }

    @Post('quotes/:id/accept')
    @Roles('Sales', 'Admin', 'Manager')
    @Permissions('MANAGE_QUOTES')
    async acceptQuote(@Req() req, @Param('id') id: string) {
        return this.quoteService.acceptQuote(req.user.tenantId, req.user.id, id);
    }

    @Post('quotes/:id/reject')
    @Roles('Admin', 'Manager', 'Sales')
    @Permissions('MANAGE_QUOTES')
    async rejectQuote(@Req() req, @Param('id') id: string, @Body() dto: RejectQuoteDto) {
        return this.quoteService.rejectQuote(req.user.tenantId, req.user.id, id, dto.reason);
    }

    @Post('quotes/:id/convert')
    @Roles('Sales', 'Admin')
    @Permissions('MANAGE_QUOTES')
    async convertToOrder(@Req() req, @Param('id') id: string) {
        return this.quoteService.convertToOrder(req.user.tenantId, req.user.id, id);
    }
}
