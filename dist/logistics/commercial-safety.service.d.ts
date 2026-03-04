import { PrismaService } from '../prisma/prisma.service';
import { InventorySafetyService } from '../warehouse/inventory-safety.service';
export declare class CommercialSafetyService {
    private prisma;
    private inventorySafety;
    constructor(prisma: PrismaService, inventorySafety: InventorySafetyService);
    processReplacement(tenantId: string, userId: string, returnId?: string, deliveryExceptionId?: string): Promise<{
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
    processLoss(tenantId: string, exceptionId: string, userId: string): Promise<void>;
}
