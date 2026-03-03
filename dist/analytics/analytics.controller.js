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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
const permissions_decorator_1 = require("../auth/permissions.decorator");
const permissions_guard_1 = require("../auth/permissions.guard");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const plan_enforcement_service_1 = require("../tenant-admin/plan-enforcement.service");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService, planEnforcement) {
        this.analyticsService = analyticsService;
        this.planEnforcement = planEnforcement;
    }
    async getDashboard(branchId, req) {
        var _a;
        if ((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.tenantId) {
            await this.planEnforcement.checkFeatureAccess(req.user.tenantId, 'advancedReports');
        }
        return this.analyticsService.getDashboardKPIs(branchId);
    }
    async getSales(period = 'daily', branchId, req) {
        var _a;
        if ((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.tenantId) {
            await this.planEnforcement.checkFeatureAccess(req.user.tenantId, 'advancedReports');
        }
        return this.analyticsService.getSalesReports(period, branchId);
    }
    async getInventory(branchId, req) {
        var _a;
        if ((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.tenantId) {
            await this.planEnforcement.checkFeatureAccess(req.user.tenantId, 'advancedReports');
        }
        return this.analyticsService.getInventoryReport(branchId);
    }
    async getCashFlow(branchId, req) {
        var _a;
        if ((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.tenantId) {
            await this.planEnforcement.checkFeatureAccess(req.user.tenantId, 'advancedReports');
        }
        return this.analyticsService.getCashFlowReport(branchId);
    }
    async getValuation(branchId, req) {
        var _a;
        if ((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.tenantId) {
            await this.planEnforcement.checkFeatureAccess(req.user.tenantId, 'advancedReports');
        }
        return this.analyticsService.getInventoryValuation(branchId);
    }
    async getProfit(branchId, startDate, endDate, req) {
        var _a;
        if ((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.tenantId) {
            await this.planEnforcement.checkFeatureAccess(req.user.tenantId, 'advancedReports');
        }
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.analyticsService.getProfitAnalysis(branchId, start, end);
    }
    async getVat(branchId, startDate, endDate, req) {
        var _a;
        if ((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.tenantId) {
            await this.planEnforcement.checkFeatureAccess(req.user.tenantId, 'advancedReports');
        }
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.analyticsService.getVatReport(branchId, start, end);
    }
    async getCustomerAging(branchId, req) {
        var _a;
        if ((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.tenantId) {
            await this.planEnforcement.checkFeatureAccess(req.user.tenantId, 'advancedReports');
        }
        return this.analyticsService.getCustomerAging(branchId);
    }
    async getSupplierAging(branchId, req) {
        var _a;
        if ((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.tenantId) {
            await this.planEnforcement.checkFeatureAccess(req.user.tenantId, 'advancedReports');
        }
        return this.analyticsService.getSupplierAging(branchId);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, permissions_decorator_1.RequirePermissions)('VIEW_ANALYTICS'),
    __param(0, (0, common_1.Query)('branchId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('sales'),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSales", null);
__decorate([
    (0, common_1.Get)('inventory'),
    (0, permissions_decorator_1.RequirePermissions)('VIEW_INVENTORY'),
    __param(0, (0, common_1.Query)('branchId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getInventory", null);
__decorate([
    (0, common_1.Get)('cash-flow'),
    __param(0, (0, common_1.Query)('branchId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getCashFlow", null);
__decorate([
    (0, common_1.Get)('valuation'),
    (0, permissions_decorator_1.RequirePermissions)('VIEW_ANALYTICS'),
    __param(0, (0, common_1.Query)('branchId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getValuation", null);
__decorate([
    (0, common_1.Get)('profit'),
    (0, permissions_decorator_1.RequirePermissions)('VIEW_ANALYTICS'),
    __param(0, (0, common_1.Query)('branchId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getProfit", null);
__decorate([
    (0, common_1.Get)('vat'),
    (0, permissions_decorator_1.RequirePermissions)('VIEW_ANALYTICS'),
    __param(0, (0, common_1.Query)('branchId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getVat", null);
__decorate([
    (0, common_1.Get)('customer-aging'),
    (0, permissions_decorator_1.RequirePermissions)('VIEW_ANALYTICS'),
    __param(0, (0, common_1.Query)('branchId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getCustomerAging", null);
__decorate([
    (0, common_1.Get)('supplier-aging'),
    (0, permissions_decorator_1.RequirePermissions)('VIEW_ANALYTICS'),
    __param(0, (0, common_1.Query)('branchId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSupplierAging", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService,
        plan_enforcement_service_1.PlanEnforcementService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map