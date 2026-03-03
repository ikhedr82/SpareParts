import { OnModuleInit } from '@nestjs/common';
export type LanguageCode = 'EN' | 'AR';
export declare class TranslationService implements OnModuleInit {
    private dictionaries;
    onModuleInit(): void;
    private loadDictionaries;
    translate(key: string, lang?: LanguageCode | string, params?: Record<string, any>): string;
    t(key: string, lang?: LanguageCode | string, params?: Record<string, any>): string;
    private resolveKey;
    isSupported(lang: string): boolean;
    getSupportedLanguages(): LanguageCode[];
}
