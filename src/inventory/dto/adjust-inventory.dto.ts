import { IsNotEmpty, IsString, IsNumber, IsUUID, IsOptional } from 'class-validator';

export class AdjustInventoryDto {
    @IsNotEmpty()
    @IsUUID()
    productId: string;

    @IsOptional()
    @IsUUID()
    branchId: string;

    @IsNotEmpty()
    @IsNumber()
    quantityChange: number;

    @IsNotEmpty()
    @IsString()
    reason: string;

    @IsOptional()
    @IsNumber()
    unitCost?: number;
}
