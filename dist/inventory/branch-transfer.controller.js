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
exports.BranchTransferController = void 0;
const common_1 = require("@nestjs/common");
const branch_transfer_service_1 = require("./branch-transfer.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let BranchTransferController = class BranchTransferController {
    constructor(service) {
        this.service = service;
    }
    async create(req, body) {
        return this.service.createTransfer(req.user.tenantId, req.user.sub, body, req.correlationId);
    }
    async findAll(req, branchId, status) {
        return this.service.findAll(req.user.tenantId, branchId, status);
    }
    async findOne(req, id) {
        return this.service.findOne(req.user.tenantId, id);
    }
    async approve(req, id) {
        return this.service.approveTransfer(req.user.tenantId, id, req.user.sub, req.correlationId);
    }
    async ship(req, id) {
        return this.service.shipTransfer(req.user.tenantId, id, req.user.sub, req.correlationId);
    }
    async receive(req, id, body) {
        return this.service.receiveTransfer(req.user.tenantId, id, req.user.sub, body.items, req.correlationId);
    }
};
exports.BranchTransferController = BranchTransferController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BranchTransferController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], BranchTransferController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BranchTransferController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BranchTransferController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/ship'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BranchTransferController.prototype, "ship", null);
__decorate([
    (0, common_1.Patch)(':id/receive'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], BranchTransferController.prototype, "receive", null);
exports.BranchTransferController = BranchTransferController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('inventory/branch-transfers'),
    __metadata("design:paramtypes", [branch_transfer_service_1.BranchTransferService])
], BranchTransferController);
//# sourceMappingURL=branch-transfer.controller.js.map