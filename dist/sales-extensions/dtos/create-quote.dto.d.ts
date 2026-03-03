export declare class QuoteItemDto {
    productId: string;
    quantity: number;
    discount: number;
}
export declare class CreateQuoteDto {
    businessClientId?: string;
    customerName?: string;
    validUntil: string;
    items: QuoteItemDto[];
}
