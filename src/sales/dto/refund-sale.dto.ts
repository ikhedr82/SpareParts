import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RefundSaleDto {
    @IsNotEmpty()
    @IsString()
    saleId: string;

    @IsNumber()
    @Min(0.01)
    amount: number;

    @IsOptional()
    @IsString()
    reason?: string;
}
