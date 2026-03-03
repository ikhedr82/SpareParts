import { TaxFilingService } from './tax-filing.service';
export declare class TaxFilingController {
    private readonly service;
    constructor(service: TaxFilingService);
    generate(req: any, body: {
        periodStart: string;
        periodEnd: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.TaxFilingStatus;
        version: number;
        periodStart: Date;
        periodEnd: Date;
        totalVatDue: import("@prisma/client/runtime/library").Decimal;
        totalRevenue: import("@prisma/client/runtime/library").Decimal;
        filedAt: Date | null;
        filedById: string | null;
        reportData: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAll(req: any, status?: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.TaxFilingStatus;
        version: number;
        periodStart: Date;
        periodEnd: Date;
        totalVatDue: import("@prisma/client/runtime/library").Decimal;
        totalRevenue: import("@prisma/client/runtime/library").Decimal;
        filedAt: Date | null;
        filedById: string | null;
        reportData: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    findOne(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.TaxFilingStatus;
        version: number;
        periodStart: Date;
        periodEnd: Date;
        totalVatDue: import("@prisma/client/runtime/library").Decimal;
        totalRevenue: import("@prisma/client/runtime/library").Decimal;
        filedAt: Date | null;
        filedById: string | null;
        reportData: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    file(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.TaxFilingStatus;
        version: number;
        periodStart: Date;
        periodEnd: Date;
        totalVatDue: import("@prisma/client/runtime/library").Decimal;
        totalRevenue: import("@prisma/client/runtime/library").Decimal;
        filedAt: Date | null;
        filedById: string | null;
        reportData: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
