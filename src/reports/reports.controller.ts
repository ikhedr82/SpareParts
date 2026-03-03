import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { Req } from '@nestjs/common';

@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('vat')
    @RequirePermissions('VIEW_REPORTS')
    async getVatReport(@Req() req: any, @Query('startDate') startDate: string, @Query('endDate') endDate: string) {
        return this.reportsService.getVatReport(req.user.tenantId, new Date(startDate), new Date(endDate));
    }

    @Get('profit-loss')
    @RequirePermissions('VIEW_REPORTS')
    async getProfitLoss(@Req() req: any, @Query('startDate') startDate: string, @Query('endDate') endDate: string) {
        return this.reportsService.getProfitLoss(req.user.tenantId, new Date(startDate), new Date(endDate));
    }

    @Get('aging')
    @RequirePermissions('VIEW_REPORTS')
    async getAgingReport(@Req() req: any, @Query('type') type: 'CUSTOMER' | 'SUPPLIER') {
        return this.reportsService.getAgingReport(req.user.tenantId, type);
    }
}
