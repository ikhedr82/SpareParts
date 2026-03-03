import { PrismaService } from '../prisma/prisma.service';
import { InventorySafetyService } from '../warehouse/inventory-safety.service';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
export declare class ReturnToWarehouseService {
    private readonly prisma;
    private readonly inventorySafety;
    private readonly auditService;
    private readonly outbox;
    constructor(prisma: PrismaService, inventorySafety: InventorySafetyService, auditService: AuditService, outbox: OutboxService);
    returnToWarehouse(tenantId: string, tripId: string, stopId: string, reason: string, userId: string, correlationId?: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        version: number;
        branchId: string;
        reason: string;
        receivedAt: Date | null;
        receivedById: string | null;
        tripId: string;
        stopId: string;
    }>;
    findAll(tenantId: string, branchId?: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        version: number;
        branchId: string;
        reason: string;
        receivedAt: Date | null;
        receivedById: string | null;
        tripId: string;
        stopId: string;
    }[]>;
}
