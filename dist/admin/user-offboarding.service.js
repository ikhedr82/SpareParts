"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserOffboardingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../shared/audit.service");
const outbox_service_1 = require("../shared/outbox.service");
let UserOffboardingService = class UserOffboardingService {
    constructor(prisma, auditService, outbox) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.outbox = outbox;
    }
    async offboardUser(tenantId, targetUserId, performedById, reason, correlationId) {
        const user = await this.prisma.user.findFirst({
            where: { id: targetUserId, tenantId },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found in this tenant');
        if (targetUserId === performedById) {
            throw new common_1.BadRequestException('Cannot offboard yourself');
        }
        if (user.status === 'DISABLED') {
            throw new common_1.BadRequestException('User is already disabled');
        }
        return this.prisma.$transaction(async (tx) => {
            const oldStatus = user.status;
            const result = await tx.user.updateMany({
                where: { id: targetUserId, tenantId, version: user.version },
                data: {
                    status: 'DISABLED',
                    version: { increment: 1 },
                },
            });
            if (result.count === 0)
                throw new Error('CONCURRENCY_CONFLICT');
            const deletedRoles = await tx.userRole.deleteMany({
                where: { userId: targetUserId, tenantId },
            });
            await tx.idempotencyRecord.deleteMany({
                where: { userId: targetUserId, tenantId },
            });
            await this.outbox.schedule(tx, {
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
            await this.auditService.logAction(tenantId, performedById, 'OFFBOARD_USER', 'User', targetUserId, { status: oldStatus, email: user.email }, { status: 'DISABLED', reason, rolesRemoved: deletedRoles.count }, correlationId, undefined, tx);
            return {
                userId: targetUserId,
                email: user.email,
                status: 'DISABLED',
                rolesRemoved: deletedRoles.count,
            };
        });
    }
    async findAll(tenantId) {
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
};
exports.UserOffboardingService = UserOffboardingService;
exports.UserOffboardingService = UserOffboardingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        outbox_service_1.OutboxService])
], UserOffboardingService);
//# sourceMappingURL=user-offboarding.service.js.map