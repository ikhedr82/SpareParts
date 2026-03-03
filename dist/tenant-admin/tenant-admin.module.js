"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantAdminModule = void 0;
const common_1 = require("@nestjs/common");
const tenant_admin_controller_1 = require("./tenant-admin.controller");
const billing_controller_1 = require("./billing.controller");
const tenant_admin_service_1 = require("./tenant-admin.service");
const plan_enforcement_service_1 = require("./plan-enforcement.service");
const billing_service_1 = require("./billing.service");
const usage_tracking_service_1 = require("./usage-tracking.service");
const prisma_module_1 = require("../prisma/prisma.module");
const stripe_service_1 = require("./stripe.service");
const stripe_webhook_controller_1 = require("./stripe-webhook.controller");
let TenantAdminModule = class TenantAdminModule {
};
exports.TenantAdminModule = TenantAdminModule;
exports.TenantAdminModule = TenantAdminModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [tenant_admin_controller_1.TenantAdminController, tenant_admin_controller_1.PlatformUsersController, tenant_admin_controller_1.PlansController, tenant_admin_controller_1.CurrenciesController, tenant_admin_controller_1.PlanStatusController, billing_controller_1.BillingController, stripe_webhook_controller_1.StripeWebhookController],
        providers: [tenant_admin_service_1.TenantAdminService, plan_enforcement_service_1.PlanEnforcementService, billing_service_1.BillingService, usage_tracking_service_1.UsageTrackingService, stripe_service_1.StripeService],
        exports: [tenant_admin_service_1.TenantAdminService, plan_enforcement_service_1.PlanEnforcementService, billing_service_1.BillingService, usage_tracking_service_1.UsageTrackingService, stripe_service_1.StripeService],
    })
], TenantAdminModule);
//# sourceMappingURL=tenant-admin.module.js.map