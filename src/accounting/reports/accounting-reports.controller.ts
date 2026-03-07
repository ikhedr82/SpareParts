import { Controller, Get, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { AccountingReportsService } from './accounting-reports.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { RequirePermissions } from '../../auth/permissions.decorator';

@Controller('accounting/reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AccountingReportsController {
    constructor(private readonly reportsService: AccountingReportsService) { }

    @Get('trial-balance')
    async getTrialBalance(@Query('from') from: string, @Query('to') to: string) {
        if (!from || !to) throw new BadRequestException('From and To dates are required');
        return this.reportsService.getTrialBalance(new Date(from), new Date(to));
    }

    @Get('income-statement')
    async getIncomeStatement(@Query('from') from: string, @Query('to') to: string) {
        if (!from || !to) throw new BadRequestException('From and To dates are required');
        return this.reportsService.getIncomeStatement(new Date(from), new Date(to));
    }

    @Get('balance-sheet')
    async getBalanceSheet(@Query('asOf') asOf: string) {
        if (!asOf) throw new BadRequestException('AsOf date is required');
        return this.reportsService.getBalanceSheet(new Date(asOf));
    }

    @Get('cash-flow')
    async getCashFlow(@Query('from') from: string, @Query('to') to: string) {
        if (!from || !to) throw new BadRequestException('From and To dates are required');
        return this.reportsService.getCashFlow(new Date(from), new Date(to));
    }
}
