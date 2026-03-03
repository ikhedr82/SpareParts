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
exports.CashSessionController = void 0;
const common_1 = require("@nestjs/common");
const cash_session_service_1 = require("./cash-session.service");
const open_cash_session_dto_1 = require("./dto/open-cash-session.dto");
const close_cash_session_dto_1 = require("./dto/close-cash-session.dto");
const permissions_decorator_1 = require("../auth/permissions.decorator");
const permissions_guard_1 = require("../auth/permissions.guard");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let CashSessionController = class CashSessionController {
    constructor(cashSessionService) {
        this.cashSessionService = cashSessionService;
    }
    async open(dto, req) {
        if (!dto.branchId)
            dto.branchId = req.user.branchId;
        return this.cashSessionService.open(dto, req.user.id);
    }
    async close(dto, req) {
        if (!dto.branchId)
            dto.branchId = req.user.branchId;
        return this.cashSessionService.close(dto, req.user.id);
    }
    async getCurrent(req) {
        return this.cashSessionService.getCurrent(req.user.branchId);
    }
};
exports.CashSessionController = CashSessionController;
__decorate([
    (0, common_1.Post)('open'),
    (0, permissions_decorator_1.RequirePermissions)('MANAGE_BRANCH'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [open_cash_session_dto_1.OpenCashSessionDto, Object]),
    __metadata("design:returntype", Promise)
], CashSessionController.prototype, "open", null);
__decorate([
    (0, common_1.Post)('close'),
    (0, permissions_decorator_1.RequirePermissions)('CLOSE_Z_REPORT'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [close_cash_session_dto_1.CloseCashSessionDto, Object]),
    __metadata("design:returntype", Promise)
], CashSessionController.prototype, "close", null);
__decorate([
    (0, common_1.Get)('current'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CashSessionController.prototype, "getCurrent", null);
exports.CashSessionController = CashSessionController = __decorate([
    (0, common_1.Controller)('cash-sessions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [cash_session_service_1.CashSessionService])
], CashSessionController);
//# sourceMappingURL=cash-session.controller.js.map