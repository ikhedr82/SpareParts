import { TenantAdminService } from './tenant-admin.service';
import { SuspendTenantDto } from './dtos/suspend-tenant.dto';
import { UpdateTenantLanguageDto } from './dto/update-tenant-language.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';
import { CreateCurrencyDto, UpdateCurrencyDto } from './dto/currency.dto';
import { CreateExchangeRateDto } from './dto/exchange-rate.dto';
export declare class TenantAdminController {
    private readonly service;
    constructor(service: TenantAdminService);
    create(dto: CreateTenantDto, req: any): Promise<{
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
    suspend(id: string, dto: SuspendTenantDto, req: any): Promise<{
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
    reactivate(id: string, req: any): Promise<{
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
    findAll(req: any): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    updateLanguage(id: string, dto: UpdateTenantLanguageDto, req: any): Promise<{
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
    getStats(req: any): Promise<{
        mrr: any;
        activeSubscribers: number;
        pastDueSubscribers: number;
        totalTenants: number;
    }>;
    getInvoices(req: any): Promise<any>;
}
export declare class PlatformUsersController {
    private readonly service;
    constructor(service: TenantAdminService);
    findAll(req: any): Promise<{
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
}
export declare class PlansController {
    private readonly service;
    constructor(service: TenantAdminService);
    create(dto: CreatePlanDto, req: any): Promise<{
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
    update(id: string, dto: UpdatePlanDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
    findAll(): Promise<{
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
}
export declare class CurrenciesController {
    private readonly service;
    constructor(service: TenantAdminService);
    create(dto: CreateCurrencyDto, req: any): Promise<{
        symbol: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        updatedAt: Date;
        code: string;
        precision: number;
    }>;
    update(code: string, dto: UpdateCurrencyDto, req: any): Promise<{
        symbol: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        updatedAt: Date;
        code: string;
        precision: number;
    }>;
    findAll(): Promise<{
        symbol: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        updatedAt: Date;
        code: string;
        precision: number;
    }[]>;
    createRate(dto: CreateExchangeRateDto, req: any): Promise<{
        id: string;
        updatedAt: Date;
        fromCurrency: string;
        toCurrency: string;
        rate: import("@prisma/client/runtime/library").Decimal;
        source: string | null;
        effectiveAt: Date;
    }>;
    findAllRates(): Promise<({
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
}
export declare class PlanStatusController {
    private readonly service;
    constructor(service: TenantAdminService);
    getStatus(req: any): Promise<{
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
}
