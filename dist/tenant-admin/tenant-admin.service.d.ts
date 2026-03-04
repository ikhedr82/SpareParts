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
export declare class TenantAdminService {
    private prisma;
    private auditService;
    private outbox;
    private t;
    private planEnforcement;
    private usageTracking;
    constructor(prisma: PrismaService, auditService: AuditService, outbox: OutboxService, t: TranslationService, planEnforcement: PlanEnforcementService, usageTracking: UsageTrackingService);
    createTenant(adminUserId: string, dto: CreateTenantDto): Promise<{
        adminUser: {
            id: string;
            email: string;
        };
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        planId: string | null;
        status: string;
        subdomain: string;
        defaultLanguage: import(".prisma/client").$Enums.LanguageCode;
        supportedLanguages: import(".prisma/client").$Enums.LanguageCode[];
        suspensionReason: string | null;
        baseCurrency: string;
        supportedCurrencies: string[];
        billingEmail: string | null;
        stripeCustomerId: string | null;
    }>;
    suspendTenant(adminUserId: string, tenantId: string, dto: SuspendTenantDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        planId: string | null;
        status: string;
        subdomain: string;
        defaultLanguage: import(".prisma/client").$Enums.LanguageCode;
        supportedLanguages: import(".prisma/client").$Enums.LanguageCode[];
        suspensionReason: string | null;
        baseCurrency: string;
        supportedCurrencies: string[];
        billingEmail: string | null;
        stripeCustomerId: string | null;
    }>;
    reactivateTenant(adminUserId: string, tenantId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        planId: string | null;
        status: string;
        subdomain: string;
        defaultLanguage: import(".prisma/client").$Enums.LanguageCode;
        supportedLanguages: import(".prisma/client").$Enums.LanguageCode[];
        suspensionReason: string | null;
        baseCurrency: string;
        supportedCurrencies: string[];
        billingEmail: string | null;
        stripeCustomerId: string | null;
    }>;
    findAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        planId?: string;
    }): Promise<{
        items: {
            plan: {
                currency: string;
                name: string;
                price: import("@prisma/client/runtime/library").Decimal;
            };
            subscription: {
                status: import(".prisma/client").$Enums.SubscriptionStatus;
                trialEndDate: Date;
                currentPeriodEnd: Date;
            };
            id: string;
            name: string;
            createdAt: Date;
            _count: {
                branches: number;
                users: number;
            };
            planId: string;
            status: string;
            subdomain: string;
            defaultLanguage: import(".prisma/client").$Enums.LanguageCode;
            supportedLanguages: import(".prisma/client").$Enums.LanguageCode[];
            suspensionReason: string;
            baseCurrency: string;
            supportedCurrencies: string[];
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(tenantId: string): Promise<{
        _count: {
            products: number;
            inventory: number;
            branches: number;
            users: number;
        };
        planLimits: any;
        plan: {
            currency: string;
            id: string;
            name: string;
            price: import("@prisma/client/runtime/library").Decimal;
            billingCycle: import(".prisma/client").$Enums.BillingCycle;
            isActive: boolean;
            features: import("@prisma/client/runtime/library").JsonValue | null;
            limits: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            nameAr: string | null;
        };
        subscription: {
            id: string;
            billingCycle: import(".prisma/client").$Enums.BillingCycle;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            planId: string;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            startDate: Date;
            endDate: Date | null;
            trialEndDate: Date | null;
            currentPeriodEnd: Date | null;
            stripeSubscriptionId: string | null;
            provider: string;
        };
        branches: {
            id: string;
            name: string;
        }[];
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        planId: string | null;
        status: string;
        subdomain: string;
        defaultLanguage: import(".prisma/client").$Enums.LanguageCode;
        supportedLanguages: import(".prisma/client").$Enums.LanguageCode[];
        suspensionReason: string | null;
        baseCurrency: string;
        supportedCurrencies: string[];
        billingEmail: string | null;
        stripeCustomerId: string | null;
    }>;
    getTenantInvoices(tenantId: string): Promise<{
        currency: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        subscriptionId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        dueDate: Date;
        paidAt: Date | null;
        stripeInvoiceId: string | null;
    }[]>;
    getTenantActivity(tenantId: string, limit?: number): Promise<{
        items: ({
            tenant: {
                name: string;
                subdomain: string;
            };
            user: {
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            tenantId: string;
            userId: string;
            action: string;
            entityType: string;
            entityId: string;
            oldValue: import("@prisma/client/runtime/library").JsonValue | null;
            newValue: import("@prisma/client/runtime/library").JsonValue | null;
            ipAddress: string | null;
            correlationId: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    updateLanguageSettings(adminUserId: string, tenantId: string, dto: UpdateTenantLanguageDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        planId: string | null;
        status: string;
        subdomain: string;
        defaultLanguage: import(".prisma/client").$Enums.LanguageCode;
        supportedLanguages: import(".prisma/client").$Enums.LanguageCode[];
        suspensionReason: string | null;
        baseCurrency: string;
        supportedCurrencies: string[];
        billingEmail: string | null;
        stripeCustomerId: string | null;
    }>;
    findAllUsers(params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        items: {
            tenant: {
                id: string;
                name: string;
                subdomain: string;
            };
            id: string;
            createdAt: Date;
            status: string;
            email: string;
            isPlatformUser: boolean;
            userRoles: {
                tenant: {
                    name: string;
                };
                role: {
                    name: string;
                    scope: import(".prisma/client").$Enums.RoleScope;
                };
                branch: {
                    name: string;
                };
            }[];
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    createPlan(adminUserId: string, dto: CreatePlanDto): Promise<{
        currency: string;
        id: string;
        name: string;
        price: import("@prisma/client/runtime/library").Decimal;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        isActive: boolean;
        features: import("@prisma/client/runtime/library").JsonValue | null;
        limits: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
    }>;
    updatePlan(adminUserId: string, id: string, dto: UpdatePlanDto): Promise<{
        currency: string;
        id: string;
        name: string;
        price: import("@prisma/client/runtime/library").Decimal;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        isActive: boolean;
        features: import("@prisma/client/runtime/library").JsonValue | null;
        limits: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
    }>;
    deletePlan(adminUserId: string, id: string): Promise<{
        currency: string;
        id: string;
        name: string;
        price: import("@prisma/client/runtime/library").Decimal;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        isActive: boolean;
        features: import("@prisma/client/runtime/library").JsonValue | null;
        limits: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
    }>;
    findAllPlans(): Promise<{
        currency: string;
        id: string;
        name: string;
        price: import("@prisma/client/runtime/library").Decimal;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        isActive: boolean;
        features: import("@prisma/client/runtime/library").JsonValue | null;
        limits: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
    }[]>;
    createCurrency(adminUserId: string, dto: CreateCurrencyDto): Promise<{
        symbol: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        precision: number;
    }>;
    updateCurrency(adminUserId: string, code: string, dto: UpdateCurrencyDto): Promise<{
        symbol: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        precision: number;
    }>;
    findAllCurrencies(params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        items: {
            symbol: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            precision: number;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    createExchangeRate(adminUserId: string, tenantId: string, dto: CreateExchangeRateDto): Promise<{
        id: string;
        updatedAt: Date;
        fromCurrency: string;
        toCurrency: string;
        rate: import("@prisma/client/runtime/library").Decimal;
        effectiveAt: Date;
        source: string | null;
    }>;
    findAllExchangeRates(params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        items: ({
            fromCurrencyRef: {
                symbol: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                precision: number;
            };
            toCurrencyRef: {
                symbol: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                precision: number;
            };
        } & {
            id: string;
            updatedAt: Date;
            fromCurrency: string;
            toCurrency: string;
            rate: import("@prisma/client/runtime/library").Decimal;
            effectiveAt: Date;
            source: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getPlanStatus(tenantId: string): Promise<{
        plan: any;
        subscription: any;
        status: any;
        usage: {
            users: number;
            branches: number;
            products: number;
            orders: number;
        };
        limits: any;
    }>;
    getGlobalBillingStats(): Promise<{
        mrr: any;
        activeSubscribers: number;
        pastDueSubscribers: number;
        totalTenants: number;
    }>;
    getGlobalInvoices(params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        items: any;
        total: any;
        page: number;
        limit: number;
    }>;
    getGlobalBillingActivity(): Promise<({
        user: {
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        tenantId: string;
        userId: string;
        action: string;
        entityType: string;
        entityId: string;
        oldValue: import("@prisma/client/runtime/library").JsonValue | null;
        newValue: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        correlationId: string | null;
    })[]>;
    createSupportTicket(adminUserId: string, tenantId: string | null, subject: string, description: string, priority: any): Promise<any>;
    findAllTickets(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }): Promise<{
        items: any;
        total: any;
        page: number;
        limit: number;
    }>;
    updateTicketStatus(adminUserId: string, id: string, status: any): Promise<any>;
    changeTenantPlan(adminUserId: string, tenantId: string, planId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        planId: string | null;
        status: string;
        subdomain: string;
        defaultLanguage: import(".prisma/client").$Enums.LanguageCode;
        supportedLanguages: import(".prisma/client").$Enums.LanguageCode[];
        suspensionReason: string | null;
        baseCurrency: string;
        supportedCurrencies: string[];
        billingEmail: string | null;
        stripeCustomerId: string | null;
    }>;
    findAllSubscriptions(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }): Promise<{
        items: ({
            plan: {
                currency: string;
                id: string;
                name: string;
                price: import("@prisma/client/runtime/library").Decimal;
            };
            tenant: {
                id: string;
                name: string;
                subdomain: string;
            };
        } & {
            id: string;
            billingCycle: import(".prisma/client").$Enums.BillingCycle;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            planId: string;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            startDate: Date;
            endDate: Date | null;
            trialEndDate: Date | null;
            currentPeriodEnd: Date | null;
            stripeSubscriptionId: string | null;
            provider: string;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    cancelSubscription(adminUserId: string, subscriptionId: string): Promise<{
        id: string;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        planId: string;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        startDate: Date;
        endDate: Date | null;
        trialEndDate: Date | null;
        currentPeriodEnd: Date | null;
        stripeSubscriptionId: string | null;
        provider: string;
    }>;
}
