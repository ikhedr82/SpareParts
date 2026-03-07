import { IsString, IsArray, ValidateNested, IsInt, Min, IsEnum, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class ReturnItemDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsInt()
    @Min(1)
    quantity: number;

    @IsString()
    @IsNotEmpty()
    reason: string;
}

export class CreatePurchaseReturnDto {
    @IsString()
    @IsNotEmpty()
    purchaseOrderId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReturnItemDto)
    items: ReturnItemDto[];
}
