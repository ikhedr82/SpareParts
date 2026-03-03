import { ZReportsService } from './z-reports.service';
export declare class ZReportsController {
    private readonly zReportsService;
    constructor(zReportsService: ZReportsService);
    closeDay(body: {
        branchId: string;
        closingCash: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        branchId: string;
        openingCash: import("@prisma/client/runtime/library").Decimal;
        closingCash: import("@prisma/client/runtime/library").Decimal;
        expectedCash: import("@prisma/client/runtime/library").Decimal;
        difference: import("@prisma/client/runtime/library").Decimal;
        businessDate: Date;
        totalSales: import("@prisma/client/runtime/library").Decimal;
        totalReturns: import("@prisma/client/runtime/library").Decimal;
        totalPayments: import("@prisma/client/runtime/library").Decimal;
        cashSales: import("@prisma/client/runtime/library").Decimal;
        cardSales: import("@prisma/client/runtime/library").Decimal;
        transferSales: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(branchId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        branchId: string;
        openingCash: import("@prisma/client/runtime/library").Decimal;
        closingCash: import("@prisma/client/runtime/library").Decimal;
        expectedCash: import("@prisma/client/runtime/library").Decimal;
        difference: import("@prisma/client/runtime/library").Decimal;
        businessDate: Date;
        totalSales: import("@prisma/client/runtime/library").Decimal;
        totalReturns: import("@prisma/client/runtime/library").Decimal;
        totalPayments: import("@prisma/client/runtime/library").Decimal;
        cashSales: import("@prisma/client/runtime/library").Decimal;
        cardSales: import("@prisma/client/runtime/library").Decimal;
        transferSales: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        branchId: string;
        openingCash: import("@prisma/client/runtime/library").Decimal;
        closingCash: import("@prisma/client/runtime/library").Decimal;
        expectedCash: import("@prisma/client/runtime/library").Decimal;
        difference: import("@prisma/client/runtime/library").Decimal;
        businessDate: Date;
        totalSales: import("@prisma/client/runtime/library").Decimal;
        totalReturns: import("@prisma/client/runtime/library").Decimal;
        totalPayments: import("@prisma/client/runtime/library").Decimal;
        cashSales: import("@prisma/client/runtime/library").Decimal;
        cardSales: import("@prisma/client/runtime/library").Decimal;
        transferSales: import("@prisma/client/runtime/library").Decimal;
    }>;
}
