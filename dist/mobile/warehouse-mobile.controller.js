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
exports.WarehouseMobileController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
let WarehouseMobileController = class WarehouseMobileController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTasks(req) {
        return this.prisma.pickList.findMany({
            where: {
                tenantId: req.user.tenantId,
                status: 'CREATED',
                OR: [
                    { assignedToId: req.user.id },
                    { assignedToId: null }
                ]
            },
            include: {
                order: {
                    select: { orderNumber: true, branchId: true }
                },
                items: {
                    include: { product: true }
                }
            }
        });
    }
    async scanItem(req, body) {
        const { pickListId, productId, barcode, quantity } = body;
        const product = await this.prisma.product.findUnique({
            where: { id: productId }
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return this.prisma.$transaction(async (tx) => {
            const item = await tx.pickListItem.findFirst({
                where: { pickListId, productId }
            });
            if (!item)
                throw new common_1.BadRequestException('Item not in pick list');
            const newPickedQty = item.pickedQty + quantity;
            if (newPickedQty > item.requiredQty) {
                throw new common_1.BadRequestException('Cannot pick more than requested');
            }
            await tx.pickListItem.update({
                where: { id: item.id },
                data: { pickedQty: newPickedQty }
            });
            const allItems = await tx.pickListItem.findMany({ where: { pickListId } });
            const allPending = allItems.some(i => i.pickedQty < i.requiredQty);
            if (!allPending) {
                await tx.pickList.update({
                    where: { id: pickListId },
                    data: { status: 'PICKED' }
                });
            }
            return { success: true, picked: newPickedQty, remaining: item.requiredQty - newPickedQty };
        });
    }
    async assignTask(req, id) {
        return this.prisma.pickList.update({
            where: { id },
            data: { assignedToId: req.user.id }
        });
    }
};
exports.WarehouseMobileController = WarehouseMobileController;
__decorate([
    (0, common_1.Get)('tasks'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WarehouseMobileController.prototype, "getTasks", null);
__decorate([
    (0, common_1.Post)('scan'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WarehouseMobileController.prototype, "scanItem", null);
__decorate([
    (0, common_1.Post)('tasks/:id/assign'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WarehouseMobileController.prototype, "assignTask", null);
exports.WarehouseMobileController = WarehouseMobileController = __decorate([
    (0, common_1.Controller)('mobile/warehouse'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WarehouseMobileController);
//# sourceMappingURL=warehouse-mobile.controller.js.map