import { SalesExtensionsService } from './sales-extensions.service';
import { QuoteService } from './quote.service';
import { VoidSaleDto } from './dtos/void-sale.dto';
import { CreateQuoteDto } from './dtos/create-quote.dto';
declare class RejectQuoteDto {
    reason: string;
}
export declare class SalesExtensionsController {
    private readonly salesService;
    private readonly quoteService;
    constructor(salesService: SalesExtensionsService, quoteService: QuoteService);
    voidSale(req: any, saleId: string, dto: VoidSaleDto): Promise<{
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
    listQuotes(req: any): Promise<({
        items: {
            id: string;
            productId: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            quoteId: string;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
            discount: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.QuoteStatus;
        version: number;
        notes: string | null;
        customerName: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        businessClientId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        createdById: string | null;
        rejectionReason: string | null;
        quoteNumber: string;
        validUntil: Date | null;
        sentAt: Date | null;
    })[]>;
    getQuote(req: any, id: string): Promise<{
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
            productId: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            quoteId: string;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
            discount: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.QuoteStatus;
        version: number;
        notes: string | null;
        customerName: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        businessClientId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        createdById: string | null;
        rejectionReason: string | null;
        quoteNumber: string;
        validUntil: Date | null;
        sentAt: Date | null;
    }>;
    createQuote(req: any, dto: CreateQuoteDto): Promise<{
        items: {
            id: string;
            productId: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            quoteId: string;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
            discount: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.QuoteStatus;
        version: number;
        notes: string | null;
        customerName: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        businessClientId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        createdById: string | null;
        rejectionReason: string | null;
        quoteNumber: string;
        validUntil: Date | null;
        sentAt: Date | null;
    }>;
    sendQuote(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.QuoteStatus;
        version: number;
        notes: string | null;
        customerName: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        businessClientId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        createdById: string | null;
        rejectionReason: string | null;
        quoteNumber: string;
        validUntil: Date | null;
        sentAt: Date | null;
    }>;
    acceptQuote(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.QuoteStatus;
        version: number;
        notes: string | null;
        customerName: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        businessClientId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        createdById: string | null;
        rejectionReason: string | null;
        quoteNumber: string;
        validUntil: Date | null;
        sentAt: Date | null;
    }>;
    rejectQuote(req: any, id: string, dto: RejectQuoteDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.QuoteStatus;
        version: number;
        notes: string | null;
        customerName: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        businessClientId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        createdById: string | null;
        rejectionReason: string | null;
        quoteNumber: string;
        validUntil: Date | null;
        sentAt: Date | null;
    }>;
    convertToOrder(req: any, id: string): Promise<{
        items: {
            id: string;
            createdAt: Date;
            orderId: string;
            productId: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        version: number;
        branchId: string;
        notes: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        businessClientId: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        createdById: string | null;
        cancelledAt: Date | null;
        returnId: string | null;
        deliveryExceptionId: string | null;
        orderNumber: string;
        deliveryAddressId: string | null;
        contactId: string | null;
        internalNotes: string | null;
        sourceQuoteId: string | null;
        confirmedAt: Date | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
    }>;
}
export {};
