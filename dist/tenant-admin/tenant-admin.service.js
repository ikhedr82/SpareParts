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
        var _a, _b, _c, _d;
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                branches: { select: { id: true, name: true } },
                _count: { select: { users: true, branches: true, inventory: true } },
                plan: true,
                subscription: true,
            },
        });
        if (!tenant)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Tenant' }));
        const usage = await this.usageTracking.getUsage(tenantId);
        const planLimits = ((_a = tenant.plan) === null || _a === void 0 ? void 0 : _a.limits) || {
            maxUsers: ((_b = tenant.plan) === null || _b === void 0 ? void 0 : _b.maxUsers) || 10,
            maxBranches: ((_c = tenant.plan) === null || _c === void 0 ? void 0 : _c.maxBranches) || 2,
            maxProducts: ((_d = tenant.plan) === null || _d === void 0 ? void 0 : _d.maxProducts) || 1000,
        };
        return Object.assign(Object.assign({}, tenant), { _count: Object.assign(Object.assign({}, tenant._count), { products: usage.products }), planLimits });
    }
    async getTenantInvoices(tenantId) {
        return this.prisma.billingInvoice.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getTenantActivity(tenantId, limit = 10) {
        return this.auditService.getPlatformAuditLogs({
            tenantId,
            limit,
        });
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
    async createPlan(adminUserId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const plan = await tx.plan.create({ data: dto });
            await this.auditService.logAction('PLATFORM', adminUserId, 'CREATE_PLAN', 'Plan', plan.id, null, dto, undefined, undefined, tx);
            return plan;
        });
    }
    async updatePlan(adminUserId, id, dto) {
        const oldPlan = await this.prisma.plan.findUnique({ where: { id } });
        if (!oldPlan)
            throw new common_1.NotFoundException('Plan not found');
        return this.prisma.$transaction(async (tx) => {
            const plan = await tx.plan.update({ where: { id }, data: dto });
            await this.auditService.logAction('PLATFORM', adminUserId, 'UPDATE_PLAN', 'Plan', id, oldPlan, dto, undefined, undefined, tx);
            return plan;
        });
    }
    async deletePlan(adminUserId, id) {
        const oldPlan = await this.prisma.plan.findUnique({ where: { id } });
        if (!oldPlan)
            throw new common_1.NotFoundException('Plan not found');
        return this.prisma.$transaction(async (tx) => {
            const plan = await tx.plan.delete({ where: { id } });
            await this.auditService.logAction('PLATFORM', adminUserId, 'DELETE_PLAN', 'Plan', id, oldPlan, null, undefined, undefined, tx);
            return plan;
        });
    }
    async findAllPlans() {
        return this.prisma.plan.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async createCurrency(adminUserId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const curr = await tx.currency.create({ data: dto });
            await this.auditService.logAction('PLATFORM', adminUserId, 'CREATE_CURRENCY', 'Currency', curr.code, null, dto, undefined, undefined, tx);
            return curr;
        });
    }
    async updateCurrency(adminUserId, code, dto) {
        const oldCurr = await this.prisma.currency.findUnique({ where: { code } });
        if (!oldCurr)
            throw new common_1.NotFoundException('Currency not found');
        return this.prisma.$transaction(async (tx) => {
            const curr = await tx.currency.update({ where: { code }, data: dto });
            await this.auditService.logAction('PLATFORM', adminUserId, 'UPDATE_CURRENCY', 'Currency', curr.code, oldCurr, dto, undefined, undefined, tx);
            return curr;
        });
    }
    async findAllCurrencies(params = {}) {
        const { page = 1, limit = 100, search } = params;
        const skip = (page - 1) * Number(limit);
        const where = {};
        if (search) {
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.currency.findMany({
                where,
                orderBy: { code: 'asc' },
                skip,
                take: Number(limit),
            }),
            this.prisma.currency.count({ where }),
        ]);
        return { items, total, page: Number(page), limit: Number(limit) };
    }
    async createExchangeRate(adminUserId, tenantId, dto) {
        if (tenantId !== 'PLATFORM') {
            await this.planEnforcement.checkFeatureAccess(tenantId, 'multiCurrency');
        }
        const oldRate = await this.prisma.exchangeRate.findUnique({
            where: {
                fromCurrency_toCurrency: {
                    fromCurrency: dto.fromCurrencyId,
                    toCurrency: dto.toCurrencyId,
                },
            },
        });
        return this.prisma.$transaction(async (tx) => {
            const rate = await tx.exchangeRate.upsert({
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
            await this.auditService.logAction('PLATFORM', adminUserId, oldRate ? 'UPDATE_EXCHANGE_RATE' : 'CREATE_EXCHANGE_RATE', 'ExchangeRate', `${dto.fromCurrencyId}_${dto.toCurrencyId}`, oldRate, dto, undefined, undefined, tx);
            return rate;
        });
    }
    async findAllExchangeRates(params = {}) {
        const { page = 1, limit = 50, search } = params;
        const skip = (page - 1) * Number(limit);
        const where = {};
        if (search) {
            where.OR = [
                { fromCurrency: { contains: search, mode: 'insensitive' } },
                { toCurrency: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.exchangeRate.findMany({
                where,
                include: { fromCurrencyRef: true, toCurrencyRef: true },
                orderBy: { effectiveAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            this.prisma.exchangeRate.count({ where }),
        ]);
        return { items, total, page: Number(page), limit: Number(limit) };
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
    async getGlobalInvoices(params = {}) {
        const { page = 1, limit = 25, search } = params;
        const skip = (page - 1) * Number(limit);
        const where = {};
        if (search) {
            where.tenant = {
                name: { contains: search, mode: 'insensitive' }
            };
        }
        const [items, total] = await Promise.all([
            this.prisma.billingInvoice.findMany({
                where,
                include: { tenant: { select: { name: true, subdomain: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit)
            }),
            this.prisma.billingInvoice.count({ where }),
        ]);
        return { items, total, page: Number(page), limit: Number(limit) };
    }
    async getGlobalBillingActivity() {
        return this.prisma.auditLog.findMany({
            where: {
                action: {
                    in: ['CREATE_PLAN', 'UPDATE_PLAN', 'DELETE_PLAN', 'CHANGE_PLAN', 'CANCEL_SUBSCRIPTION', 'CREATE_TENANT']
                }
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { email: true } } }
        });
    }
    async createSupportTicket(adminUserId, tenantId, subject, description, priority) {
        return this.prisma.$transaction(async (tx) => {
            const ticket = await tx.supportTicket.create({
                data: {
                    tenantId,
                    subject,
                    description,
                    priority,
                    status: 'OPEN',
                },
                include: { tenant: { select: { name: true } } }
            });
            await this.auditService.logAction('PLATFORM', adminUserId, 'CREATE_SUPPORT_TICKET', 'SupportTicket', ticket.id, null, { tenantId, subject, priority }, undefined, undefined, tx);
            return ticket;
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
    async updateTicketStatus(adminUserId, id, status) {
        const oldTicket = await this.prisma.supportTicket.findUnique({ where: { id } });
        if (!oldTicket)
            throw new common_1.NotFoundException('Ticket not found');
        return this.prisma.$transaction(async (tx) => {
            const ticket = await tx.supportTicket.update({
                where: { id },
                data: { status }
            });
            await this.auditService.logAction('PLATFORM', adminUserId, 'UPDATE_SUPPORT_STATUS', 'SupportTicket', id, { status: oldTicket.status }, { status }, undefined, undefined, tx);
            return ticket;
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