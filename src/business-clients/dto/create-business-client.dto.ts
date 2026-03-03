import { IsEnum, IsString, IsOptional, IsEmail, IsNumber, Min, MaxLength } from 'class-validator';
import { BusinessClientType } from '@prisma/client';

export class CreateBusinessClientDto {
    @IsEnum(BusinessClientType)
    type: BusinessClientType;

    @IsString()
    @MaxLength(200)
    businessName: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    registrationNumber?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    taxId?: string;

    @IsOptional()
    @IsEmail()
    primaryEmail?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    primaryPhone?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    creditLimit?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    paymentTermsDays?: number;

    @IsOptional()
    @IsString()
    notes?: string;
}
