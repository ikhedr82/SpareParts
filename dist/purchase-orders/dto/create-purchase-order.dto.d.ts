export declare class CreatePurchaseOrderItemDto {
    productId: string;
    quantity: number;
    unitCost: number;
}
export declare class CreatePurchaseOrderDto {
    branchId: string;
    supplierName: string;
    supplierId?: string;
    items: CreatePurchaseOrderItemDto[];
}
