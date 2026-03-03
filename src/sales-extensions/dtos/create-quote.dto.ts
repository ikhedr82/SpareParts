import { IsString, IsNotEmpty, IsDateString, IsOptional, IsArray, ValidateNested, IsInt, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class QuoteItemDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsInt()
    @Min(1)
    quantity: number;

    @IsNumber()
    @Min(0)
    discount: number;
}

export class CreateQuoteDto {
    @IsString()
    @IsOptional()
    businessClientId?: string;

    @IsString()
    @IsOptional()
    customerName?: string;

    @IsDateString()
    validUntil: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuoteItemDto)
    items: QuoteItemDto[];
}
