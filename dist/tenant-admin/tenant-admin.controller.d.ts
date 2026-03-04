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
    suspend(id: string, dto: SuspendTenantDto, req: any): Promise<{
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
    reactivate(id: string, req: any): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    getTenantInvoices(id: string, req: any): Promise<{
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
    getTenantActivity(id: string, limit: number, req: any): Promise<{
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
    updateLanguage(id: string, dto: UpdateTenantLanguageDto, req: any): Promise<{
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
    getStats(req: any): Promise<{
        mrr: any;
        activeSubscribers: number;
        pastDueSubscribers: number;
        totalTenants: number;
    }>;
    getGlobalBillingActivity(req: any): Promise<({
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
    getGlobalInvoices(req: any, page?: number, limit?: number, search?: string): Promise<{
        items: any;
        total: any;
        page: number;
        limit: number;
    }>;
    changePlan(id: string, planId: string, req: any): Promise<{
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
}
export declare class PlansController {
    private readonly service;
    constructor(service: TenantAdminService);
    create(dto: CreatePlanDto, req: any): Promise<{
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
    update(id: string, dto: UpdatePlanDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
    findAll(req: any): Promise<{
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
}
export declare class CurrenciesController {
    private readonly service;
    constructor(service: TenantAdminService);
    create(dto: CreateCurrencyDto, req: any): Promise<{
        symbol: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        precision: number;
    }>;
    update(code: string, dto: UpdateCurrencyDto, req: any): Promise<{
        symbol: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        precision: number;
    }>;
    findAll(req: any, page?: number, limit?: number, search?: string): Promise<{
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
    createRate(dto: CreateExchangeRateDto, req: any): Promise<{
        id: string;
        updatedAt: Date;
        fromCurrency: string;
        toCurrency: string;
        rate: import("@prisma/client/runtime/library").Decimal;
        effectiveAt: Date;
        source: string | null;
    }>;
    findAllRates(req: any, page?: number, limit?: number, search?: string): Promise<{
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
}
export declare class AuditLogsController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(req: any, page?: number, limit?: number, tenantId?: string, action?: string, entityType?: string, search?: string): Promise<{
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
    remove(id: string, req: any): Promise<{
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
