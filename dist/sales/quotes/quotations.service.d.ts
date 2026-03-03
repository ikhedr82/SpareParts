import { PrismaService } from '../../prisma/prisma.service';
import { PriceEngineService } from '../pricing/price-engine.service';
import { TranslationService } from '../../i18n/translation.service';
export declare class QuotationsService {
    private prisma;
    private priceEngine;
    private t;
    constructor(prisma: PrismaService, priceEngine: PriceEngineService, t: TranslationService);
    create(userId: string, tenantId: string, dto: any): Promise<{
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
    convertToOrder(quoteId: string, userId: string): Promise<{
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
