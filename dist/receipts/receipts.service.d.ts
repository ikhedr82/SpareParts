import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
export declare class ReceiptsService {
    private readonly prisma;
    constructor(prisma: TenantAwarePrismaService);
    findAll(): import("@prisma/client/runtime/library").PrismaPromise<({
        payment: {
            currency: string;
            id: string;
            createdAt: Date;
            tenantId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date;
            version: number;
            baseAmount: import("@prisma/client/runtime/library").Decimal;
            exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
            saleId: string;
            sessionId: string | null;
            reference: string | null;
            method: import(".prisma/client").$Enums.PaymentMethod;
            isRefund: boolean;
            refundedPaymentId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        tenantId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        paymentId: string;
        receiptNumber: string;
    })[]>;
    findOne(id: string): import("@prisma/client/runtime/library").DynamicModelExtensionFluentApi<import(".prisma/client").Prisma.TypeMap<import("@prisma/client/runtime/library").InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }, {}>, "Receipt", "findUnique", null> & import("@prisma/client/runtime/library").PrismaPromise<{
        payment: {
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
            tenantId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date;
            version: number;
            baseAmount: import("@prisma/client/runtime/library").Decimal;
            exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
            saleId: string;
            sessionId: string | null;
            reference: string | null;
            method: import(".prisma/client").$Enums.PaymentMethod;
            isRefund: boolean;
            refundedPaymentId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        tenantId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        paymentId: string;
        receiptNumber: string;
    }>;
    findByPayment(paymentId: string): import("@prisma/client/runtime/library").DynamicModelExtensionFluentApi<import(".prisma/client").Prisma.TypeMap<import("@prisma/client/runtime/library").InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }, {}>, "Receipt", "findUnique", null> & import("@prisma/client/runtime/library").PrismaPromise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        paymentId: string;
        receiptNumber: string;
    }>;
}
