import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateCurrencyDto {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    symbol: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean = true;
}

export class UpdateCurrencyDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    symbol?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
