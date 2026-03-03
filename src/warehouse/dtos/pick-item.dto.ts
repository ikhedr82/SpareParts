import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class PickItemDto {
    @IsString()
    @IsNotEmpty()
    scannedBarcode: string;

    @IsInt()
    @Min(1)
    quantity: number;

    @IsString()
    @IsNotEmpty()
    binLocation: string;
}
