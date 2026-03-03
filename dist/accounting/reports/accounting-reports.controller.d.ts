import { AccountingReportsService } from './accounting-reports.service';
export declare class AccountingReportsController {
    private readonly reportsService;
    constructor(reportsService: AccountingReportsService);
    getTrialBalance(from: string, to: string): Promise<any>;
    getIncomeStatement(from: string, to: string): Promise<{
        totalRevenue: number;
        totalCOGS: number;
        grossProfit: number;
        totalExpenses: number;
        netProfit: number;
    }>;
    getBalanceSheet(asOf: string): Promise<{
        assets: any[];
        liabilities: any[];
        equity: any[];
        totalAssets: number;
        totalLiabilities: number;
        totalEquity: number;
    }>;
    getCashFlow(from: string, to: string): Promise<{
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
