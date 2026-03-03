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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanEnforcementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const translation_service_1 = require("../i18n/translation.service");
let PlanEnforcementService = class PlanEnforcementService {
    constructor(prisma, t) {
        this.prisma = prisma;
        this.t = t;
    }
    async getTenantSubscription(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                subscription: { include: { plan: true } },
                plan: true
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Tenant' }));
        }
        if (tenant.subscription) {
            if (tenant.subscription.status === 'PAST_DUE' || tenant.subscription.status === 'CANCELED') {
                throw new common_1.ForbiddenException(this.t.translate('plan.subscription_invalid', 'EN', { status: tenant.subscription.status }));
            }
            return tenant.subscription.plan;
        }
        return tenant.plan;
    }
    async checkUserLimit(tenantId) {
        const plan = await this.getTenantSubscription(tenantId);
        if (!plan)
            return;
        const userCount = await this.prisma.user.count({ where: { tenantId } });
        const limits = plan.limits;
        if (limits && limits.maxUsers && limits.maxUsers !== -1 && userCount >= limits.maxUsers) {
            throw new common_1.ForbiddenException(this.t.translate('plan.limit_exceeded', 'EN', { limit: 'users' }));
        }
    }
    async checkBranchLimit(tenantId) {
        const plan = await this.getTenantSubscription(tenantId);
        if (!plan)
            return;
        const branchCount = await this.prisma.branch.count({ where: { tenantId } });
        const limits = plan.limits;
        if (limits && limits.maxBranches && limits.maxBranches !== -1 && branchCount >= limits.maxBranches) {
            throw new common_1.ForbiddenException(this.t.translate('plan.limit_exceeded', 'EN', { limit: 'branches' }));
        }
    }
    async checkProductLimit(tenantId) {
        const plan = await this.getTenantSubscription(tenantId);
        if (!plan)
            return;
        const productCountGroup = await this.prisma.inventory.groupBy({
            by: ['productId'],
            where: { tenantId }
        });
        const count = productCountGroup.length;
        const limits = plan.limits;
        if (limits && limits.maxProducts && limits.maxProducts !== -1 && count >= limits.maxProducts) {
            throw new common_1.ForbiddenException(this.t.translate('plan.limit_exceeded', 'EN', { limit: 'products' }));
        }
    }
    async checkFeatureAccess(tenantId, feature) {
        const plan = await this.getTenantSubscription(tenantId);
        if (!plan)
            return;
        const features = plan.features;
        if (!features || !features[feature]) {
            throw new common_1.ForbiddenException(this.t.translate('plan.feature_disabled', 'EN', { feature }));
        }
    }
};
exports.PlanEnforcementService = PlanEnforcementService;
exports.PlanEnforcementService = PlanEnforcementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        translation_service_1.TranslationService])
], PlanEnforcementService);
//# sourceMappingURL=plan-enforcement.service.js.map