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
exports.ZReportsController = void 0;
const common_1 = require("@nestjs/common");
const z_reports_service_1 = require("./z-reports.service");
const permissions_decorator_1 = require("../auth/permissions.decorator");
const permissions_guard_1 = require("../auth/permissions.guard");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ZReportsController = class ZReportsController {
    constructor(zReportsService) {
        this.zReportsService = zReportsService;
    }
    async closeDay(body) {
        return this.zReportsService.closeDay(body.branchId, body.closingCash);
    }
    async findAll(branchId) {
        return this.zReportsService.findAll(branchId);
    }
    async findOne(id) {
        return this.zReportsService.findOne(id);
    }
};
exports.ZReportsController = ZReportsController;
__decorate([
    (0, common_1.Post)('close-day'),
    (0, permissions_decorator_1.RequirePermissions)('CLOSE_Z_REPORT'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ZReportsController.prototype, "closeDay", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('VIEW_Z_REPORT'),
    __param(0, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZReportsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZReportsController.prototype, "findOne", null);
exports.ZReportsController = ZReportsController = __decorate([
    (0, common_1.Controller)('z-reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [z_reports_service_1.ZReportsService])
], ZReportsController);
//# sourceMappingURL=z-reports.controller.js.map