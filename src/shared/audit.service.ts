import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * HC-2 / HC-4: Shared Audit Service
 *
 * Every mutation MUST call logAction() with:
 *  - tenantId, userId, action, entityType, entityId
 *  - oldValue and newValue (the before/after state)
 *  - correlationId (from request X-Correlation-ID — propagated via req.correlationId)
 *
 * Silent skip when userId or tenantId is missing (e.g. system jobs) — logged as warning.
 */
@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    async logAction(
        tenantId: string,
        userId: string,
        action: string,
        entityType: string,
        entityId: string,
        oldValue?: any,
        newValue?: any,
        correlationId?: string,
        ipAddress?: string,
        tx?: Prisma.TransactionClient,
    ): Promise<void> {
        if (!tenantId || !userId) {
            console.warn(
                `[AuditService] Skipping audit log for action=${action} entity=${entityType}/${entityId}: missing tenantId or userId`,
            );
            return;
        }

        const prisma = tx || this.prisma;

        try {
            await (prisma as any).auditLog.create({
                data: {
                    tenantId,
                    userId,
                    action,
                    entityType,
                    entityId,
                    oldValue: oldValue != null ? JSON.parse(JSON.stringify(oldValue)) : undefined,
                    newValue: newValue != null ? JSON.parse(JSON.stringify(newValue)) : undefined,
                    correlationId: correlationId ?? null,
                    ipAddress: ipAddress ?? null,
                },
            });
        } catch (err) {
            // Audit log failure MUST NOT crash the business operation (except if in mandatory business transaction)
            console.error(
                `[AuditService] Failed to write audit log for ${action} on ${entityType}/${entityId}:`,
                err,
            );
            if (tx) throw err; // Re-throw in transaction to ensure atomic rollback
        }
    }

    async getAuditTrail(tenantId: string, entityType: string, entityId: string) {
        return this.prisma.auditLog.findMany({
            where: { tenantId, entityType, entityId },
            include: {
                user: { select: { id: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getRecentActivity(tenantId: string, limit = 50) {
        return this.prisma.auditLog.findMany({
            where: { tenantId },
            include: {
                user: { select: { id: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    async getPlatformAuditLogs(params: { page?: number; limit?: number; tenantId?: string; action?: string; entityType?: string; search?: string }) {
        const { page = 1, limit = 20, tenantId, action, entityType, search } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.AuditLogWhereInput = {};
        if (tenantId) where.tenantId = tenantId;
        if (action) where.action = action;
        if (entityType) where.entityType = entityType;
        if (search) {
            where.OR = [
                { action: { contains: search, mode: 'insensitive' } },
                { entityId: { contains: search, mode: 'insensitive' } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { tenant: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [items, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                include: {
                    user: { select: { email: true } },
                    tenant: { select: { name: true, subdomain: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return { items, total, page, limit };
    }
}
