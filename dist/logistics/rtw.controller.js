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
exports.RtwListController = exports.ReturnToWarehouseController = void 0;
const common_1 = require("@nestjs/common");
const rtw_service_1 = require("./rtw.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ReturnToWarehouseController = class ReturnToWarehouseController {
    constructor(rtwService) {
        this.rtwService = rtwService;
    }
    async returnToWarehouse(tripId, stopId, body, req) {
        return this.rtwService.returnToWarehouse(req.user.tenantId, tripId, stopId, body.reason, req.user.sub, req.correlationId);
    }
};
exports.ReturnToWarehouseController = ReturnToWarehouseController;
__decorate([
    (0, common_1.Post)('return-to-warehouse'),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Param)('stopId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], ReturnToWarehouseController.prototype, "returnToWarehouse", null);
exports.ReturnToWarehouseController = ReturnToWarehouseController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('logistics/trips/:tripId/stops/:stopId'),
    __metadata("design:paramtypes", [rtw_service_1.ReturnToWarehouseService])
], ReturnToWarehouseController);
let RtwListController = class RtwListController {
    constructor(rtwService) {
        this.rtwService = rtwService;
    }
    async findAll(req, branchId) {
        return this.rtwService.findAll(req.user.tenantId, branchId);
    }
};
exports.RtwListController = RtwListController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RtwListController.prototype, "findAll", null);
exports.RtwListController = RtwListController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('logistics/rtw'),
    __metadata("design:paramtypes", [rtw_service_1.ReturnToWarehouseService])
], RtwListController);
//# sourceMappingURL=rtw.controller.js.map