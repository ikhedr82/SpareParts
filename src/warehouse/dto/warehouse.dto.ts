import { IsInt, IsString, Min, IsOptional, IsDecimal } from 'class-validator';

export class PickItemDto {
    @IsString()
    pickListItemId: string;

    @IsInt()
    @Min(0)
    pickedQty: number;
}

export class AddPackItemDto {
    @IsString()
    productId: string;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class SealPackDto {
    @IsOptional()
    @IsDecimal()
    weight?: number;
}
