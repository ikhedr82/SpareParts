import { IsString, IsNumber, IsOptional, IsPositive, MaxLength } from 'class-validator';

export class CreateExchangeRateDto {
    @IsString()
    @MaxLength(3)
    fromCurrencyId: string;

    @IsString()
    @MaxLength(3)
    toCurrencyId: string;

    @IsNumber()
    @IsPositive()
    rate: number;

    @IsOptional()
    @IsString()
    source?: string;
}

export class UpdateExchangeRateDto {
    @IsNumber()
    @IsPositive()
    rate: number;

    @IsOptional()
    @IsString()
    source?: string;
}
