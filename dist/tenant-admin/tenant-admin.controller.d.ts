import { TenantAdminService } from './tenant-admin.service';
import { AuditService } from '../shared/audit.service';
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
    suspend(id: string, dto: SuspendTenantDto, req: any): Promise<{
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
    reactivate(id: string, req: any): Promise<{
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
    findAll(req: any, page?: number, limit?: number, search?: string, status?: string, planId?: string): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    updateLanguage(id: string, dto: UpdateTenantLanguageDto, req: any): Promise<{
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
    getStats(req: any): Promise<{
        mrr: any;
        activeSubscribers: number;
        pastDueSubscribers: number;
        totalTenants: number;
    }>;
    getInvoices(req: any): Promise<any>;
    changePlan(id: string, planId: string, req: any): Promise<{
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
}
export declare class SupportController {
    private readonly service;
    constructor(service: TenantAdminService);
    create(dto: {
        subject: string;
        description: string;
        priority: string;
        tenantId?: string;
    }, req: any): Promise<any>;
    findAll(req: any, page?: number, limit?: number, search?: string, status?: string): Promise<{
        items: any;
        total: any;
        page: number;
        limit: number;
    }>;
    updateStatus(id: string, status: string, req: any): Promise<any>;
}
export declare class PlatformUsersController {
    private readonly service;
    constructor(service: TenantAdminService);
    findAll(req: any, page?: number, limit?: number, search?: string): Promise<{
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
}
export declare class PlansController {
    private readonly service;
    constructor(service: TenantAdminService);
    create(dto: CreatePlanDto, req: any): Promise<{
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
    update(id: string, dto: UpdatePlanDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
    findAll(): Promise<{
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
}
export declare class CurrenciesController {
    private readonly service;
    constructor(service: TenantAdminService);
    create(dto: CreateCurrencyDto, req: any): Promise<{
        symbol: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        code: string;
        precision: number;
    }>;
    update(code: string, dto: UpdateCurrencyDto, req: any): Promise<{
        symbol: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        code: string;
        precision: number;
    }>;
    findAll(): Promise<{
        symbol: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        code: string;
        precision: number;
    }[]>;
    createRate(dto: CreateExchangeRateDto, req: any): Promise<{
        id: string;
        updatedAt: Date;
        fromCurrency: string;
        toCurrency: string;
        rate: import("@prisma/client/runtime/library").Decimal;
        effectiveAt: Date;
        source: string | null;
    }>;
    findAllRates(): Promise<({
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
}
export declare class AuditLogsController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(req: any, page?: number, limit?: number, tenantId?: string, action?: string): Promise<{
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
}
export declare class SubscriptionsController {
    private readonly service;
    constructor(service: TenantAdminService);
    findAll(req: any, page?: number, limit?: number, search?: string, status?: string): Promise<{
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
    remove(id: string, req: any): Promise<{
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
