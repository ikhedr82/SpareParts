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
exports.PlanStatusController = exports.SubscriptionsController = exports.AuditLogsController = exports.CurrenciesController = exports.PlansController = exports.PlatformUsersController = exports.SupportController = exports.TenantAdminController = void 0;
const common_1 = require("@nestjs/common");
const tenant_admin_service_1 = require("./tenant-admin.service");
const audit_service_1 = require("../shared/audit.service");
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
    async findAll(req, page, limit, search, status, planId) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.findAll({ page, limit, search, status, planId });
    }
    async findOne(id, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.findOne(id);
    }
    async getTenantInvoices(id, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.getTenantInvoices(id);
    }
    async getTenantActivity(id, limit, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.getTenantActivity(id, limit);
    }
    async updateLanguage(id, dto, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.updateLanguageSettings(req.user.id, id, dto);
    }
    async getStats(req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.getGlobalBillingStats();
    }
    async getGlobalBillingActivity(req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.getGlobalBillingActivity();
    }
    async getGlobalInvoices(req, page, limit, search) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.getGlobalInvoices({ page, limit, search });
    }
    async changePlan(id, planId, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.changeTenantPlan(req.user.id, id, planId);
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
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('planId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String]),
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
    (0, common_1.Get)(':id/invoices'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "getTenantInvoices", null);
__decorate([
    (0, common_1.Get)(':id/activity'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "getTenantActivity", null);
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
    (0, common_1.Get)('billing/activity'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "getGlobalBillingActivity", null);
__decorate([
    (0, common_1.Get)('billing/invoices'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "getGlobalInvoices", null);
__decorate([
    (0, common_1.Patch)(':id/plan'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('planId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "changePlan", null);
exports.TenantAdminController = TenantAdminController = __decorate([
    (0, common_1.Controller)('api/platform/tenants'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tenant_admin_service_1.TenantAdminService])
], TenantAdminController);
let SupportController = class SupportController {
    constructor(service) {
        this.service = service;
    }
    async create(dto, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.createSupportTicket(req.user.id, dto.tenantId || null, dto.subject, dto.description, dto.priority);
    }
    async findAll(req, page, limit, search, status) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.findAllTickets({ page, limit, search, status });
    }
    async updateStatus(id, status, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.updateTicketStatus(req.user.id, id, status);
    }
};
exports.SupportController = SupportController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "updateStatus", null);
exports.SupportController = SupportController = __decorate([
    (0, common_1.Controller)('api/platform/support'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tenant_admin_service_1.TenantAdminService])
], SupportController);
let PlatformUsersController = class PlatformUsersController {
    constructor(service) {
        this.service = service;
    }
    async findAll(req, page, limit, search) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.findAllUsers({ page, limit, search });
    }
};
exports.PlatformUsersController = PlatformUsersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
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
        return this.service.createPlan(req.user.id, dto);
    }
    async update(id, dto, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.updatePlan(req.user.id, id, dto);
    }
    async remove(id, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.deletePlan(req.user.id, id);
    }
    async findAll(req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
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
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
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
        return this.service.createCurrency(req.user.id, dto);
    }
    async update(code, dto, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.updateCurrency(req.user.id, code, dto);
    }
    async findAll(req, page, limit, search) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.findAllCurrencies({ page, limit, search });
    }
    async createRate(dto, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.createExchangeRate(req.user.id, req.user.tenantId, dto);
    }
    async findAllRates(req, page, limit, search) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.findAllExchangeRates({ page, limit, search });
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
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
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
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
    __metadata("design:returntype", Promise)
], CurrenciesController.prototype, "findAllRates", null);
exports.CurrenciesController = CurrenciesController = __decorate([
    (0, common_1.Controller)('api/platform/currencies'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tenant_admin_service_1.TenantAdminService])
], CurrenciesController);
let AuditLogsController = class AuditLogsController {
    constructor(auditService) {
        this.auditService = auditService;
    }
    async findAll(req, page, limit, tenantId, action, entityType, search) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.auditService.getPlatformAuditLogs({ page, limit, tenantId, action, entityType, search });
    }
};
exports.AuditLogsController = AuditLogsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('tenantId')),
    __param(4, (0, common_1.Query)('action')),
    __param(5, (0, common_1.Query)('entityType')),
    __param(6, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AuditLogsController.prototype, "findAll", null);
exports.AuditLogsController = AuditLogsController = __decorate([
    (0, common_1.Controller)('api/platform/audit-logs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditLogsController);
let SubscriptionsController = class SubscriptionsController {
    constructor(service) {
        this.service = service;
    }
    async findAll(req, page, limit, search, status) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.findAllSubscriptions({ page, limit, search, status });
    }
    async remove(id, req) {
        (0, auth_utils_1.assertPlatformAdmin)(req.user);
        return this.service.cancelSubscription(req.user.id, id);
    }
};
exports.SubscriptionsController = SubscriptionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "remove", null);
exports.SubscriptionsController = SubscriptionsController = __decorate([
    (0, common_1.Controller)('api/platform/subscriptions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tenant_admin_service_1.TenantAdminService])
], SubscriptionsController);
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