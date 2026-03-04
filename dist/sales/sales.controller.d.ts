import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { RefundSaleDto } from './dto/refund-sale.dto';
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    create(dto: CreateSaleDto, req: any): Promise<{
        branch: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string | null;
            nameAr: string | null;
            address: string | null;
            addressAr: string | null;
        };
        items: ({
            product: {
                id: string;
                createdAt: Date;
                status: string;
                updatedAt: Date;
                name: string;
                weight: number | null;
                brandId: string;
                categoryId: string;
                description: string | null;
                dimensions: string | null;
                taxRateId: string | null;
                images: string[];
                unitOfMeasure: string | null;
                descriptionAr: string | null;
                nameAr: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            productId: string;
            quantity: number;
            saleId: string;
            price: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        version: number;
        branchId: string;
        customerId: string | null;
        currency: string;
        businessClientId: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        customerName: string | null;
        cashSessionId: string | null;
        refundedSaleId: string | null;
        voidReason: string | null;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(req: any): Promise<({
        branch: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string | null;
            nameAr: string | null;
            address: string | null;
            addressAr: string | null;
        };
        items: ({
            product: {
                id: string;
                createdAt: Date;
                status: string;
                updatedAt: Date;
                name: string;
                weight: number | null;
                brandId: string;
                categoryId: string;
                description: string | null;
                dimensions: string | null;
                taxRateId: string | null;
                images: string[];
                unitOfMeasure: string | null;
                descriptionAr: string | null;
                nameAr: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            productId: string;
            quantity: number;
            saleId: string;
            price: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        version: number;
        branchId: string;
        customerId: string | null;
        currency: string;
        businessClientId: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        customerName: string | null;
        cashSessionId: string | null;
        refundedSaleId: string | null;
        voidReason: string | null;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findOne(id: string, req: any): Promise<{
        branch: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string | null;
            nameAr: string | null;
            address: string | null;
            addressAr: string | null;
        };
        items: ({
            product: {
                id: string;
                createdAt: Date;
                status: string;
                updatedAt: Date;
                name: string;
                weight: number | null;
                brandId: string;
                categoryId: string;
                description: string | null;
                dimensions: string | null;
                taxRateId: string | null;
                images: string[];
                unitOfMeasure: string | null;
                descriptionAr: string | null;
                nameAr: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            productId: string;
            quantity: number;
            saleId: string;
            price: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        version: number;
        branchId: string;
        customerId: string | null;
        currency: string;
        businessClientId: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        customerName: string | null;
        cashSessionId: string | null;
        refundedSaleId: string | null;
        voidReason: string | null;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
    }>;
    refund(dto: RefundSaleDto, req: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.RefundStatus;
        updatedAt: Date;
        version: number;
        branchId: string;
        orderId: string | null;
        currency: string;
        cancelledAt: Date | null;
        createdById: string;
        deliveryExceptionId: string | null;
        returnId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        cashSessionId: string | null;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
        reason: string;
        saleId: string | null;
        processedAt: Date | null;
        refundNumber: string;
        cancelledById: string | null;
        processedById: string | null;
    }>;
    voidSale(saleId: string, req: any): Promise<{
        payments: {
            id: string;
            tenantId: string;
            createdAt: Date;
            version: number;
            currency: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            baseAmount: import("@prisma/client/runtime/library").Decimal;
            exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
            saleId: string;
            paidAt: Date;
            sessionId: string | null;
            method: import(".prisma/client").$Enums.PaymentMethod;
            isRefund: boolean;
            refundedPaymentId: string | null;
            reference: string | null;
        }[];
        invoice: {
            id: string;
            tenantId: string;
            createdAt: Date;
            status: string;
            updatedAt: Date;
            version: number;
            currency: string;
            businessClientId: string | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            tax: import("@prisma/client/runtime/library").Decimal;
            invoiceNumber: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            baseAmount: import("@prisma/client/runtime/library").Decimal;
            exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
            saleId: string;
            issuedAt: Date;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        version: number;
        branchId: string;
        customerId: string | null;
        currency: string;
        businessClientId: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        customerName: string | null;
        cashSessionId: string | null;
        refundedSaleId: string | null;
        voidReason: string | null;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
    }>;
}
