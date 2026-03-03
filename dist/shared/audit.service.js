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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AuditService = class AuditService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async logAction(tenantId, userId, action, entityType, entityId, oldValue, newValue, correlationId, ipAddress, tx) {
        if (!tenantId || !userId) {
            console.warn(`[AuditService] Skipping audit log for action=${action} entity=${entityType}/${entityId}: missing tenantId or userId`);
            return;
        }
        const prisma = tx || this.prisma;
        try {
            await prisma.auditLog.create({
                data: {
                    tenantId,
                    userId,
                    action,
                    entityType,
                    entityId,
                    oldValue: oldValue != null ? JSON.parse(JSON.stringify(oldValue)) : undefined,
                    newValue: newValue != null ? JSON.parse(JSON.stringify(newValue)) : undefined,
                    correlationId: correlationId !== null && correlationId !== void 0 ? correlationId : null,
                    ipAddress: ipAddress !== null && ipAddress !== void 0 ? ipAddress : null,
                },
            });
        }
        catch (err) {
            console.error(`[AuditService] Failed to write audit log for ${action} on ${entityType}/${entityId}:`, err);
            if (tx)
                throw err;
        }
    }
    async getAuditTrail(tenantId, entityType, entityId) {
        return this.prisma.auditLog.findMany({
            where: { tenantId, entityType, entityId },
            include: {
                user: { select: { id: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getRecentActivity(tenantId, limit = 50) {
        return this.prisma.auditLog.findMany({
            where: { tenantId },
            include: {
                user: { select: { id: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map