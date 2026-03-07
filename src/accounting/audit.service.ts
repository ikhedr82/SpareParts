import { Injectable, Scope } from '@nestjs/common';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { REQUEST } from '@nestjs/core';
import { Inject } from '@nestjs/common';

interface AuditLogData {
    action: string;
    entityType: string;
    entityId: string;
    oldValue?: any;
    newValue?: any;
}

@Injectable({ scope: Scope.REQUEST })
export class AuditService {
    constructor(
        private readonly prisma: TenantAwarePrismaService,
        @Inject(REQUEST) private readonly request: any,
    ) { }

    async logAction(data: AuditLogData): Promise<void> {
        const userId = this.request.user?.id;
        const tenantId = this.prisma.tenantId;
        const ipAddress = this.request.ip || this.request.headers?.['x-forwarded-for'] || 'unknown';

        if (!userId || !tenantId) {
            console.warn('[AuditService] Skipping audit log: missing userId or tenantId');
            return;
        }

        await (this.prisma.client as any).auditLog.create({
            data: {
                tenantId,
                userId,
                action: data.action,
                entityType: data.entityType,
                entityId: data.entityId,
                oldValue: data.oldValue ? JSON.parse(JSON.stringify(data.oldValue)) : null,
                newValue: data.newValue ? JSON.parse(JSON.stringify(data.newValue)) : null,
                ipAddress,
            },
        });

        console.log(`[AuditService] Logged ${data.action} for ${data.entityType}/${data.entityId}`);
    }

    async getAuditTrail(entityType: string, entityId: string) {
        return (this.prisma.client as any).auditLog.findMany({
            where: {
                entityType,
                entityId,
                tenantId: this.prisma.tenantId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getRecentActivity(limit: number = 50) {
        return (this.prisma.client as any).auditLog.findMany({
            where: {
                tenantId: this.prisma.tenantId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });
    }
}
