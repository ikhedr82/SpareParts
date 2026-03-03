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
exports.PortalSubstitutionsController = void 0;
const common_1 = require("@nestjs/common");
const portal_auth_guard_1 = require("./portal-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PortalSubstitutionsController = class PortalSubstitutionsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPending(req) {
        const { tenantId, businessClientId } = req.user;
        return this.prisma.substitution.findMany({
            where: {
                tenantId,
                status: client_1.SubstitutionStatus.PENDING,
                order: {
                    businessClientId
                }
            },
            include: {
                originalProduct: true,
                substituteProduct: true,
                order: { select: { orderNumber: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async approve(req, id) {
        const { tenantId, businessClientId, id: userId } = req.user;
        const substitution = await this.prisma.substitution.findFirst({
            where: { id, tenantId },
            include: { order: true }
        });
        if (!substitution)
            throw new common_1.NotFoundException('Substitution request not found');
        if (substitution.order.businessClientId !== businessClientId)
            throw new common_1.BadRequestException('Access denied');
        if (substitution.status !== client_1.SubstitutionStatus.PENDING)
            throw new common_1.BadRequestException('Already processed');
        return this.prisma.$transaction(async (tx) => {
            await tx.substitution.update({
                where: { id },
                data: {
                    status: client_1.SubstitutionStatus.APPROVED,
                    respondedAt: new Date(),
                }
            });
            await tx.orderItem.update({
                where: { id: substitution.orderItemId },
                data: {
                    productId: substitution.substituteProductId,
                }
            });
            return { success: true, message: 'Substitution approved' };
        });
    }
    async reject(req, id) {
        const { tenantId, businessClientId } = req.user;
        const substitution = await this.prisma.substitution.findFirst({
            where: { id, tenantId },
            include: { order: true }
        });
        if (!substitution)
            throw new common_1.NotFoundException('Substitution request not found');
        if (substitution.order.businessClientId !== businessClientId)
            throw new common_1.BadRequestException('Access denied');
        if (substitution.status !== client_1.SubstitutionStatus.PENDING)
            throw new common_1.BadRequestException('Already processed');
        return this.prisma.$transaction(async (tx) => {
            await tx.substitution.update({
                where: { id },
                data: {
                    status: client_1.SubstitutionStatus.REJECTED,
                    respondedAt: new Date()
                }
            });
            await tx.orderItem.update({
                where: { id: substitution.orderItemId },
                data: {
                    quantity: 0
                }
            });
            return { success: true, message: 'Substitution rejected, item cancelled' };
        });
    }
};
exports.PortalSubstitutionsController = PortalSubstitutionsController;
__decorate([
    (0, common_1.Get)('pending'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PortalSubstitutionsController.prototype, "getPending", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PortalSubstitutionsController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PortalSubstitutionsController.prototype, "reject", null);
exports.PortalSubstitutionsController = PortalSubstitutionsController = __decorate([
    (0, common_1.Controller)('portal/substitutions'),
    (0, common_1.UseGuards)(portal_auth_guard_1.PortalAuthGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PortalSubstitutionsController);
//# sourceMappingURL=portal-substitutions.controller.js.map