import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateInventoryDto {
    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @IsUUID()
    @IsNotEmpty()
    branchId: string;

    @IsNumber()
    @Min(0)
    quantity: number;

    @IsNumber()
    @Min(0)
    sellingPrice: number;

    @IsString()
    @IsOptional()
    barcode?: string;
}
