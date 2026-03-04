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
            createdAt: Date;
            updatedAt: Date;
            nameAr: string | null;
            tenantId: string;
            address: string | null;
            phone: string | null;
            addressAr: string | null;
        };
        items: ({
            product: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                nameAr: string | null;
                status: string;
                description: string | null;
                descriptionAr: string | null;
                brandId: string;
                categoryId: string;
                weight: number | null;
                dimensions: string | null;
                taxRateId: string | null;
                images: string[];
                unitOfMeasure: string | null;
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
    }>;
    findAll(req: any): Promise<({
        branch: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            nameAr: string | null;
            tenantId: string;
            address: string | null;
            phone: string | null;
            addressAr: string | null;
        };
        items: ({
            product: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                nameAr: string | null;
                status: string;
                description: string | null;
                descriptionAr: string | null;
                brandId: string;
                categoryId: string;
                weight: number | null;
                dimensions: string | null;
                taxRateId: string | null;
                images: string[];
                unitOfMeasure: string | null;
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
    })[]>;
    findOne(id: string, req: any): Promise<{
        branch: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            nameAr: string | null;
            tenantId: string;
            address: string | null;
            phone: string | null;
            addressAr: string | null;
        };
        items: ({
            product: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                nameAr: string | null;
                status: string;
                description: string | null;
                descriptionAr: string | null;
                brandId: string;
                categoryId: string;
                weight: number | null;
                dimensions: string | null;
                taxRateId: string | null;
                images: string[];
                unitOfMeasure: string | null;
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
        cashSessionId: string | null;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
        saleId: string | null;
        reason: string;
        cancelledAt: Date | null;
        processedAt: Date | null;
        refundNumber: string;
        returnId: string | null;
        cancelledById: string | null;
        createdById: string;
        deliveryExceptionId: string | null;
        processedById: string | null;
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
            businessClientId: string | null;
            baseAmount: import("@prisma/client/runtime/library").Decimal;
            exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
            saleId: string;
            invoiceNumber: string;
            issuedAt: Date;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            tax: import("@prisma/client/runtime/library").Decimal;
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
            method: import(".prisma/client").$Enums.PaymentMethod;
            isRefund: boolean;
            refundedPaymentId: string | null;
            reference: string | null;
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
        customerName: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        cashSessionId: string | null;
        refundedSaleId: string | null;
        customerId: string | null;
        businessClientId: string | null;
        voidReason: string | null;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
    }>;
}
