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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const tenant_aware_prisma_service_1 = require("../prisma/tenant-aware-prisma.service");
const core_1 = require("@nestjs/core");
const common_2 = require("@nestjs/common");
let AuditService = class AuditService {
    constructor(prisma, request) {
        this.prisma = prisma;
        this.request = request;
    }
    async logAction(data) {
        var _a, _b;
        const userId = (_a = this.request.user) === null || _a === void 0 ? void 0 : _a.id;
        const tenantId = this.prisma.tenantId;
        const ipAddress = this.request.ip || ((_b = this.request.headers) === null || _b === void 0 ? void 0 : _b['x-forwarded-for']) || 'unknown';
        if (!userId || !tenantId) {
            console.warn('[AuditService] Skipping audit log: missing userId or tenantId');
            return;
        }
        await this.prisma.client.auditLog.create({
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
    async getAuditTrail(entityType, entityId) {
        return this.prisma.client.auditLog.findMany({
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
    async getRecentActivity(limit = 50) {
        return this.prisma.client.auditLog.findMany({
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
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __param(1, (0, common_2.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [tenant_aware_prisma_service_1.TenantAwarePrismaService, Object])
], AuditService);
//# sourceMappingURL=audit.service.js.map