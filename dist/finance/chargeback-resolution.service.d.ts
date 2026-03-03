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
            createdAt: Date;
            tenantId: string;
            status: import(".prisma/client").$Enums.ChargebackStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
            reason: string;
            returnId: string | null;
            deliveryExceptionId: string | null;
            resolvedAt: Date | null;
        };
        resolution: {
            id: string;
            createdAt: Date;
            tenantId: string;
            notes: string | null;
            action: string;
            chargebackId: string;
            resolvedById: string;
            ledgerEntryId: string | null;
        };
    }>;
    rejectChargeback(tenantId: string, chargebackId: string, userId: string, notes?: string, correlationId?: string): Promise<{
        chargeback: {
            id: string;
            createdAt: Date;
            tenantId: string;
            status: import(".prisma/client").$Enums.ChargebackStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
            reason: string;
            returnId: string | null;
            deliveryExceptionId: string | null;
            resolvedAt: Date | null;
        };
        resolution: {
            id: string;
            createdAt: Date;
            tenantId: string;
            notes: string | null;
            action: string;
            chargebackId: string;
            resolvedById: string;
            ledgerEntryId: string | null;
        };
    }>;
    findAll(tenantId: string, status?: ChargebackStatus): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.ChargebackStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        orderId: string;
        reason: string;
        returnId: string | null;
        deliveryExceptionId: string | null;
        resolvedAt: Date | null;
    }[]>;
}
