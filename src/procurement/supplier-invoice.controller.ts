import { Controller, Post, Patch, Get, Param, Body, Req, UseGuards, Query } from '@nestjs/common';
import { SupplierInvoiceService } from './supplier-invoice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('procurement/supplier-invoices')
export class SupplierInvoiceController {
    constructor(private readonly service: SupplierInvoiceService) { }

    @Post()
    async create(@Req() req: any, @Body() body: any) {
        return this.service.createInvoice(req.user.tenantId, req.user.sub, body, req.correlationId);
    }

    @Get()
    async findAll(@Req() req: any, @Query('status') status?: any) {
        return this.service.findAll(req.user.tenantId, status);
    }

    @Get(':id')
    async findOne(@Req() req: any, @Param('id') id: string) {
        return this.service.findOne(req.user.tenantId, id);
    }

    @Patch(':id/match')
    async match(@Req() req: any, @Param('id') id: string) {
        return this.service.matchInvoice(req.user.tenantId, id, req.user.sub, req.correlationId);
    }

    @Patch(':id/post')
    async post(@Req() req: any, @Param('id') id: string) {
        return this.service.postInvoice(req.user.tenantId, id, req.user.sub, req.correlationId);
    }
}
