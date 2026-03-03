import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { RefundSaleDto } from './dto/refund-sale.dto';
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    create(dto: CreateSaleDto, req: any): Promise<{
        branch: {
            id: string;
            name: string;
            nameAr: string | null;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            address: string | null;
            addressAr: string | null;
            phone: string | null;
        };
        items: ({
            product: {
                id: string;
                name: string;
                nameAr: string | null;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                description: string | null;
                descriptionAr: string | null;
                brandId: string;
                categoryId: string;
                weight: number | null;
                dimensions: string | null;
                unitOfMeasure: string | null;
                images: string[];
                taxRateId: string | null;
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
    }>;
    findAll(req: any): Promise<({
        branch: {
            id: string;
            name: string;
            nameAr: string | null;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            address: string | null;
            addressAr: string | null;
            phone: string | null;
        };
        items: ({
            product: {
                id: string;
                name: string;
                nameAr: string | null;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                description: string | null;
                descriptionAr: string | null;
                brandId: string;
                categoryId: string;
                weight: number | null;
                dimensions: string | null;
                unitOfMeasure: string | null;
                images: string[];
                taxRateId: string | null;
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
    })[]>;
    findOne(id: string, req: any): Promise<{
        branch: {
            id: string;
            name: string;
            nameAr: string | null;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            address: string | null;
            addressAr: string | null;
            phone: string | null;
        };
        items: ({
            product: {
                id: string;
                name: string;
                nameAr: string | null;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                description: string | null;
                descriptionAr: string | null;
                brandId: string;
                categoryId: string;
                weight: number | null;
                dimensions: string | null;
                unitOfMeasure: string | null;
                images: string[];
                taxRateId: string | null;
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
    }>;
    refund(dto: RefundSaleDto, req: any): Promise<{
        currency: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.RefundStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        version: number;
        branchId: string;
        orderId: string | null;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
        cashSessionId: string | null;
        saleId: string | null;
        refundNumber: string;
        reason: string;
        createdById: string;
        processedById: string | null;
        processedAt: Date | null;
        cancelledById: string | null;
        cancelledAt: Date | null;
        returnId: string | null;
        deliveryExceptionId: string | null;
    }>;
    voidSale(saleId: string, req: any): Promise<{
        invoice: {
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
        };
        payments: {
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
        }[];
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
    }>;
}
