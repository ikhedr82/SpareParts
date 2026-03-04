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
    listQuotes(req: any): Promise<({
        items: {
            id: string;
            productId: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
            discount: import("@prisma/client/runtime/library").Decimal;
            quoteId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.QuoteStatus;
        updatedAt: Date;
        version: number;
        businessClientId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        createdById: string | null;
        quoteNumber: string;
        customerName: string | null;
        validUntil: Date | null;
        sentAt: Date | null;
        rejectionReason: string | null;
    })[]>;
    getQuote(req: any, id: string): Promise<{
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
            productId: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
            discount: import("@prisma/client/runtime/library").Decimal;
            quoteId: string;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.QuoteStatus;
        updatedAt: Date;
        version: number;
        businessClientId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        createdById: string | null;
        quoteNumber: string;
        customerName: string | null;
        validUntil: Date | null;
        sentAt: Date | null;
        rejectionReason: string | null;
    }>;
    createQuote(req: any, dto: CreateQuoteDto): Promise<{
        items: {
            id: string;
            productId: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
            discount: import("@prisma/client/runtime/library").Decimal;
            quoteId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.QuoteStatus;
        updatedAt: Date;
        version: number;
        businessClientId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        createdById: string | null;
        quoteNumber: string;
        customerName: string | null;
        validUntil: Date | null;
        sentAt: Date | null;
        rejectionReason: string | null;
    }>;
    sendQuote(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.QuoteStatus;
        updatedAt: Date;
        version: number;
        businessClientId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        createdById: string | null;
        quoteNumber: string;
        customerName: string | null;
        validUntil: Date | null;
        sentAt: Date | null;
        rejectionReason: string | null;
    }>;
    acceptQuote(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.QuoteStatus;
        updatedAt: Date;
        version: number;
        businessClientId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        createdById: string | null;
        quoteNumber: string;
        customerName: string | null;
        validUntil: Date | null;
        sentAt: Date | null;
        rejectionReason: string | null;
    }>;
    rejectQuote(req: any, id: string, dto: RejectQuoteDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.QuoteStatus;
        updatedAt: Date;
        version: number;
        businessClientId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        createdById: string | null;
        quoteNumber: string;
        customerName: string | null;
        validUntil: Date | null;
        sentAt: Date | null;
        rejectionReason: string | null;
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
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        updatedAt: Date;
        version: number;
        branchId: string;
        deliveredAt: Date | null;
        businessClientId: string;
        orderNumber: string;
        deliveryAddressId: string | null;
        contactId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        internalNotes: string | null;
        confirmedAt: Date | null;
        shippedAt: Date | null;
        cancelledAt: Date | null;
        createdById: string | null;
        deliveryExceptionId: string | null;
        returnId: string | null;
        sourceQuoteId: string | null;
    }>;
}
export {};
