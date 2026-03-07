import { IsString, IsOptional, IsBoolean, IsEnum, MaxLength } from 'class-validator';

export class CreateBusinessClientAddressDto {
    @IsEnum(['BILLING', 'DELIVERY', 'BOTH'])
    type: string;

    @IsString()
    @MaxLength(200)
    addressLine1: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    addressLine2?: string;

    @IsString()
    @MaxLength(100)
    city: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    state?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    postalCode?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    country?: string;

    @IsOptional()
    @IsBoolean()
    isPrimary?: boolean;
}
