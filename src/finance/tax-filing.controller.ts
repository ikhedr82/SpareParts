import { Controller, Post, Patch, Get, Param, Body, Req, UseGuards, Query } from '@nestjs/common';
import { TaxFilingService } from './tax-filing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('finance/tax-filings')
export class TaxFilingController {
    constructor(private readonly service: TaxFilingService) { }

    @Post()
    async generate(@Req() req: any, @Body() body: { periodStart: string; periodEnd: string }) {
        return this.service.generateReport(req.user.tenantId, req.user.sub, body, req.correlationId);
    }

    @Get()
    async findAll(@Req() req: any, @Query('status') status?: any) {
        return this.service.findAll(req.user.tenantId, status);
    }

    @Get(':id')
    async findOne(@Req() req: any, @Param('id') id: string) {
        return this.service.findOne(req.user.tenantId, id);
    }

    @Patch(':id/file')
    async file(@Req() req: any, @Param('id') id: string) {
        return this.service.fileTaxReport(req.user.tenantId, id, req.user.sub, req.correlationId);
    }
}
