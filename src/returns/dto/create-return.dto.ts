import { IsUUID, IsArray, ValidateNested, IsInt, Min, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class ReturnLineDto {
    @IsUUID()
    productId: string;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class CreateReturnDto {
    @IsUUID()
    saleId: string;

    @IsOptional()
    @IsString()
    reason?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReturnLineDto)
    items: ReturnLineDto[];
}
