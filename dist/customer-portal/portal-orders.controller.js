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
exports.PortalOrdersController = void 0;
const common_1 = require("@nestjs/common");
const portal_auth_guard_1 = require("./portal-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
const orders_service_1 = require("../orders/orders.service");
const create_order_dto_1 = require("../orders/dto/create-order.dto");
let PortalOrdersController = class PortalOrdersController {
    constructor(prisma, ordersService) {
        this.prisma = prisma;
        this.ordersService = ordersService;
    }
    async findAll(req) {
        const { tenantId, businessClientId } = req.user;
        return this.prisma.order.findMany({
            where: {
                tenantId,
                businessClientId,
            },
            include: {
                items: true,
                deliveryAddress: true,
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findOne(req, id) {
        const { tenantId, businessClientId } = req.user;
        const order = await this.prisma.order.findFirst({
            where: {
                id,
                tenantId,
                businessClientId
            },
            include: {
                items: { include: { product: true } },
                deliveryAddress: true,
                tripStops: { include: { trip: true } },
            }
        });
        if (!order) {
            throw new common_1.BadRequestException('Order not found or access denied');
        }
        return order;
    }
    async create(req, dto) {
        const { tenantId, businessClientId, id: userId } = req.user;
        const safeDto = Object.assign(Object.assign({}, dto), { businessClientId });
        if (dto.businessClientId && dto.businessClientId !== businessClientId) {
            throw new common_1.BadRequestException('Cannot place order for another client');
        }
        return this.ordersService.create(safeDto);
    }
};
exports.PortalOrdersController = PortalOrdersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PortalOrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PortalOrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", Promise)
], PortalOrdersController.prototype, "create", null);
exports.PortalOrdersController = PortalOrdersController = __decorate([
    (0, common_1.Controller)('portal/orders'),
    (0, common_1.UseGuards)(portal_auth_guard_1.PortalAuthGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        orders_service_1.OrdersService])
], PortalOrdersController);
//# sourceMappingURL=portal-orders.controller.js.map