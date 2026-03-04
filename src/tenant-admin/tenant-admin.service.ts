import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
import { TranslationService } from '../i18n/translation.service';
import { PlanEnforcementService } from './plan-enforcement.service';
import { SuspendTenantDto } from './dtos/suspend-tenant.dto';
import { UpdateTenantLanguageDto } from './dto/update-tenant-language.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';
import { CreateCurrencyDto, UpdateCurrencyDto } from './dto/currency.dto';
import { CreateExchangeRateDto } from './dto/exchange-rate.dto';
import { UsageTrackingService } from './usage-tracking.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantAdminService {
    constructor(
        private prisma: PrismaService,
        private auditService: AuditService,
        private outbox: OutboxService,
        private t: TranslationService,
        private planEnforcement: PlanEnforcementService,
        private usageTracking: UsageTrackingService,
    ) { }

    async createTenant(adminUserId: string, dto: CreateTenantDto) {
        // Check subdomain uniqueness
        const existing = await this.prisma.tenant.findUnique({ where: { subdomain: dto.subdomain } });
        if (existing) throw new ConflictException('Subdomain already taken');

        // Check admin email uniqueness
        const existingUser = await this.prisma.user.findUnique({ where: { email: dto.adminEmail } });
        if (existingUser) throw new ConflictException('Admin email already in use');

        const hashedPassword = await bcrypt.hash(dto.adminPassword, 10);

        // checkUserLimit (for initial admin)
        // Note: New tenants don't have a plan boundary yet until created, 
        // but we can check the plan they are signing up for.

        return this.prisma.$transaction(async (tx) => {
            // 1. Create tenant
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

            // 2. Create manual subscription
            await (tx.subscription as any).create({
                data: {
                    tenantId: tenant.id,
                    planId: tenant.planId,
                    status: 'ACTIVE',
                    provider: 'MANUAL',
                },
            });

            // 3. Create tenant admin role
            const adminRole = await tx.role.create({
                data: {
                    tenantId: tenant.id,
                    name: 'Tenant Admin',
                    scope: 'TENANT',
                    description: 'Full access administrator for this tenant',
                },
            });

            // 3. Assign all permissions to admin role
            const allPermissions = await tx.permission.findMany();
            await tx.rolePermission.createMany({
                data: allPermissions.map((perm) => ({
                    roleId: adminRole.id,
                    permissionId: perm.id,
                })),
                skipDuplicates: true,
            });

            // 4. Create admin user
            const adminUser = await tx.user.create({
                data: {
                    email: dto.adminEmail,
                    passwordHash: hashedPassword,
                    tenantId: tenant.id,
                },
            });

            // 5. Assign admin role to user
            await tx.userRole.create({
                data: {
                    userId: adminUser.id,
                    roleId: adminRole.id,
                    tenantId: tenant.id,
                },
            });

            // 6. Audit
            await this.auditService.logAction(
                'PLATFORM',
                adminUserId,
                'CREATE_TENANT',
                'Tenant',
                tenant.id,
                null,
                {
                    name: dto.name,
                    subdomain: dto.subdomain,
                    planId: dto.planId,
                    adminEmail: dto.adminEmail,
                    languages: { default: dto.defaultLanguage, supported: dto.supportedLanguages },
                    currencies: { base: dto.baseCurrency, supported: dto.supportedCurrencies }
                },
                undefined,
                undefined,
                tx,
            );

            await this.outbox.schedule(tx, {
                tenantId: 'PLATFORM',
                topic: 'tenant.created',
                payload: { tenantId: tenant.id, name: dto.name, subdomain: dto.subdomain },
            });

            return {
                ...tenant,
                adminUser: { id: adminUser.id, email: adminUser.email },
            };
        });
    }

    // G-08: Wrapped in $transaction for atomic update + audit
    async suspendTenant(adminUserId: string, tenantId: string, dto: SuspendTenantDto) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Tenant' }));
        if (tenant.status === 'SUSPENDED') throw new BadRequestException(this.t.translate('errors.tenant.already_suspended', 'EN'));

        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.tenant.update({
                where: { id: tenantId },
                data: {
                    status: 'SUSPENDED',
                    suspensionReason: dto.reason,
                },
            });

            await this.auditService.logAction(
                'PLATFORM',
                adminUserId,
                'SUSPEND_TENANT',
                'Tenant',
                tenantId,
                { status: 'ACTIVE' },
                { status: 'SUSPENDED', reason: dto.reason },
                undefined,
                undefined,
                tx,
            );

            await this.outbox.schedule(tx, {
                tenantId: 'PLATFORM',
                topic: 'tenant.suspended',
                payload: { tenantId, reason: dto.reason },
            });

            return updated;
        });
    }

    // G-08: Wrapped in $transaction for atomic update + audit
    async reactivateTenant(adminUserId: string, tenantId: string) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Tenant' }));
        if (tenant.status === 'ACTIVE') throw new BadRequestException(this.t.translate('errors.tenant.already_active', 'EN'));

        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.tenant.update({
                where: { id: tenantId },
                data: {
                    status: 'ACTIVE',
                    suspensionReason: null,
                },
            });

            await this.auditService.logAction(
                'PLATFORM',
                adminUserId,
                'REACTIVATE_TENANT',
                'Tenant',
                tenantId,
                { status: 'SUSPENDED' },
                { status: 'ACTIVE' },
                undefined,
                undefined,
                tx,
            );

            await this.outbox.schedule(tx, {
                tenantId: 'PLATFORM',
                topic: 'tenant.reactivated',
                payload: { tenantId },
            });

            return updated;
        });
    }

    async findAll(params: { page?: number; limit?: number; search?: string; status?: string; planId?: string } = {}) {
        const { page = 1, limit = 10, search, status, planId } = params;
        const skip = (page - 1) * Number(limit);

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { subdomain: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status) where.status = status;
        if (planId) where.planId = planId;

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

    async findOne(tenantId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                branches: { select: { id: true, name: true } },
                _count: { select: { users: true, branches: true, inventory: true } },
                plan: true,
                subscription: true,
            },
        });
        if (!tenant) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Tenant' }));

        // Map inventory count as product count if needed, or get distinct
        const usage = await this.usageTracking.getUsage(tenantId);

        // Map plan limits
        const planLimits = (tenant.plan as any)?.limits || {
            maxUsers: (tenant.plan as any)?.maxUsers || 10,
            maxBranches: (tenant.plan as any)?.maxBranches || 2,
            maxProducts: (tenant.plan as any)?.maxProducts || 1000,
        };

        return {
            ...tenant,
            _count: {
                ...tenant._count,
                products: usage.products,
            },
            planLimits,
        };
    }

    async getTenantInvoices(tenantId: string) {
        return this.prisma.billingInvoice.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getTenantActivity(tenantId: string, limit: number = 10) {
        return this.auditService.getPlatformAuditLogs({
            tenantId,
            limit,
        });
    }

    async updateLanguageSettings(adminUserId: string, tenantId: string, dto: UpdateTenantLanguageDto) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Tenant' }));

        const supportedLanguages = dto.supportedLanguages || tenant.supportedLanguages;
        const defaultLanguage = dto.defaultLanguage || tenant.defaultLanguage;

        // Validate: default must be in supported list
        if (!supportedLanguages.includes(defaultLanguage)) {
            throw new BadRequestException(
                this.t.translate('errors.tenant.default_must_be_supported', 'EN'),
            );
        }

        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.tenant.update({
                where: { id: tenantId },
                data: {
                    defaultLanguage,
                    supportedLanguages,
                },
            });

            await this.auditService.logAction(
                tenantId,
                adminUserId,
                'UPDATE_LANGUAGE',
                'Tenant',
                tenantId,
                { defaultLanguage: tenant.defaultLanguage, supportedLanguages: tenant.supportedLanguages },
                { defaultLanguage, supportedLanguages },
                undefined,
                undefined,
                tx,
            );

            await this.outbox.schedule(tx, {
                tenantId: 'PLATFORM',
                topic: 'tenant.language_updated',
                payload: { tenantId, defaultLanguage, supportedLanguages },
            });

            return updated;
        });
    }

    async findAllUsers(params: { page?: number; limit?: number; search?: string } = {}) {
        const { page = 1, limit = 10, search } = params;
        const skip = (page - 1) * Number(limit);

        const where: any = {};
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

    // Plans CRUD
    async createPlan(adminUserId: string, dto: CreatePlanDto) {
        return this.prisma.$transaction(async (tx) => {
            const plan = await tx.plan.create({ data: dto });
            await this.auditService.logAction(
                'PLATFORM',
                adminUserId,
                'CREATE_PLAN',
                'Plan',
                plan.id,
                null,
                dto,
                undefined,
                undefined,
                tx
            );
            return plan;
        });
    }

    async updatePlan(adminUserId: string, id: string, dto: UpdatePlanDto) {
        const oldPlan = await this.prisma.plan.findUnique({ where: { id } });
        if (!oldPlan) throw new NotFoundException('Plan not found');

        return this.prisma.$transaction(async (tx) => {
            const plan = await tx.plan.update({ where: { id }, data: dto });
            await this.auditService.logAction(
                'PLATFORM',
                adminUserId,
                'UPDATE_PLAN',
                'Plan',
                id,
                oldPlan,
                dto,
                undefined,
                undefined,
                tx
            );
            return plan;
        });
    }

    async deletePlan(adminUserId: string, id: string) {
        const oldPlan = await this.prisma.plan.findUnique({ where: { id } });
        if (!oldPlan) throw new NotFoundException('Plan not found');

        return this.prisma.$transaction(async (tx) => {
            const plan = await tx.plan.delete({ where: { id } });
            await this.auditService.logAction(
                'PLATFORM',
                adminUserId,
                'DELETE_PLAN',
                'Plan',
                id,
                oldPlan,
                null,
                undefined,
                undefined,
                tx
            );
            return plan;
        });
    }

    async findAllPlans() {
        return this.prisma.plan.findMany({ orderBy: { createdAt: 'desc' } });
    }

    // Currencies CRUD
    async createCurrency(adminUserId: string, dto: CreateCurrencyDto) {
        return this.prisma.$transaction(async (tx) => {
            const curr = await tx.currency.create({ data: dto });
            await this.auditService.logAction(
                'PLATFORM',
                adminUserId,
                'CREATE_CURRENCY',
                'Currency',
                curr.code,
                null,
                dto,
                undefined,
                undefined,
                tx
            );
            return curr;
        });
    }

    async updateCurrency(adminUserId: string, code: string, dto: UpdateCurrencyDto) {
        const oldCurr = await this.prisma.currency.findUnique({ where: { code } });
        if (!oldCurr) throw new NotFoundException('Currency not found');

        return this.prisma.$transaction(async (tx) => {
            const curr = await tx.currency.update({ where: { code }, data: dto });
            await this.auditService.logAction(
                'PLATFORM',
                adminUserId,
                'UPDATE_CURRENCY',
                'Currency',
                curr.code,
                oldCurr,
                dto,
                undefined,
                undefined,
                tx
            );
            return curr;
        });
    }

    async findAllCurrencies(params: { page?: number; limit?: number; search?: string } = {}) {
        const { page = 1, limit = 100, search } = params;
        const skip = (page - 1) * Number(limit);

        const where: any = {};
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

    async createExchangeRate(adminUserId: string, tenantId: string, dto: CreateExchangeRateDto) {
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

            await this.auditService.logAction(
                'PLATFORM',
                adminUserId,
                oldRate ? 'UPDATE_EXCHANGE_RATE' : 'CREATE_EXCHANGE_RATE',
                'ExchangeRate',
                `${dto.fromCurrencyId}_${dto.toCurrencyId}`,
                oldRate,
                dto,
                undefined,
                undefined,
                tx
            );

            return rate;
        });
    }

    async findAllExchangeRates(params: { page?: number; limit?: number; search?: string } = {}) {
        const { page = 1, limit = 50, search } = params;
        const skip = (page - 1) * Number(limit);

        const where: any = {};
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

    async getPlanStatus(tenantId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                plan: true,
                subscription: true
            },
        });

        if (!tenant) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Tenant' }));
        }

        const usage = await this.usageTracking.getUsage(tenantId);

        return {
            plan: (tenant as any).plan,
            subscription: (tenant as any).subscription,
            status: (tenant as any).subscription?.status || 'ACTIVE',
            usage,
            limits: (tenant as any).plan.limits,
        };
    }

    async getGlobalBillingStats() {
        const tenants = await this.prisma.tenant.findMany({
            include: { plan: true, subscription: true }
        });

        const activeSubscribers = tenants.filter(t => (t as any).subscription?.status === 'ACTIVE').length;
        const pastDueSubscribers = tenants.filter(t => (t as any).subscription?.status === 'PAST_DUE').length;
        const mrr = tenants.reduce((sum, t) => {
            if ((t as any).subscription?.status === 'ACTIVE' || (t as any).subscription?.status === 'PAST_DUE') {
                return sum + ((t as any).plan?.price || 0);
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

    async getGlobalInvoices(params: { page?: number; limit?: number; search?: string } = {}) {
        const { page = 1, limit = 25, search } = params;
        const skip = (page - 1) * Number(limit);

        const where: any = {};
        if (search) {
            where.tenant = {
                name: { contains: search, mode: 'insensitive' }
            };
        }

        const [items, total] = await Promise.all([
            (this.prisma as any).billingInvoice.findMany({
                where,
                include: { tenant: { select: { name: true, subdomain: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit)
            }),
            (this.prisma as any).billingInvoice.count({ where }),
        ]);

        return { items, total, page: Number(page), limit: Number(limit) };
    }

    async getGlobalBillingActivity() {
        // Fetch recent audit logs related to billing/subscriptions
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

    // Support Tickets
    async createSupportTicket(adminUserId: string, tenantId: string | null, subject: string, description: string, priority: any) {
        return this.prisma.$transaction(async (tx) => {
            const ticket = await (tx as any).supportTicket.create({
                data: {
                    tenantId,
                    subject,
                    description,
                    priority,
                    status: 'OPEN',
                },
                include: { tenant: { select: { name: true } } }
            });

            await this.auditService.logAction(
                'PLATFORM',
                adminUserId,
                'CREATE_SUPPORT_TICKET',
                'SupportTicket',
                ticket.id,
                null,
                { tenantId, subject, priority },
                undefined,
                undefined,
                tx
            );

            return ticket;
        });
    }

    async findAllTickets(params: { page?: number; limit?: number; search?: string; status?: string } = {}) {
        const { page = 1, limit = 10, search, status } = params;
        const skip = (page - 1) * Number(limit);

        const where: any = {};
        if (search) {
            where.OR = [
                { subject: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status) where.status = status;

        const [items, total] = await Promise.all([
            (this.prisma as any).supportTicket.findMany({
                where,
                include: { tenant: { select: { name: true, subdomain: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            (this.prisma as any).supportTicket.count({ where }),
        ]);

        return { items, total, page: Number(page), limit: Number(limit) };
    }

    async updateTicketStatus(adminUserId: string, id: string, status: any) {
        const oldTicket = await (this.prisma as any).supportTicket.findUnique({ where: { id } });
        if (!oldTicket) throw new NotFoundException('Ticket not found');

        return this.prisma.$transaction(async (tx) => {
            const ticket = await (tx as any).supportTicket.update({
                where: { id },
                data: { status }
            });

            await this.auditService.logAction(
                'PLATFORM',
                adminUserId,
                'UPDATE_SUPPORT_STATUS',
                'SupportTicket',
                id,
                { status: oldTicket.status },
                { status },
                undefined,
                undefined,
                tx
            );

            return ticket;
        });
    }

    async changeTenantPlan(adminUserId: string, tenantId: string, planId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { subscription: true }
        });

        if (!tenant) throw new NotFoundException('Tenant not found');

        return this.prisma.$transaction(async (tx) => {
            // Update tenant's current plan
            const updatedTenant = await tx.tenant.update({
                where: { id: tenantId },
                data: { planId }
            });

            // Update or create subscription
            if (tenant.subscription) {
                await tx.subscription.update({
                    where: { id: tenant.subscription.id },
                    data: { planId, status: 'ACTIVE' } // Force active for manual change
                });
            } else {
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

            await this.auditService.logAction(
                'PLATFORM',
                adminUserId,
                'CHANGE_PLAN',
                'Tenant',
                tenantId,
                { oldPlanId: tenant.planId },
                { newPlanId: planId },
                undefined,
                undefined,
                tx
            );

            return updatedTenant;
        });
    }

    async findAllSubscriptions(params: { page?: number; limit?: number; search?: string; status?: string } = {}) {
        const { page = 1, limit = 10, search, status } = params;
        const skip = (page - 1) * Number(limit);

        const where: any = {};
        if (search) {
            where.OR = [
                { tenant: { name: { contains: search, mode: 'insensitive' } } },
                { tenant: { subdomain: { contains: search, mode: 'insensitive' } } },
            ];
        }
        if (status) where.status = status;

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

    async cancelSubscription(adminUserId: string, subscriptionId: string) {
        const sub = await this.prisma.subscription.findUnique({
            where: { id: subscriptionId },
            include: { tenant: true }
        });
        if (!sub) throw new NotFoundException('Subscription not found');

        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.subscription.update({
                where: { id: subscriptionId },
                data: { status: 'CANCELED', endDate: new Date() }
            });

            await this.auditService.logAction(
                'PLATFORM',
                adminUserId,
                'CANCEL_SUBSCRIPTION',
                'Subscription',
                subscriptionId,
                { status: sub.status },
                { status: 'CANCELED' },
                undefined,
                undefined,
                tx
            );

            return updated;
        });
    }
}
