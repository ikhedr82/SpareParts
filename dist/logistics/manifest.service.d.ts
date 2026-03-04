import { PrismaService } from '../prisma/prisma.service';
import { ManifestStatus } from '@prisma/client';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
export declare class ManifestService {
    private readonly prisma;
    private readonly auditService;
    private readonly outbox;
    constructor(prisma: PrismaService, auditService: AuditService, outbox: OutboxService);
    createManifest(tenantId: string, userId: string, dto: {
        branchId: string;
        manifestRef: string;
        orderIds: string[];
    }, correlationId?: string): Promise<{
        orders: {
            id: string;
            createdAt: Date;
            sequence: number;
            orderId: string;
            shipmentManifestId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ManifestStatus;
        updatedAt: Date;
        version: number;
        completedAt: Date | null;
        branchId: string;
        tripId: string | null;
        manifestRef: string;
        sealedAt: Date | null;
        dispatchedAt: Date | null;
    }>;
    addOrders(tenantId: string, manifestId: string, orderIds: string[], userId: string, correlationId?: string): Promise<{
        orders: {
            id: string;
            createdAt: Date;
            sequence: number;
            orderId: string;
            shipmentManifestId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ManifestStatus;
        updatedAt: Date;
        version: number;
        completedAt: Date | null;
        branchId: string;
        tripId: string | null;
        manifestRef: string;
        sealedAt: Date | null;
        dispatchedAt: Date | null;
    }>;
    sealManifest(tenantId: string, manifestId: string, userId: string, correlationId?: string): Promise<{
        orders: {
            id: string;
            createdAt: Date;
            sequence: number;
            orderId: string;
            shipmentManifestId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ManifestStatus;
        updatedAt: Date;
        version: number;
        completedAt: Date | null;
        branchId: string;
        tripId: string | null;
        manifestRef: string;
        sealedAt: Date | null;
        dispatchedAt: Date | null;
    }>;
    dispatchManifest(tenantId: string, manifestId: string, tripId: string, userId: string, correlationId?: string): Promise<{
        orders: {
            id: string;
            createdAt: Date;
            sequence: number;
            orderId: string;
            shipmentManifestId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ManifestStatus;
        updatedAt: Date;
        version: number;
        completedAt: Date | null;
        branchId: string;
        tripId: string | null;
        manifestRef: string;
        sealedAt: Date | null;
        dispatchedAt: Date | null;
    }>;
    completeManifest(tenantId: string, manifestId: string, userId: string, correlationId?: string): Promise<{
        orders: {
            id: string;
            createdAt: Date;
            sequence: number;
            orderId: string;
            shipmentManifestId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ManifestStatus;
        updatedAt: Date;
        version: number;
        completedAt: Date | null;
        branchId: string;
        tripId: string | null;
        manifestRef: string;
        sealedAt: Date | null;
        dispatchedAt: Date | null;
    }>;
    findAll(tenantId: string, branchId?: string, status?: ManifestStatus): Promise<({
        orders: {
            id: string;
            createdAt: Date;
            sequence: number;
            orderId: string;
            shipmentManifestId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ManifestStatus;
        updatedAt: Date;
        version: number;
        completedAt: Date | null;
        branchId: string;
        tripId: string | null;
        manifestRef: string;
        sealedAt: Date | null;
        dispatchedAt: Date | null;
    })[]>;
    findOne(tenantId: string, manifestId: string): Promise<{
        orders: {
            id: string;
            createdAt: Date;
            sequence: number;
            orderId: string;
            shipmentManifestId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ManifestStatus;
        updatedAt: Date;
        version: number;
        completedAt: Date | null;
        branchId: string;
        tripId: string | null;
        manifestRef: string;
        sealedAt: Date | null;
        dispatchedAt: Date | null;
    }>;
}
