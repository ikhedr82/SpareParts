import { IsString, IsNumber, Min, Max } from 'class-validator';

export class CreateTaxRateDto {
    @IsString()
    name: string;

    @IsNumber()
    @Min(0)
    percentage: number;
}
