import { IsArray, IsNumber, IsOptional, ValidateNested, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ReceiveItemDto {
    @IsUUID()
    productId: string;

    @IsNumber()
    @Min(1)
    quantity: number;
}

export class ReceivePurchaseOrderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReceiveItemDto)
    items: ReceiveItemDto[];

    @IsNumber()
    @IsOptional()
    @Min(0)
    freightCost?: number;
}
