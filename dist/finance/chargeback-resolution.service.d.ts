import { PrismaService } from '../prisma/prisma.service';
import { ChargebackStatus } from '@prisma/client';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
export declare class ChargebackResolutionService {
    private readonly prisma;
    private readonly auditService;
    private readonly outbox;
    constructor(prisma: PrismaService, auditService: AuditService, outbox: OutboxService);
    resolveChargeback(tenantId: string, chargebackId: string, userId: string, notes?: string, correlationId?: string): Promise<{
        chargeback: {
            id: string;
            tenantId: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.ChargebackStatus;
            orderId: string;
            deliveryExceptionId: string | null;
            returnId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            reason: string;
            resolvedAt: Date | null;
        };
        resolution: {
            id: string;
            tenantId: string;
            action: string;
            createdAt: Date;
            notes: string | null;
            chargebackId: string;
            resolvedById: string;
            ledgerEntryId: string | null;
        };
    }>;
    rejectChargeback(tenantId: string, chargebackId: string, userId: string, notes?: string, correlationId?: string): Promise<{
        chargeback: {
            id: string;
            tenantId: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.ChargebackStatus;
            orderId: string;
            deliveryExceptionId: string | null;
            returnId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            reason: string;
            resolvedAt: Date | null;
        };
        resolution: {
            id: string;
            tenantId: string;
            action: string;
            createdAt: Date;
            notes: string | null;
            chargebackId: string;
            resolvedById: string;
            ledgerEntryId: string | null;
        };
    }>;
    findAll(tenantId: string, status?: ChargebackStatus): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ChargebackStatus;
        orderId: string;
        deliveryExceptionId: string | null;
        returnId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        reason: string;
        resolvedAt: Date | null;
    }[]>;
}
