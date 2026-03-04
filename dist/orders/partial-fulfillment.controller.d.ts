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
    getFulfillmentLines(orderId: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        orderId: string;
        orderItemId: string;
        fulfilledQty: number;
        backorderedQty: number;
    }[]>;
}
