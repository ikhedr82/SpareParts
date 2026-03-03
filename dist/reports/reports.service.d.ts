import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
export declare class ReportsService {
    private readonly prisma;
    constructor(prisma: TenantAwarePrismaService);
    getVatReport(tenantId: string, startDate: Date, endDate: Date): Promise<{
        totalSales: number;
        totalTax: number;
        breakdown: Record<string, number>;
    }>;
    getProfitLoss(tenantId: string, startDate: Date, endDate: Date): Promise<{
        revenue: number;
        cogs: number;
        profit: number;
    }>;
    getAgingReport(tenantId: string, type: 'CUSTOMER' | 'SUPPLIER'): Promise<{
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
