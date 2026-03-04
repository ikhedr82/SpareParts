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
        subdomain: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        defaultLanguage: import(".prisma/client").$Enums.LanguageCode;
        supportedLanguages: import(".prisma/client").$Enums.LanguageCode[];
        suspensionReason: string | null;
        baseCurrency: string;
        supportedCurrencies: string[];
        billingEmail: string | null;
        stripeCustomerId: string | null;
        planId: string | null;
    }>;
    suspendTenant(adminUserId: string, tenantId: string, dto: SuspendTenantDto): Promise<{
        id: string;
        name: string;
        subdomain: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        defaultLanguage: import(".prisma/client").$Enums.LanguageCode;
        supportedLanguages: import(".prisma/client").$Enums.LanguageCode[];
        suspensionReason: string | null;
        baseCurrency: string;
        supportedCurrencies: string[];
        billingEmail: string | null;
        stripeCustomerId: string | null;
        planId: string | null;
    }>;
    reactivateTenant(adminUserId: string, tenantId: string): Promise<{
        id: string;
        name: string;
        subdomain: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        defaultLanguage: import(".prisma/client").$Enums.LanguageCode;
        supportedLanguages: import(".prisma/client").$Enums.LanguageCode[];
        suspensionReason: string | null;
        baseCurrency: string;
        supportedCurrencies: string[];
        billingEmail: string | null;
        stripeCustomerId: string | null;
        planId: string | null;
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
            subdomain: string;
            status: string;
            createdAt: Date;
            defaultLanguage: import(".prisma/client").$Enums.LanguageCode;
            supportedLanguages: import(".prisma/client").$Enums.LanguageCode[];
            suspensionReason: string;
            baseCurrency: string;
            supportedCurrencies: string[];
            planId: string;
            _count: {
                branches: number;
                users: number;
            };
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(tenantId: string): Promise<{
        plan: {
            currency: string;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            billingCycle: import(".prisma/client").$Enums.BillingCycle;
            isActive: boolean;
            features: import("@prisma/client/runtime/library").JsonValue | null;
            limits: import("@prisma/client/runtime/library").JsonValue | null;
            nameAr: string | null;
        };
        branches: {
            id: string;
            name: string;
        }[];
        _count: {
            users: number;
        };
    } & {
        id: string;
        name: string;
        subdomain: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        defaultLanguage: import(".prisma/client").$Enums.LanguageCode;
        supportedLanguages: import(".prisma/client").$Enums.LanguageCode[];
        suspensionReason: string | null;
        baseCurrency: string;
        supportedCurrencies: string[];
        billingEmail: string | null;
        stripeCustomerId: string | null;
        planId: string | null;
    }>;
    updateLanguageSettings(adminUserId: string, tenantId: string, dto: UpdateTenantLanguageDto): Promise<{
        id: string;
        name: string;
        subdomain: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        defaultLanguage: import(".prisma/client").$Enums.LanguageCode;
        supportedLanguages: import(".prisma/client").$Enums.LanguageCode[];
        suspensionReason: string | null;
        baseCurrency: string;
        supportedCurrencies: string[];
        billingEmail: string | null;
        stripeCustomerId: string | null;
        planId: string | null;
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
            status: string;
            createdAt: Date;
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
            email: string;
            isPlatformUser: boolean;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    createPlan(dto: CreatePlanDto): Promise<{
        currency: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        price: import("@prisma/client/runtime/library").Decimal;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        isActive: boolean;
        features: import("@prisma/client/runtime/library").JsonValue | null;
        limits: import("@prisma/client/runtime/library").JsonValue | null;
        nameAr: string | null;
    }>;
    updatePlan(id: string, dto: UpdatePlanDto): Promise<{
        currency: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        price: import("@prisma/client/runtime/library").Decimal;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        isActive: boolean;
        features: import("@prisma/client/runtime/library").JsonValue | null;
        limits: import("@prisma/client/runtime/library").JsonValue | null;
        nameAr: string | null;
    }>;
    deletePlan(id: string): Promise<{
        currency: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        price: import("@prisma/client/runtime/library").Decimal;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        isActive: boolean;
        features: import("@prisma/client/runtime/library").JsonValue | null;
        limits: import("@prisma/client/runtime/library").JsonValue | null;
        nameAr: string | null;
    }>;
    findAllPlans(): Promise<{
        currency: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        price: import("@prisma/client/runtime/library").Decimal;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        isActive: boolean;
        features: import("@prisma/client/runtime/library").JsonValue | null;
        limits: import("@prisma/client/runtime/library").JsonValue | null;
        nameAr: string | null;
    }[]>;
    createCurrency(dto: CreateCurrencyDto): Promise<{
        symbol: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        code: string;
        precision: number;
    }>;
    updateCurrency(code: string, dto: UpdateCurrencyDto): Promise<{
        symbol: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        code: string;
        precision: number;
    }>;
    findAllCurrencies(): Promise<{
        symbol: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        code: string;
        precision: number;
    }[]>;
    createExchangeRate(tenantId: string, dto: CreateExchangeRateDto): Promise<{
        id: string;
        updatedAt: Date;
        fromCurrency: string;
        toCurrency: string;
        rate: import("@prisma/client/runtime/library").Decimal;
        effectiveAt: Date;
        source: string | null;
    }>;
    findAllExchangeRates(): Promise<({
        fromCurrencyRef: {
            symbol: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            code: string;
            precision: number;
        };
        toCurrencyRef: {
            symbol: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
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
    })[]>;
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
    getGlobalInvoices(): Promise<any>;
    createSupportTicket(tenantId: string | null, subject: string, description: string, priority: any): Promise<any>;
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
    updateTicketStatus(id: string, status: any): Promise<any>;
    changeTenantPlan(adminUserId: string, tenantId: string, planId: string): Promise<{
        id: string;
        name: string;
        subdomain: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        defaultLanguage: import(".prisma/client").$Enums.LanguageCode;
        supportedLanguages: import(".prisma/client").$Enums.LanguageCode[];
        suspensionReason: string | null;
        baseCurrency: string;
        supportedCurrencies: string[];
        billingEmail: string | null;
        stripeCustomerId: string | null;
        planId: string | null;
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
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            createdAt: Date;
            updatedAt: Date;
            planId: string;
            tenantId: string;
            billingCycle: import(".prisma/client").$Enums.BillingCycle;
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
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        createdAt: Date;
        updatedAt: Date;
        planId: string;
        tenantId: string;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        startDate: Date;
        endDate: Date | null;
        trialEndDate: Date | null;
        currentPeriodEnd: Date | null;
        stripeSubscriptionId: string | null;
        provider: string;
    }>;
}
