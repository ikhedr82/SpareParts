import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    logAction(tenantId: string, userId: string, action: string, entityType: string, entityId: string, oldValue?: any, newValue?: any, correlationId?: string, ipAddress?: string, tx?: Prisma.TransactionClient): Promise<void>;
    getAuditTrail(tenantId: string, entityType: string, entityId: string): Promise<({
        user: {
            id: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        tenantId: string;
        userId: string;
        action: string;
        entityType: string;
        entityId: string;
        oldValue: Prisma.JsonValue | null;
        newValue: Prisma.JsonValue | null;
        ipAddress: string | null;
        correlationId: string | null;
    })[]>;
    getRecentActivity(tenantId: string, limit?: number): Promise<({
        user: {
            id: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        tenantId: string;
        userId: string;
        action: string;
        entityType: string;
        entityId: string;
        oldValue: Prisma.JsonValue | null;
        newValue: Prisma.JsonValue | null;
        ipAddress: string | null;
        correlationId: string | null;
    })[]>;
    getPlatformAuditLogs(params: {
        page?: number;
        limit?: number;
        tenantId?: string;
        action?: string;
        entityType?: string;
        search?: string;
    }): Promise<{
        items: ({
            tenant: {
                name: string;
                subdomain: string;
            };
            user: {
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            tenantId: string;
            userId: string;
            action: string;
            entityType: string;
            entityId: string;
            oldValue: Prisma.JsonValue | null;
            newValue: Prisma.JsonValue | null;
            ipAddress: string | null;
            correlationId: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
}
