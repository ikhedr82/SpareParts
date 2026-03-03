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
exports.PlanStatusController = exports.CurrenciesController = exports.PlansController = exports.PlatformUsersController = exports.TenantAdminController = void 0;
const common_1 = require("@nestjs/common");
const tenant_admin_service_1 = require("./tenant-admin.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const auth_utils_1 = require("../auth/utils/auth-utils");
const suspend_tenant_dto_1 = require("./dtos/suspend-tenant.dto");
const update_tenant_language_dto_1 = require("./dto/update-tenant-language.dto");
const create_tenant_dto_1 = require("./dto/create-tenant.dto");
const plan_dto_1 = require("./dto/plan.dto");
const currency_dto_1 = require("./dto/currency.dto");
const exchange_rate_dto_1 = require("./dto/exchange-rate.dto");
let TenantAdminController = class TenantAdminController {
    constructor(service) {
        this.service = service;
    }
    async create(dto, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.createTenant(req.user.id, dto);
    }
    async suspend(id, dto, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.suspendTenant(req.user.id, id, dto);
    }
    async reactivate(id, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.reactivateTenant(req.user.id, id);
    }
    async findAll(req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.findAll();
    }
    async findOne(id, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.findOne(id);
    }
    async updateLanguage(id, dto, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.updateLanguageSettings(req.user.id, id, dto);
    }
    async getStats(req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.getGlobalBillingStats();
    }
    async getInvoices(req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.getGlobalInvoices();
    }
};
exports.TenantAdminController = TenantAdminController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tenant_dto_1.CreateTenantDto, Object]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/suspend'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, suspend_tenant_dto_1.SuspendTenantDto, Object]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "suspend", null);
__decorate([
    (0, common_1.Post)(':id/reactivate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "reactivate", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/language'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tenant_language_dto_1.UpdateTenantLanguageDto, Object]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "updateLanguage", null);
__decorate([
    (0, common_1.Get)('billing/stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('billing/invoices'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "getInvoices", null);
exports.TenantAdminController = TenantAdminController = __decorate([
    (0, common_1.Controller)('api/platform/tenants'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tenant_admin_service_1.TenantAdminService])
], TenantAdminController);
let PlatformUsersController = class PlatformUsersController {
    constructor(service) {
        this.service = service;
    }
    async findAll(req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.findAllUsers();
    }
};
exports.PlatformUsersController = PlatformUsersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlatformUsersController.prototype, "findAll", null);
exports.PlatformUsersController = PlatformUsersController = __decorate([
    (0, common_1.Controller)('api/platform/users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tenant_admin_service_1.TenantAdminService])
], PlatformUsersController);
let PlansController = class PlansController {
    constructor(service) {
        this.service = service;
    }
    async create(dto, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.createPlan(dto);
    }
    async update(id, dto, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.updatePlan(id, dto);
    }
    async remove(id, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.deletePlan(id);
    }
    async findAll() {
        return this.service.findAllPlans();
    }
};
exports.PlansController = PlansController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [plan_dto_1.CreatePlanDto, Object]),
    __metadata("design:returntype", Promise)
], PlansController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, plan_dto_1.UpdatePlanDto, Object]),
    __metadata("design:returntype", Promise)
], PlansController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlansController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlansController.prototype, "findAll", null);
exports.PlansController = PlansController = __decorate([
    (0, common_1.Controller)('api/platform/plans'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tenant_admin_service_1.TenantAdminService])
], PlansController);
let CurrenciesController = class CurrenciesController {
    constructor(service) {
        this.service = service;
    }
    async create(dto, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.createCurrency(dto);
    }
    async update(code, dto, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.updateCurrency(code, dto);
    }
    async findAll() {
        return this.service.findAllCurrencies();
    }
    async createRate(dto, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.createExchangeRate(req.user.tenantId, dto);
    }
    async findAllRates() {
        return this.service.findAllExchangeRates();
    }
};
exports.CurrenciesController = CurrenciesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [currency_dto_1.CreateCurrencyDto, Object]),
    __metadata("design:returntype", Promise)
], CurrenciesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':code'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, currency_dto_1.UpdateCurrencyDto, Object]),
    __metadata("design:returntype", Promise)
], CurrenciesController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CurrenciesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('rates'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [exchange_rate_dto_1.CreateExchangeRateDto, Object]),
    __metadata("design:returntype", Promise)
], CurrenciesController.prototype, "createRate", null);
__decorate([
    (0, common_1.Get)('rates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CurrenciesController.prototype, "findAllRates", null);
exports.CurrenciesController = CurrenciesController = __decorate([
    (0, common_1.Controller)('api/platform/currencies'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tenant_admin_service_1.TenantAdminService])
], CurrenciesController);
let PlanStatusController = class PlanStatusController {
    constructor(service) {
        this.service = service;
    }
    async getStatus(req) {
        return this.service.getPlanStatus(req.user.tenantId);
    }
};
exports.PlanStatusController = PlanStatusController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlanStatusController.prototype, "getStatus", null);
exports.PlanStatusController = PlanStatusController = __decorate([
    (0, common_1.Controller)('api/tenant/plan'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tenant_admin_service_1.TenantAdminService])
], PlanStatusController);
//# sourceMappingURL=tenant-admin.controller.js.map