import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateIntentDto {
    @IsString()
    @IsNotEmpty()
    saleId: string;

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsString()
    @IsOptional()
    currency?: string;
}
