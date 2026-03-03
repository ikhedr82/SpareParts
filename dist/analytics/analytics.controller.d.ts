import { AnalyticsService } from './analytics.service';
import { PlanEnforcementService } from '../tenant-admin/plan-enforcement.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    private readonly planEnforcement;
    constructor(analyticsService: AnalyticsService, planEnforcement: PlanEnforcementService);
    getDashboard(branchId?: string, req?: any): Promise<{
        kpis: {
            revenue: number;
            profit: number;
            totalSales: number;
            lowStockAlerts: number;
            unpaidInvoicesCount: number;
            unpaidInvoicesTotal: number;
        };
        payments: {
            method: import(".prisma/client").$Enums.PaymentMethod;
            amount: number;
        }[];
    }>;
    getSales(period?: 'daily' | 'weekly' | 'monthly', branchId?: string, req?: any): Promise<{
        date: string;
        total: unknown;
    }[]>;
    getInventory(branchId?: string, req?: any): Promise<{
        productId: string;
        name: string;
        quantitySold: number;
    }[]>;
    getCashFlow(branchId?: string, req?: any): Promise<{
        date: string;
        total: unknown;
    }[]>;
    getValuation(branchId?: string, req?: any): Promise<{
        totalValue: number;
    }>;
    getProfit(branchId?: string, startDate?: string, endDate?: string, req?: any): Promise<{
        revenue: number;
        cogs: number;
        profit: number;
        margin: number;
    }>;
    getVat(branchId?: string, startDate?: string, endDate?: string, req?: any): Promise<{
        subtotal: number;
        tax: number;
        total: number;
    }>;
    getCustomerAging(branchId?: string, req?: any): Promise<{
        '0-30': any[];
        '31-60': any[];
        '61-90': any[];
        '90+': any[];
    }>;
    getSupplierAging(branchId?: string, req?: any): Promise<{
        '0-30': any[];
        '31-60': any[];
        '61-90': any[];
        '90+': any[];
    }>;
}
