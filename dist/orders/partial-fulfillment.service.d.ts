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
        cancelledAt: Date | null;
        returnId: string | null;
        createdById: string | null;
        deliveryExceptionId: string | null;
        orderNumber: string;
        deliveryAddressId: string | null;
        contactId: string | null;
        internalNotes: string | null;
        confirmedAt: Date | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
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
