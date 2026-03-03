export declare class CreatePaymentDto {
    saleId: string;
    amount: number;
    method: 'CASH' | 'CARD' | 'TRANSFER';
    reference?: string;
}
