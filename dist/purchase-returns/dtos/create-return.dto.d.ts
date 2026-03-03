export declare class ReturnItemDto {
    productId: string;
    quantity: number;
    reason: string;
}
export declare class CreatePurchaseReturnDto {
    purchaseOrderId: string;
    items: ReturnItemDto[];
}
