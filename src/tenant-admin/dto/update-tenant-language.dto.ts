import { IsEnum, IsArray, ArrayNotEmpty, IsOptional } from 'class-validator';

export enum LanguageCode {
    EN = 'EN',
    AR = 'AR',
}

export class UpdateTenantLanguageDto {
    @IsOptional()
    @IsEnum(LanguageCode)
    defaultLanguage?: LanguageCode;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsEnum(LanguageCode, { each: true })
    supportedLanguages?: LanguageCode[];
}
