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
exports.TenantAdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../shared/audit.service");
const outbox_service_1 = require("../shared/outbox.service");
const translation_service_1 = require("../i18n/translation.service");
const plan_enforcement_service_1 = require("./plan-enforcement.service");
const usage_tracking_service_1 = require("./usage-tracking.service");
const bcrypt = require("bcrypt");
let TenantAdminService = class TenantAdminService {
    constructor(prisma, auditService, outbox, t, planEnforcement, usageTracking) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.outbox = outbox;
        this.t = t;
        this.planEnforcement = planEnforcement;
        this.usageTracking = usageTracking;
    }
    async createTenant(adminUserId, dto) {
        const existing = await this.prisma.tenant.findUnique({ where: { subdomain: dto.subdomain } });
        if (existing)
            throw new common_1.ConflictException('Subdomain already taken');
        const existingUser = await this.prisma.user.findUnique({ where: { email: dto.adminEmail } });
        if (existingUser)
            throw new common_1.ConflictException('Admin email already in use');
        const hashedPassword = await bcrypt.hash(dto.adminPassword, 10);
        return this.prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: dto.name,
                    subdomain: dto.subdomain,
                    planId: dto.planId,
                    defaultLanguage: dto.defaultLanguage,
                    supportedLanguages: dto.supportedLanguages,
                    baseCurrency: dto.baseCurrency,
                    supportedCurrencies: dto.supportedCurrencies,
                    status: 'ACTIVE',
                },
            });
            await tx.subscription.create({
                data: {
                    tenantId: tenant.id,
                    planId: tenant.planId,
                    status: 'ACTIVE',
                    provider: 'MANUAL',
                },
            });
            const adminRole = await tx.role.create({
                data: {
                    tenantId: tenant.id,
                    name: 'Tenant Admin',
                    scope: 'TENANT',
                    description: 'Full access administrator for this tenant',
                },
            });
            const allPermissions = await tx.permission.findMany();
            await tx.rolePermission.createMany({
                data: allPermissions.map((perm) => ({
                    roleId: adminRole.id,
                    permissionId: perm.id,
                })),
                skipDuplicates: true,
            });
            const adminUser = await tx.user.create({
                data: {
                    email: dto.adminEmail,
                    passwordHash: hashedPassword,
                    tenantId: tenant.id,
                },
            });
            await tx.userRole.create({
                data: {
                    userId: adminUser.id,
                    roleId: adminRole.id,
                    tenantId: tenant.id,
                },
            });
            await this.auditService.logAction('PLATFORM', adminUserId, 'CREATE_TENANT', 'Tenant', tenant.id, null, {
                name: dto.name,
                subdomain: dto.subdomain,
                planId: dto.planId,
                adminEmail: dto.adminEmail,
                languages: { default: dto.defaultLanguage, supported: dto.supportedLanguages },
                currencies: { base: dto.baseCurrency, supported: dto.supportedCurrencies }
            }, undefined, undefined, tx);
            await this.outbox.schedule(tx, {
                tenantId: 'PLATFORM',
                topic: 'tenant.created',
                payload: { tenantId: tenant.id, name: dto.name, subdomain: dto.subdomain },
            });
            return Object.assign(Object.assign({}, tenant), { adminUser: { id: adminUser.id, email: adminUser.email } });
        });
    }
    async suspendTenant(adminUserId, tenantId, dto) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Tenant' }));
        if (tenant.status === 'SUSPENDED')
            throw new common_1.BadRequestException(this.t.translate('errors.tenant.already_suspended', 'EN'));
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.tenant.update({
                where: { id: tenantId },
                data: {
                    status: 'SUSPENDED',
                    suspensionReason: dto.reason,
                },
            });
            await this.auditService.logAction('PLATFORM', adminUserId, 'SUSPEND_TENANT', 'Tenant', tenantId, { status: 'ACTIVE' }, { status: 'SUSPENDED', reason: dto.reason }, undefined, undefined, tx);
            await this.outbox.schedule(tx, {
                tenantId: 'PLATFORM',
                topic: 'tenant.suspended',
                payload: { tenantId, reason: dto.reason },
            });
            return updated;
        });
    }
    async reactivateTenant(adminUserId, tenantId) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Tenant' }));
        if (tenant.status === 'ACTIVE')
            throw new common_1.BadRequestException(this.t.translate('errors.tenant.already_active', 'EN'));
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.tenant.update({
                where: { id: tenantId },
                data: {
                    status: 'ACTIVE',
                    suspensionReason: null,
                },
            });
            await this.auditService.logAction('PLATFORM', adminUserId, 'REACTIVATE_TENANT', 'Tenant', tenantId, { status: 'SUSPENDED' }, { status: 'ACTIVE' }, undefined, undefined, tx);
            await this.outbox.schedule(tx, {
                tenantId: 'PLATFORM',
                topic: 'tenant.reactivated',
                payload: { tenantId },
            });
            return updated;
        });
    }
    async findAll(params = {}) {
        const { page = 1, limit = 10, search, status, planId } = params;
        const skip = (page - 1) * Number(limit);
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { subdomain: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status)
            where.status = status;
        if (planId)
            where.planId = planId;
        const [items, total] = await Promise.all([
            this.prisma.tenant.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    subdomain: true,
                    status: true,
                    planId: true,
                    plan: { select: { name: true, price: true, currency: true } },
                    subscription: {
                        select: {
                            status: true,
                            trialEndDate: true,
                            currentPeriodEnd: true,
                        }
                    },
                    suspensionReason: true,
                    defaultLanguage: true,
                    supportedLanguages: true,
                    baseCurrency: true,
                    supportedCurrencies: true,
                    createdAt: true,
                    _count: { select: { users: true, branches: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            this.prisma.tenant.count({ where }),
        ]);
        return { items, total, page: Number(page), limit: Number(limit) };
    }
    async findOne(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                branches: { select: { id: true, name: true } },
                _count: { select: { users: true } },
                plan: true,
            },
        });
        if (!tenant)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Tenant' }));
        return tenant;
    }
    async updateLanguageSettings(adminUserId, tenantId, dto) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Tenant' }));
        const supportedLanguages = dto.supportedLanguages || tenant.supportedLanguages;
        const defaultLanguage = dto.defaultLanguage || tenant.defaultLanguage;
        if (!supportedLanguages.includes(defaultLanguage)) {
            throw new common_1.BadRequestException(this.t.translate('errors.tenant.default_must_be_supported', 'EN'));
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.tenant.update({
                where: { id: tenantId },
                data: {
                    defaultLanguage,
                    supportedLanguages,
                },
            });
            await this.auditService.logAction(tenantId, adminUserId, 'UPDATE_LANGUAGE', 'Tenant', tenantId, { defaultLanguage: tenant.defaultLanguage, supportedLanguages: tenant.supportedLanguages }, { defaultLanguage, supportedLanguages }, undefined, undefined, tx);
            await this.outbox.schedule(tx, {
                tenantId: 'PLATFORM',
                topic: 'tenant.language_updated',
                payload: { tenantId, defaultLanguage, supportedLanguages },
            });
            return updated;
        });
    }
    async findAllUsers(params = {}) {
        const { page = 1, limit = 10, search } = params;
        const skip = (page - 1) * Number(limit);
        const where = {};
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    status: true,
                    isPlatformUser: true,
                    createdAt: true,
                    tenant: { select: { id: true, name: true, subdomain: true } },
                    userRoles: {
                        select: {
                            role: { select: { name: true, scope: true } },
                            tenant: { select: { name: true } },
                            branch: { select: { name: true } },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            this.prisma.user.count({ where }),
        ]);
        return { items, total, page: Number(page), limit: Number(limit) };
    }
    async createPlan(dto) {
        return this.prisma.plan.create({ data: dto });
    }
    async updatePlan(id, dto) {
        return this.prisma.plan.update({ where: { id }, data: dto });
    }
    async deletePlan(id) {
        return this.prisma.plan.delete({ where: { id } });
    }
    async findAllPlans() {
        return this.prisma.plan.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async createCurrency(dto) {
        return this.prisma.currency.create({ data: dto });
    }
    async updateCurrency(code, dto) {
        return this.prisma.currency.update({ where: { code }, data: dto });
    }
    async findAllCurrencies() {
        return this.prisma.currency.findMany({ orderBy: { code: 'asc' } });
    }
    async createExchangeRate(tenantId, dto) {
        if (tenantId !== 'PLATFORM') {
            await this.planEnforcement.checkFeatureAccess(tenantId, 'multiCurrency');
        }
        return this.prisma.exchangeRate.upsert({
            where: {
                fromCurrency_toCurrency: {
                    fromCurrency: dto.fromCurrencyId,
                    toCurrency: dto.toCurrencyId,
                },
            },
            update: {
                rate: dto.rate,
                source: dto.source || 'Manual',
                effectiveAt: new Date(),
            },
            create: {
                fromCurrency: dto.fromCurrencyId,
                toCurrency: dto.toCurrencyId,
                rate: dto.rate,
                source: dto.source || 'Manual',
            },
        });
    }
    async findAllExchangeRates() {
        return this.prisma.exchangeRate.findMany({
            include: { fromCurrencyRef: true, toCurrencyRef: true },
            orderBy: { effectiveAt: 'desc' },
        });
    }
    async getPlanStatus(tenantId) {
        var _a;
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                plan: true,
                subscription: true
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Tenant' }));
        }
        const usage = await this.usageTracking.getUsage(tenantId);
        return {
            plan: tenant.plan,
            subscription: tenant.subscription,
            status: ((_a = tenant.subscription) === null || _a === void 0 ? void 0 : _a.status) || 'ACTIVE',
            usage,
            limits: tenant.plan.limits,
        };
    }
    async getGlobalBillingStats() {
        const tenants = await this.prisma.tenant.findMany({
            include: { plan: true, subscription: true }
        });
        const activeSubscribers = tenants.filter(t => { var _a; return ((_a = t.subscription) === null || _a === void 0 ? void 0 : _a.status) === 'ACTIVE'; }).length;
        const pastDueSubscribers = tenants.filter(t => { var _a; return ((_a = t.subscription) === null || _a === void 0 ? void 0 : _a.status) === 'PAST_DUE'; }).length;
        const mrr = tenants.reduce((sum, t) => {
            var _a, _b, _c;
            if (((_a = t.subscription) === null || _a === void 0 ? void 0 : _a.status) === 'ACTIVE' || ((_b = t.subscription) === null || _b === void 0 ? void 0 : _b.status) === 'PAST_DUE') {
                return sum + (((_c = t.plan) === null || _c === void 0 ? void 0 : _c.price) || 0);
            }
            return sum;
        }, 0);
        return {
            mrr,
            activeSubscribers,
            pastDueSubscribers,
            totalTenants: tenants.length
        };
    }
    async getGlobalInvoices() {
        return this.prisma.billingInvoice.findMany({
            include: { tenant: { select: { name: true, subdomain: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    }
    async createSupportTicket(tenantId, subject, description, priority) {
        return this.prisma.supportTicket.create({
            data: {
                tenantId,
                subject,
                description,
                priority,
                status: 'OPEN',
            },
            include: { tenant: { select: { name: true } } }
        });
    }
    async findAllTickets(params = {}) {
        const { page = 1, limit = 10, search, status } = params;
        const skip = (page - 1) * Number(limit);
        const where = {};
        if (search) {
            where.OR = [
                { subject: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status)
            where.status = status;
        const [items, total] = await Promise.all([
            this.prisma.supportTicket.findMany({
                where,
                include: { tenant: { select: { name: true, subdomain: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            this.prisma.supportTicket.count({ where }),
        ]);
        return { items, total, page: Number(page), limit: Number(limit) };
    }
    async updateTicketStatus(id, status) {
        return this.prisma.supportTicket.update({
            where: { id },
            data: { status }
        });
    }
    async changeTenantPlan(adminUserId, tenantId, planId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { subscription: true }
        });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found');
        return this.prisma.$transaction(async (tx) => {
            const updatedTenant = await tx.tenant.update({
                where: { id: tenantId },
                data: { planId }
            });
            if (tenant.subscription) {
                await tx.subscription.update({
                    where: { id: tenant.subscription.id },
                    data: { planId, status: 'ACTIVE' }
                });
            }
            else {
                await tx.subscription.create({
                    data: {
                        tenantId,
                        planId,
                        status: 'ACTIVE',
                        billingCycle: 'MONTHLY',
                        startDate: new Date(),
                    }
                });
            }
            await this.auditService.logAction('PLATFORM', adminUserId, 'CHANGE_PLAN', 'Tenant', tenantId, { oldPlanId: tenant.planId }, { newPlanId: planId }, undefined, undefined, tx);
            return updatedTenant;
        });
    }
    async findAllSubscriptions(params = {}) {
        const { page = 1, limit = 10, search, status } = params;
        const skip = (page - 1) * Number(limit);
        const where = {};
        if (search) {
            where.OR = [
                { tenant: { name: { contains: search, mode: 'insensitive' } } },
                { tenant: { subdomain: { contains: search, mode: 'insensitive' } } },
            ];
        }
        if (status)
            where.status = status;
        const [items, total] = await Promise.all([
            this.prisma.subscription.findMany({
                where,
                include: {
                    tenant: { select: { id: true, name: true, subdomain: true } },
                    plan: { select: { id: true, name: true, price: true, currency: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            this.prisma.subscription.count({ where }),
        ]);
        return { items, total, page: Number(page), limit: Number(limit) };
    }
    async cancelSubscription(adminUserId, subscriptionId) {
        const sub = await this.prisma.subscription.findUnique({
            where: { id: subscriptionId },
            include: { tenant: true }
        });
        if (!sub)
            throw new common_1.NotFoundException('Subscription not found');
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.subscription.update({
                where: { id: subscriptionId },
                data: { status: 'CANCELED', endDate: new Date() }
            });
            await this.auditService.logAction('PLATFORM', adminUserId, 'CANCEL_SUBSCRIPTION', 'Subscription', subscriptionId, { status: sub.status }, { status: 'CANCELED' }, undefined, undefined, tx);
            return updated;
        });
    }
};
exports.TenantAdminService = TenantAdminService;
exports.TenantAdminService = TenantAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        outbox_service_1.OutboxService,
        translation_service_1.TranslationService,
        plan_enforcement_service_1.PlanEnforcementService,
        usage_tracking_service_1.UsageTrackingService])
], TenantAdminService);
//# sourceMappingURL=tenant-admin.service.js.map