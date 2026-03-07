import { IsNotEmpty, IsNumber, IsString, Min, IsOptional } from 'class-validator';

export class CloseCashSessionDto {
    @IsOptional()
    @IsString()
    branchId: string;

    @IsNumber()
    @Min(0)
    closingCash: number;
}
