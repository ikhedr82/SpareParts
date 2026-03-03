export declare class CreateExchangeRateDto {
    fromCurrencyId: string;
    toCurrencyId: string;
    rate: number;
    source?: string;
}
export declare class UpdateExchangeRateDto {
    rate: number;
    source?: string;
}
