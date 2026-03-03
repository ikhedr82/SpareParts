export declare class CreateSaleItemDto {
    productId: string;
    quantity: number;
}
export declare class CreateSaleDto {
    branchId?: string;
    customerName?: string;
    customerId?: string;
    items: CreateSaleItemDto[];
}
