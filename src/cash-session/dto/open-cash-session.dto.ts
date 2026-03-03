import { IsNotEmpty, IsNumber, IsString, Min, IsOptional } from 'class-validator';

export class OpenCashSessionDto {
    @IsOptional()
    @IsString()
    branchId: string;

    @IsNumber()
    @Min(0)
    openingCash: number;
}
