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
exports.AccountingReportsController = void 0;
const common_1 = require("@nestjs/common");
const accounting_reports_service_1 = require("./accounting-reports.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../auth/permissions.guard");
let AccountingReportsController = class AccountingReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async getTrialBalance(from, to) {
        if (!from || !to)
            throw new common_1.BadRequestException('From and To dates are required');
        return this.reportsService.getTrialBalance(new Date(from), new Date(to));
    }
    async getIncomeStatement(from, to) {
        if (!from || !to)
            throw new common_1.BadRequestException('From and To dates are required');
        return this.reportsService.getIncomeStatement(new Date(from), new Date(to));
    }
    async getBalanceSheet(asOf) {
        if (!asOf)
            throw new common_1.BadRequestException('AsOf date is required');
        return this.reportsService.getBalanceSheet(new Date(asOf));
    }
    async getCashFlow(from, to) {
        if (!from || !to)
            throw new common_1.BadRequestException('From and To dates are required');
        return this.reportsService.getCashFlow(new Date(from), new Date(to));
    }
};
exports.AccountingReportsController = AccountingReportsController;
__decorate([
    (0, common_1.Get)('trial-balance'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountingReportsController.prototype, "getTrialBalance", null);
__decorate([
    (0, common_1.Get)('income-statement'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountingReportsController.prototype, "getIncomeStatement", null);
__decorate([
    (0, common_1.Get)('balance-sheet'),
    __param(0, (0, common_1.Query)('asOf')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountingReportsController.prototype, "getBalanceSheet", null);
__decorate([
    (0, common_1.Get)('cash-flow'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccountingReportsController.prototype, "getCashFlow", null);
exports.AccountingReportsController = AccountingReportsController = __decorate([
    (0, common_1.Controller)('accounting/reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [accounting_reports_service_1.AccountingReportsService])
], AccountingReportsController);
//# sourceMappingURL=accounting-reports.controller.js.map