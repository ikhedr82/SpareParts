import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlanEnforcementService } from '../tenant-admin/plan-enforcement.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AnalyticsController {
    constructor(
        private readonly analyticsService: AnalyticsService,
        private readonly planEnforcement: PlanEnforcementService,
    ) { }

    @Get()
    @RequirePermissions('VIEW_ANALYTICS')
    async getUnifiedDashboard(@Query('branchId') branchId?: string, @Request() req?) {
        if (req?.user?.tenantId) {
            await this.planEnforcement.checkFeatureAccess(req.user.tenantId, 'advancedReports');
        }

        const [kpis, trend, topProducts] = await Promise.all([
            this.analyticsService.getDashboardKPIs(branchId),
            this.analyticsService.getSalesReports('daily', branchId),
            this.analyticsService.getInventoryReport(branchId)
        ]);

        return {
            kpis: kpis.kpis,
            revenueTrend: trend.map(t => ({ period: t.date, revenue: t.total })),
            topProducts: topProducts.map(p => ({ name: p.name, sold: p.quantitySold, revenue: 0 })), // Revenue calculation if available
            salesByBranch: [] // Placeholder if branch breakdown not yet implemented
        };
    }

    @Get('dashboard')
    @RequirePermissions('VIEW_ANALYTICS')
    async getDashboard(@Query('branchId') branchId?: string, @Request() req?) {
        if (req?.user?.tenantId) {
            await this.planEnforcement.checkFeatureAccess(req.user.tenantId, 'advancedReports');
        }
        return this.analyticsService.getDashboardKPIs(branchId);
    }

    @Get('sales')
    async getSales(
        @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'daily',
        @Query('branchId') branchId?: string,
        @Request() req?,
    ) {
        if (req?.user?.tenantId) {
            await this.planEnforcement.checkFeatureAccess(req.user.tenantId, 'advancedReports');
        }
        return this.analyticsService.getSalesReports(period, branchId);
    }

    @Get('inventory')
    @RequirePermissions('VIEW_INVENTORY')
    async getInventory(@Query('branchId') branchId?: string, @Request() req?) {
        if (req?.user?.tenantId) {
            await this.planEnforcement.checkFeatureAccess(req.user.tenantId, 'advancedReports');
        }
        return this.analyticsService.getInventoryReport(branchId);
    }

    @Get('cash-flow')
    async getCashFlow(@Query('branchId') branchId?: string, @Request() req?) {
        if (req?.user?.tenantId) {
            await this.planEnforcement.checkFeatureAccess(req.user.tenantId, 'advancedReports');
        }
        return this.analyticsService.getCashFlowReport(branchId);
    }

    @Get('valuation')
    @RequirePermissions('VIEW_ANALYTICS')
    async getValuation(@Query('branchId') branchId?: string, @Request() req?) {
        if (req?.user?.tenantId) {
            await this.planEnforcement.checkFeatureAccess(req.user.tenantId, 'advancedReports');
        }
        return this.analyticsService.getInventoryValuation(branchId);
    }

    @Get('profit')
    @RequirePermissions('VIEW_ANALYTICS')
    async getProfit(
        @Query('branchId') branchId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Request() req?,
    ) {
        if (req?.user?.tenantId) {
            await this.planEnforcement.checkFeatureAccess(req.user.tenantId, 'advancedReports');
        }
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.analyticsService.getProfitAnalysis(branchId, start, end);
    }

    @Get('vat')
    @RequirePermissions('VIEW_ANALYTICS')
    async getVat(
        @Query('branchId') branchId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Request() req?,
    ) {
        if (req?.user?.tenantId) {
            await this.planEnforcement.checkFeatureAccess(req.user.tenantId, 'advancedReports');
        }
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.analyticsService.getVatReport(branchId, start, end);
    }

    @Get('customer-aging')
    @RequirePermissions('VIEW_ANALYTICS')
    async getCustomerAging(@Query('branchId') branchId?: string, @Request() req?) {
        if (req?.user?.tenantId) {
            await this.planEnforcement.checkFeatureAccess(req.user.tenantId, 'advancedReports');
        }
        return this.analyticsService.getCustomerAging(branchId);
    }

    @Get('supplier-aging')
    @RequirePermissions('VIEW_ANALYTICS')
    async getSupplierAging(@Query('branchId') branchId?: string, @Request() req?) {
        if (req?.user?.tenantId) {
            await this.planEnforcement.checkFeatureAccess(req.user.tenantId, 'advancedReports');
        }
        return this.analyticsService.getSupplierAging(branchId);
    }
}
