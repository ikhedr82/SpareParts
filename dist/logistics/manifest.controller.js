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
exports.ManifestController = void 0;
const common_1 = require("@nestjs/common");
const manifest_service_1 = require("./manifest.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ManifestController = class ManifestController {
    constructor(service) {
        this.service = service;
    }
    async create(req, body) {
        return this.service.createManifest(req.user.tenantId, req.user.sub, body, req.correlationId);
    }
    async findAll(req, branchId, status) {
        return this.service.findAll(req.user.tenantId, branchId, status);
    }
    async findOne(req, id) {
        return this.service.findOne(req.user.tenantId, id);
    }
    async addOrders(req, id, body) {
        return this.service.addOrders(req.user.tenantId, id, body.orderIds, req.user.sub, req.correlationId);
    }
    async seal(req, id) {
        return this.service.sealManifest(req.user.tenantId, id, req.user.sub, req.correlationId);
    }
    async dispatch(req, id, body) {
        return this.service.dispatchManifest(req.user.tenantId, id, body.tripId, req.user.sub, req.correlationId);
    }
    async complete(req, id) {
        return this.service.completeManifest(req.user.tenantId, id, req.user.sub, req.correlationId);
    }
};
exports.ManifestController = ManifestController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ManifestController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ManifestController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ManifestController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/orders'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ManifestController.prototype, "addOrders", null);
__decorate([
    (0, common_1.Patch)(':id/seal'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ManifestController.prototype, "seal", null);
__decorate([
    (0, common_1.Patch)(':id/dispatch'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ManifestController.prototype, "dispatch", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ManifestController.prototype, "complete", null);
exports.ManifestController = ManifestController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('logistics/manifests'),
    __metadata("design:paramtypes", [manifest_service_1.ManifestService])
], ManifestController);
//# sourceMappingURL=manifest.controller.js.map