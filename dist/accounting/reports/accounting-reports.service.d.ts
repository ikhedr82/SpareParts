import { TenantAwarePrismaService } from '../../prisma/tenant-aware-prisma.service';
export declare class AccountingReportsService {
    private readonly prisma;
    constructor(prisma: TenantAwarePrismaService);
    getTrialBalance(from: Date, to: Date): Promise<any>;
    getIncomeStatement(from: Date, to: Date): Promise<{
        totalRevenue: number;
        totalCOGS: number;
        grossProfit: number;
        totalExpenses: number;
        netProfit: number;
    }>;
    getBalanceSheet(asOf: Date): Promise<{
        assets: any[];
        liabilities: any[];
        equity: any[];
        totalAssets: number;
        totalLiabilities: number;
        totalEquity: number;
    }>;
    getCashFlow(from: Date, to: Date): Promise<{
        operatingActivities: {
            cashFromSales: number;
            cashPaidToSuppliers: number;
            otherCheck: number;
            netCashFromOperating: number;
        };
        investingActivities: {
            netCashFromInvesting: number;
        };
        financingActivities: {
            netCashFromFinancing: number;
        };
        netCashChange: number;
    }>;
}
