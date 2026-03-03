import { InventoryTransactionType, InventoryReferenceType } from '@prisma/client';
export declare class RecordTransactionDto {
    tenantId: string;
    branchId: string;
    productId: string;
    type: InventoryTransactionType;
    quantityChange: number;
    referenceType: InventoryReferenceType;
    referenceId: string;
    userId: string;
    unitCost?: number;
}
