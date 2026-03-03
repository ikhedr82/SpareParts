import { IsNotEmpty, IsString, IsNumber, IsOptional, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchaseOrderItemDto {
    @IsNotEmpty()
    @IsUUID()
    productId: string;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @IsNotEmpty()
    @IsNumber()
    unitCost: number;
}

export class CreatePurchaseOrderDto {
    @IsOptional()
    @IsString()
    branchId: string;

    @IsNotEmpty()
    @IsString()
    supplierName: string;

    @IsOptional()
    @IsUUID()
    supplierId?: string;

    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => CreatePurchaseOrderItemDto)
    items: CreatePurchaseOrderItemDto[];
}
