import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: TenantAwarePrismaService);
    getDashboardKPIs(branchId?: string): Promise<{
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
    getSalesReports(period: 'daily' | 'weekly' | 'monthly', branchId?: string): Promise<{
        date: string;
        total: unknown;
    }[]>;
    getInventoryReport(branchId?: string): Promise<{
        productId: string;
        name: string;
        quantitySold: number;
    }[]>;
    getCashFlowReport(branchId?: string): Promise<{
        date: string;
        total: unknown;
    }[]>;
    getInventoryValuation(branchId?: string): Promise<{
        totalValue: number;
    }>;
    getProfitAnalysis(branchId?: string, startDate?: Date, endDate?: Date): Promise<{
        revenue: number;
        cogs: number;
        profit: number;
        margin: number;
    }>;
    getVatReport(branchId?: string, startDate?: Date, endDate?: Date): Promise<{
        subtotal: number;
        tax: number;
        total: number;
    }>;
    getCustomerAging(branchId?: string): Promise<{
        '0-30': any[];
        '31-60': any[];
        '61-90': any[];
        '90+': any[];
    }>;
    getSupplierAging(branchId?: string): Promise<{
        '0-30': any[];
        '31-60': any[];
        '61-90': any[];
        '90+': any[];
    }>;
}
