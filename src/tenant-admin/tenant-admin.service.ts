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

            // 2. Create tenant admin role
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

    async findAll() {
        return this.prisma.tenant.findMany({
            select: {
                id: true,
                name: true,
                subdomain: true,
                status: true,
                planId: true,
                plan: { select: { name: true } },
                subscription: true,
                suspensionReason: true,
                defaultLanguage: true,
                supportedLanguages: true,
                createdAt: true,
                _count: { select: { users: true, branches: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(tenantId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                branches: { select: { id: true, name: true } },
                _count: { select: { users: true } },
                plan: true,
            },
        });
        if (!tenant) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Tenant' }));
        return tenant;
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

    async findAllUsers() {
        return this.prisma.user.findMany({
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
        });
    }

    // Plans CRUD
    async createPlan(dto: CreatePlanDto) {
        return this.prisma.plan.create({ data: dto });
    }

    async updatePlan(id: string, dto: UpdatePlanDto) {
        return this.prisma.plan.update({ where: { id }, data: dto });
    }

    async deletePlan(id: string) {
        return this.prisma.plan.delete({ where: { id } });
    }

    async findAllPlans() {
        return this.prisma.plan.findMany({ orderBy: { createdAt: 'desc' } });
    }

    // Currencies CRUD
    async createCurrency(dto: CreateCurrencyDto) {
        return this.prisma.currency.create({ data: dto });
    }

    async updateCurrency(code: string, dto: UpdateCurrencyDto) {
        return this.prisma.currency.update({ where: { code }, data: dto });
    }

    async findAllCurrencies() {
        return this.prisma.currency.findMany({ orderBy: { code: 'asc' } });
    }

    async createExchangeRate(tenantId: string, dto: CreateExchangeRateDto) {
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

    async getGlobalInvoices() {
        return (this.prisma as any).billingInvoice.findMany({
            include: { tenant: { select: { name: true, subdomain: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    }
}
