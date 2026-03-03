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
        status: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        planId: string | null;
        subdomain: string;
        suspensionReason: string | null;
        baseCurrency: string;
        supportedCurrencies: string[];
        defaultLanguage: import(".prisma/client").$Enums.LanguageCode;
        supportedLanguages: import(".prisma/client").$Enums.LanguageCode[];
        stripeCustomerId: string | null;
        billingEmail: string | null;
    }>;
    suspendTenant(adminUserId: string, tenantId: string, dto: SuspendTenantDto): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        planId: string | null;
        subdomain: string;
        suspensionReason: string | null;
        baseCurrency: string;
        supportedCurrencies: string[];
        defaultLanguage: import(".prisma/client").$Enums.LanguageCode;
        supportedLanguages: import(".prisma/client").$Enums.LanguageCode[];
        stripeCustomerId: string | null;
        billingEmail: string | null;
    }>;
    reactivateTenant(adminUserId: string, tenantId: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        planId: string | null;
        subdomain: string;
        suspensionReason: string | null;
        baseCurrency: string;
        supportedCurrencies: string[];
        defaultLanguage: import(".prisma/client").$Enums.LanguageCode;
        supportedLanguages: import(".prisma/client").$Enums.LanguageCode[];
        stripeCustomerId: string | null;
        billingEmail: string | null;
    }>;
    findAll(): Promise<{
        plan: {
            name: string;
        };
        subscription: {
            id: string;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            createdAt: Date;
            tenantId: string;
            billingCycle: import(".prisma/client").$Enums.BillingCycle;
            updatedAt: Date;
            planId: string;
            startDate: Date;
            endDate: Date | null;
            trialEndDate: Date | null;
            stripeSubscriptionId: string | null;
            currentPeriodEnd: Date | null;
        };
        id: string;
        status: string;
        createdAt: Date;
        name: string;
        _count: {
            users: number;
            branches: number;
        };
        planId: string;
        subdomain: string;
        suspensionReason: string;
        defaultLanguage: import(".prisma/client").$Enums.LanguageCode;
        supportedLanguages: import(".prisma/client").$Enums.LanguageCode[];
    }[]>;
    findOne(tenantId: string): Promise<{
        plan: {
            currency: string;
            id: string;
            createdAt: Date;
            name: string;
            nameAr: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            billingCycle: import(".prisma/client").$Enums.BillingCycle;
            isActive: boolean;
            features: import("@prisma/client/runtime/library").JsonValue | null;
            limits: import("@prisma/client/runtime/library").JsonValue | null;
            updatedAt: Date;
        };
        _count: {
            users: number;
        };
        branches: {
            id: string;
            name: string;
        }[];
    } & {
        id: string;
        status: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        planId: string | null;
        subdomain: string;
        suspensionReason: string | null;
        baseCurrency: string;
        supportedCurrencies: string[];
        defaultLanguage: import(".prisma/client").$Enums.LanguageCode;
        supportedLanguages: import(".prisma/client").$Enums.LanguageCode[];
        stripeCustomerId: string | null;
        billingEmail: string | null;
    }>;
    updateLanguageSettings(adminUserId: string, tenantId: string, dto: UpdateTenantLanguageDto): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        planId: string | null;
        subdomain: string;
        suspensionReason: string | null;
        baseCurrency: string;
        supportedCurrencies: string[];
        defaultLanguage: import(".prisma/client").$Enums.LanguageCode;
        supportedLanguages: import(".prisma/client").$Enums.LanguageCode[];
        stripeCustomerId: string | null;
        billingEmail: string | null;
    }>;
    findAllUsers(): Promise<{
        tenant: {
            id: string;
            name: string;
            subdomain: string;
        };
        id: string;
        status: string;
        createdAt: Date;
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
    }[]>;
    createPlan(dto: CreatePlanDto): Promise<{
        currency: string;
        id: string;
        createdAt: Date;
        name: string;
        nameAr: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        isActive: boolean;
        features: import("@prisma/client/runtime/library").JsonValue | null;
        limits: import("@prisma/client/runtime/library").JsonValue | null;
        updatedAt: Date;
    }>;
    updatePlan(id: string, dto: UpdatePlanDto): Promise<{
        currency: string;
        id: string;
        createdAt: Date;
        name: string;
        nameAr: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        isActive: boolean;
        features: import("@prisma/client/runtime/library").JsonValue | null;
        limits: import("@prisma/client/runtime/library").JsonValue | null;
        updatedAt: Date;
    }>;
    deletePlan(id: string): Promise<{
        currency: string;
        id: string;
        createdAt: Date;
        name: string;
        nameAr: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        isActive: boolean;
        features: import("@prisma/client/runtime/library").JsonValue | null;
        limits: import("@prisma/client/runtime/library").JsonValue | null;
        updatedAt: Date;
    }>;
    findAllPlans(): Promise<{
        currency: string;
        id: string;
        createdAt: Date;
        name: string;
        nameAr: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        billingCycle: import(".prisma/client").$Enums.BillingCycle;
        isActive: boolean;
        features: import("@prisma/client/runtime/library").JsonValue | null;
        limits: import("@prisma/client/runtime/library").JsonValue | null;
        updatedAt: Date;
    }[]>;
    createCurrency(dto: CreateCurrencyDto): Promise<{
        symbol: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        updatedAt: Date;
        code: string;
        precision: number;
    }>;
    updateCurrency(code: string, dto: UpdateCurrencyDto): Promise<{
        symbol: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        updatedAt: Date;
        code: string;
        precision: number;
    }>;
    findAllCurrencies(): Promise<{
        symbol: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        updatedAt: Date;
        code: string;
        precision: number;
    }[]>;
    createExchangeRate(tenantId: string, dto: CreateExchangeRateDto): Promise<{
        id: string;
        updatedAt: Date;
        fromCurrency: string;
        toCurrency: string;
        rate: import("@prisma/client/runtime/library").Decimal;
        source: string | null;
        effectiveAt: Date;
    }>;
    findAllExchangeRates(): Promise<({
        fromCurrencyRef: {
            symbol: string;
            createdAt: Date;
            name: string;
            isActive: boolean;
            updatedAt: Date;
            code: string;
            precision: number;
        };
        toCurrencyRef: {
            symbol: string;
            createdAt: Date;
            name: string;
            isActive: boolean;
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
        source: string | null;
        effectiveAt: Date;
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
}
