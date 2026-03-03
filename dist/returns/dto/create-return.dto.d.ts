declare class ReturnLineDto {
    productId: string;
    quantity: number;
}
export declare class CreateReturnDto {
    saleId: string;
    reason?: string;
    items: ReturnLineDto[];
}
export {};
