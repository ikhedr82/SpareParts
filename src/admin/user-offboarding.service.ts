import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';

@Injectable()
export class UserOffboardingService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditService: AuditService,
        private readonly outbox: OutboxService,
    ) { }

    /**
     * UC-8: Offboard a user — disable access, invalidate sessions, audit trailing.
     */
    async offboardUser(
        tenantId: string, targetUserId: string, performedById: string,
        reason: string, correlationId?: string,
    ) {
        // Verify target user belongs to tenant
        const user = await this.prisma.user.findFirst({
            where: { id: targetUserId, tenantId },
        });
        if (!user) throw new NotFoundException('User not found in this tenant');

        // Invariant: cannot offboard yourself
        if (targetUserId === performedById) {
            throw new BadRequestException('Cannot offboard yourself');
        }

        // Invariant: cannot offboard already disabled user
        if (user.status === 'DISABLED') {
            throw new BadRequestException('User is already disabled');
        }

        return this.prisma.$transaction(async (tx) => {
            const oldStatus = user.status;

            // 1. Disable user with optimistic lock
            const result = await tx.user.updateMany({
                where: { id: targetUserId, tenantId, version: user.version },
                data: {
                    status: 'DISABLED',
                    version: { increment: 1 },
                },
            });
            if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

            // 2. Remove all role assignments
            const deletedRoles = await tx.userRole.deleteMany({
                where: { userId: targetUserId, tenantId },
            });

            // 3. Invalidate all idempotency records (session-like cleanup)
            await tx.idempotencyRecord.deleteMany({
                where: { userId: targetUserId, tenantId },
            });

            // 4. Outbox event for downstream systems to invalidate sessions
            await this.outbox.schedule(tx as any, {
                tenantId,
                topic: 'admin.user.offboarded',
                payload: {
                    userId: targetUserId,
                    email: user.email,
                    reason,
                    offboardedBy: performedById,
                },
                correlationId,
            });

            // 5. Audit trail
            await this.auditService.logAction(
                tenantId, performedById, 'OFFBOARD_USER', 'User', targetUserId,
                { status: oldStatus, email: user.email },
                { status: 'DISABLED', reason, rolesRemoved: deletedRoles.count },
                correlationId, undefined, tx as any,
            );

            return {
                userId: targetUserId,
                email: user.email,
                status: 'DISABLED',
                rolesRemoved: deletedRoles.count,
            };
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.user.findMany({
            where: { tenantId },
            select: {
                id: true, email: true, status: true,
                createdAt: true, updatedAt: true,
                userRoles: { include: { role: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
