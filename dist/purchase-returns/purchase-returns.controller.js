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
exports.PurchaseReturnsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../shared/auth.guard");
const purchase_returns_service_1 = require("./purchase-returns.service");
const create_return_dto_1 = require("./dtos/create-return.dto");
const reject_return_dto_1 = require("./dtos/reject-return.dto");
let PurchaseReturnsController = class PurchaseReturnsController {
    constructor(service) {
        this.service = service;
    }
    async findAll(req) {
        return this.service.findAll(req.user.tenantId);
    }
    async findOne(req, id) {
        return this.service.findOne(req.user.tenantId, id);
    }
    async createReturn(req, dto) {
        return this.service.createReturn(req.user.tenantId, req.user.id, dto);
    }
    async approveReturn(req, id) {
        return this.service.approveReturn(req.user.tenantId, req.user.id, id);
    }
    async rejectReturn(req, id, dto) {
        return this.service.rejectReturn(req.user.tenantId, req.user.id, id, dto.reason);
    }
    async shipReturn(req, id) {
        return this.service.shipReturn(req.user.tenantId, req.user.id, id);
    }
    async completeReturn(req, id) {
        return this.service.completeReturn(req.user.tenantId, req.user.id, id);
    }
};
exports.PurchaseReturnsController = PurchaseReturnsController;
__decorate([
    (0, common_1.Get)(),
    (0, auth_guard_1.Roles)('Admin', 'Manager', 'Inventory Manager'),
    (0, auth_guard_1.Permissions)('VIEW_PURCHASE_RETURNS'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PurchaseReturnsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, auth_guard_1.Roles)('Admin', 'Manager', 'Inventory Manager'),
    (0, auth_guard_1.Permissions)('VIEW_PURCHASE_RETURNS'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PurchaseReturnsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, auth_guard_1.Roles)('Admin', 'Inventory Manager'),
    (0, auth_guard_1.Permissions)('CREATE_PURCHASE_RETURN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_return_dto_1.CreatePurchaseReturnDto]),
    __metadata("design:returntype", Promise)
], PurchaseReturnsController.prototype, "createReturn", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, auth_guard_1.Roles)('Admin', 'Manager'),
    (0, auth_guard_1.Permissions)('APPROVE_PURCHASE_RETURN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PurchaseReturnsController.prototype, "approveReturn", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, auth_guard_1.Roles)('Admin', 'Manager'),
    (0, auth_guard_1.Permissions)('APPROVE_PURCHASE_RETURN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, reject_return_dto_1.RejectReturnDto]),
    __metadata("design:returntype", Promise)
], PurchaseReturnsController.prototype, "rejectReturn", null);
__decorate([
    (0, common_1.Post)(':id/ship'),
    (0, auth_guard_1.Roles)('Admin', 'Inventory Manager'),
    (0, auth_guard_1.Permissions)('MANAGE_PURCHASE_RETURNS'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PurchaseReturnsController.prototype, "shipReturn", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, auth_guard_1.Roles)('Admin'),
    (0, auth_guard_1.Permissions)('MANAGE_PURCHASE_RETURNS'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PurchaseReturnsController.prototype, "completeReturn", null);
exports.PurchaseReturnsController = PurchaseReturnsController = __decorate([
    (0, common_1.Controller)('api/v1/purchase-returns'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [purchase_returns_service_1.PurchaseReturnsService])
], PurchaseReturnsController);
//# sourceMappingURL=purchase-returns.controller.js.map