import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getVatReport(req: any, startDate: string, endDate: string): Promise<{
        totalSales: number;
        totalTax: number;
        breakdown: Record<string, number>;
    }>;
    getProfitLoss(req: any, startDate: string, endDate: string): Promise<{
        revenue: number;
        cogs: number;
        profit: number;
    }>;
    getAgingReport(req: any, type: 'CUSTOMER' | 'SUPPLIER'): Promise<{
        id: string;
        name: string;
        nameAr: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        version: number;
        balance: import("@prisma/client/runtime/library").Decimal;
    }[]>;
}
