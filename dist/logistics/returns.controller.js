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
exports.ReturnsController = void 0;
const common_1 = require("@nestjs/common");
const returns_service_1 = require("./returns.service");
const exceptions_dto_1 = require("./dto/exceptions.dto");
let ReturnsController = class ReturnsController {
    constructor(service) {
        this.service = service;
    }
    async initiateReturn(req, dto) {
        const tenantId = req.user.tenantId;
        return this.service.initiateReturn(tenantId, dto.orderId, dto.reason, dto.items, req.user.id, dto.reasonNotes, dto.deliveryExceptionId);
    }
    async approveReturn(req, id) {
        const tenantId = req.user.tenantId;
        return this.service.approveReturn(tenantId, id, req.user.id);
    }
    async rejectReturn(req, id, dto) {
        const tenantId = req.user.tenantId;
        return this.service.rejectReturn(tenantId, id, req.user.id, dto.reason);
    }
    async receiveReturn(req, id, dto) {
        const tenantId = req.user.tenantId;
        return this.service.receiveReturn(tenantId, id, dto.items, req.user.id);
    }
    async completeReturn(req, id) {
        const tenantId = req.user.tenantId;
        return this.service.completeReturn(tenantId, id, req.user.id);
    }
    async findAll(req, status, orderId) {
        const tenantId = req.user.tenantId;
        const returnStatus = status;
        return this.service.findAll(tenantId, returnStatus, orderId);
    }
};
exports.ReturnsController = ReturnsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, exceptions_dto_1.InitiateReturnDto]),
    __metadata("design:returntype", Promise)
], ReturnsController.prototype, "initiateReturn", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReturnsController.prototype, "approveReturn", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, exceptions_dto_1.RejectReturnDto]),
    __metadata("design:returntype", Promise)
], ReturnsController.prototype, "rejectReturn", null);
__decorate([
    (0, common_1.Patch)(':id/receive'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, exceptions_dto_1.ReceiveReturnDto]),
    __metadata("design:returntype", Promise)
], ReturnsController.prototype, "receiveReturn", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReturnsController.prototype, "completeReturn", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReturnsController.prototype, "findAll", null);
exports.ReturnsController = ReturnsController = __decorate([
    (0, common_1.Controller)('logistics/returns'),
    __metadata("design:paramtypes", [returns_service_1.ReturnsService])
], ReturnsController);
//# sourceMappingURL=returns.controller.js.map