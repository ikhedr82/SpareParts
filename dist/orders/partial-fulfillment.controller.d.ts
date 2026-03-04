import { PartialFulfillmentService } from './partial-fulfillment.service';
export declare class PartialFulfillmentController {
    private readonly service;
    constructor(service: PartialFulfillmentService);
    partialFulfill(orderId: string, body: {
        lines: {
            orderItemId: string;
            fulfilledQty: number;
        }[];
    }, req: any): Promise<{
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
    getFulfillmentLines(orderId: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        orderId: string;
        orderItemId: string;
        fulfilledQty: number;
        backorderedQty: number;
    }[]>;
}
