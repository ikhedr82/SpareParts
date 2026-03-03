import { InvoicesService } from './invoices.service';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    findAll(): import("@prisma/client/runtime/library").PrismaPromise<({
        sale: {
            currency: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            status: string;
            version: number;
            branchId: string;
            customerId: string | null;
            customerName: string | null;
            total: import("@prisma/client/runtime/library").Decimal;
            baseAmount: import("@prisma/client/runtime/library").Decimal;
            exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
            voidReason: string | null;
            cashSessionId: string | null;
            refundedSaleId: string | null;
            businessClientId: string | null;
        };
    } & {
        currency: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        version: number;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
        businessClientId: string | null;
        saleId: string;
        invoiceNumber: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        issuedAt: Date;
    })[]>;
    findOne(id: string): import("@prisma/client/runtime/library").DynamicModelExtensionFluentApi<import(".prisma/client").Prisma.TypeMap<import("@prisma/client/runtime/library").InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }, {}>, "Invoice", "findUnique", null> & import("@prisma/client/runtime/library").PrismaPromise<{
        sale: {
            items: ({
                product: {
                    id: string;
                    name: string;
                    nameAr: string;
                    description: string;
                    descriptionAr: string;
                };
            } & {
                id: string;
                price: import("@prisma/client/runtime/library").Decimal;
                createdAt: Date;
                productId: string;
                quantity: number;
                saleId: string;
            })[];
        } & {
            currency: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            status: string;
            version: number;
            branchId: string;
            customerId: string | null;
            customerName: string | null;
            total: import("@prisma/client/runtime/library").Decimal;
            baseAmount: import("@prisma/client/runtime/library").Decimal;
            exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
            voidReason: string | null;
            cashSessionId: string | null;
            refundedSaleId: string | null;
            businessClientId: string | null;
        };
    } & {
        currency: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        version: number;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
        businessClientId: string | null;
        saleId: string;
        invoiceNumber: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        issuedAt: Date;
    }>;
    findBySale(saleId: string): import("@prisma/client/runtime/library").DynamicModelExtensionFluentApi<import(".prisma/client").Prisma.TypeMap<import("@prisma/client/runtime/library").InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }, {}>, "Invoice", "findUnique", null> & import("@prisma/client/runtime/library").PrismaPromise<{
        currency: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        version: number;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
        businessClientId: string | null;
        saleId: string;
        invoiceNumber: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        issuedAt: Date;
    }>;
}
