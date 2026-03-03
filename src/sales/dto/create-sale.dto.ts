import { IsUUID, IsOptional, IsString, ValidateNested, IsInt, Min, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleItemDto {
    @IsUUID()
    productId: string;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class CreateSaleDto {
    @IsOptional()
    @IsUUID()
    branchId?: string;

    @IsOptional()
    @IsString()
    customerName?: string;

    @IsOptional()
    @IsUUID()
    customerId?: string;

    @ValidateNested({ each: true })
    @Type(() => CreateSaleItemDto)
    @ArrayMinSize(1)
    items: CreateSaleItemDto[];
}
