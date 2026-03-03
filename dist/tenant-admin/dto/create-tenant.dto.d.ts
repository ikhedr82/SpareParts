import { LanguageCode } from '@prisma/client';
export declare class CreateTenantDto {
    name: string;
    subdomain: string;
    planId?: string;
    adminEmail: string;
    adminPassword: string;
    defaultLanguage?: LanguageCode;
    supportedLanguages?: LanguageCode[];
    baseCurrency?: string;
    supportedCurrencies?: string[];
}
