import { IsUUID, IsNumber, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
    @IsUUID()
    saleId: string;

    @IsNumber()
    amount: number;

    @IsEnum(['CASH', 'CARD', 'TRANSFER'])
    method: 'CASH' | 'CARD' | 'TRANSFER';

    @IsOptional()
    @IsString()
    reference?: string;
}
