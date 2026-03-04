import { PrismaService } from '../prisma/prisma.service';
import { TaxFilingStatus } from '@prisma/client';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
export declare class TaxFilingService {
    private readonly prisma;
    private readonly auditService;
    private readonly outbox;
    constructor(prisma: PrismaService, auditService: AuditService, outbox: OutboxService);
    generateReport(tenantId: string, userId: string, dto: {
        periodStart: string;
        periodEnd: string;
    }, correlationId?: string): Promise<{
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
    fileTaxReport(tenantId: string, filingId: string, userId: string, correlationId?: string): Promise<{
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
    findAll(tenantId: string, status?: TaxFilingStatus): Promise<{
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
    findOne(tenantId: string, filingId: string): Promise<{
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
