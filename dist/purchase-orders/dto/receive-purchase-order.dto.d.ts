declare class ReceiveItemDto {
    productId: string;
    quantity: number;
}
export declare class ReceivePurchaseOrderDto {
    items: ReceiveItemDto[];
    freightCost?: number;
}
export {};
