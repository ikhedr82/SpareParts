import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
import { TranslationService } from '../i18n/translation.service';
export declare class PartialFulfillmentService {
    private readonly prisma;
    private readonly auditService;
    private readonly outbox;
    private readonly t;
    constructor(prisma: PrismaService, auditService: AuditService, outbox: OutboxService, t: TranslationService);
    partialFulfill(tenantId: string, orderId: string, userId: string, fulfillmentLines: {
        orderItemId: string;
        fulfilledQty: number;
    }[], correlationId?: string): Promise<{
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
    getFulfillmentLines(tenantId: string, orderId: string): Promise<{
        id: string;
        createdAt: Date;
        orderId: string;
        orderItemId: string;
        fulfilledQty: number;
        backorderedQty: number;
    }[]>;
}
