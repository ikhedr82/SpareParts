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
exports.PortalInventoryController = void 0;
const common_1 = require("@nestjs/common");
const portal_auth_guard_1 = require("./portal-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
const inventory_safety_service_1 = require("../warehouse/inventory-safety.service");
let PortalInventoryController = class PortalInventoryController {
    constructor(prisma, inventorySafety) {
        this.prisma = prisma;
        this.inventorySafety = inventorySafety;
    }
    async search(req, query, categoryId) {
        const { tenantId } = req.user;
        const products = await this.prisma.product.findMany({
            where: Object.assign(Object.assign({ name: { contains: query, mode: 'insensitive' } }, (categoryId && { categoryId })), { status: 'ACTIVE', inventory: {
                    some: { tenantId }
                } }),
            include: {
                inventory: {
                    where: { tenantId },
                    select: {
                        sellingPrice: true,
                        quantity: true,
                        allocated: true,
                        branchId: true
                    }
                },
                category: true,
                brand: true
            },
            take: 50
        });
        return products.map(p => {
            var _a;
            const totalQty = p.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
            const totalAllocated = p.inventory.reduce((sum, inv) => sum + inv.allocated, 0);
            const available = Math.max(0, totalQty - totalAllocated);
            const price = ((_a = p.inventory.find(i => Number(i.sellingPrice) > 0)) === null || _a === void 0 ? void 0 : _a.sellingPrice) || 0;
            return {
                id: p.id,
                name: p.name,
                description: p.description,
                brand: p.brand.name,
                category: p.category.name,
                sku: p.name,
                price,
                available,
                unitOfMeasure: p.unitOfMeasure,
                images: p.images
            };
        });
    }
};
exports.PortalInventoryController = PortalInventoryController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('q')),
    __param(2, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PortalInventoryController.prototype, "search", null);
exports.PortalInventoryController = PortalInventoryController = __decorate([
    (0, common_1.Controller)('portal/inventory'),
    (0, common_1.UseGuards)(portal_auth_guard_1.PortalAuthGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_safety_service_1.InventorySafetyService])
], PortalInventoryController);
//# sourceMappingURL=portal-inventory.controller.js.map