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
            customerName: string | null;
            total: import("@prisma/client/runtime/library").Decimal;
            cashSessionId: string | null;
            refundedSaleId: string | null;
            customerId: string | null;
            businessClientId: string | null;
            voidReason: string | null;
            baseAmount: import("@prisma/client/runtime/library").Decimal;
            exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
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
        businessClientId: string | null;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
        saleId: string;
        invoiceNumber: string;
        issuedAt: Date;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
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
            customerName: string | null;
            total: import("@prisma/client/runtime/library").Decimal;
            cashSessionId: string | null;
            refundedSaleId: string | null;
            customerId: string | null;
            businessClientId: string | null;
            voidReason: string | null;
            baseAmount: import("@prisma/client/runtime/library").Decimal;
            exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
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
        businessClientId: string | null;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
        saleId: string;
        invoiceNumber: string;
        issuedAt: Date;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
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
        businessClientId: string | null;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
        saleId: string;
        invoiceNumber: string;
        issuedAt: Date;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
    }>;
}
