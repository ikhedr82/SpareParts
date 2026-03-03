import { IsString, IsNotEmpty, IsEmail, MinLength, IsOptional, IsEnum, IsArray } from 'class-validator';
import { LanguageCode } from '@prisma/client';

export class CreateTenantDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional() // Subdomain might be auto-generated or optional in some flows
    subdomain: string;

    @IsOptional()
    @IsString()
    planId?: string;

    @IsEmail()
    adminEmail: string;

    @IsString()
    @MinLength(8)
    adminPassword: string;

    @IsEnum(LanguageCode)
    @IsOptional()
    defaultLanguage?: LanguageCode = LanguageCode.EN;

    @IsArray()
    @IsEnum(LanguageCode, { each: true })
    @IsOptional()
    supportedLanguages?: LanguageCode[] = [LanguageCode.EN, LanguageCode.AR];

    @IsString()
    @IsOptional()
    baseCurrency?: string = 'USD';

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    supportedCurrencies?: string[] = ['USD'];
}
