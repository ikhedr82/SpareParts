import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export type LanguageCode = 'EN' | 'AR';

const SUPPORTED_LANGUAGES: LanguageCode[] = ['EN', 'AR'];
const DEFAULT_LANGUAGE: LanguageCode = 'EN';

@Injectable()
export class TranslationService implements OnModuleInit {
    private dictionaries: Record<string, Record<string, any>> = {};

    onModuleInit() {
        this.loadDictionaries();
    }

    /**
     * Load all translation JSON files from the i18n directory.
     * Structure: i18n/{lang}/{namespace}.json
     */
    private loadDictionaries(): void {
        const i18nDir = path.join(__dirname, '..');

        for (const lang of SUPPORTED_LANGUAGES) {
            const langDir = path.join(i18nDir, lang.toLowerCase());
            if (!fs.existsSync(langDir)) continue;

            const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));
            for (const file of files) {
                const namespace = file.replace('.json', '');
                const filePath = path.join(langDir, file);
                const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                const key = `${lang.toLowerCase()}.${namespace}`;
                this.dictionaries[key] = content;
            }
        }
    }

    /**
     * Translate a key to the specified language.
     *
     * @param key - Dot-separated key path, e.g. 'errors.inventory.insufficient_stock'
     * @param lang - Target language code (EN or AR)
     * @param params - Optional parameters for interpolation, e.g. { product: 'Brake Pad' }
     * @returns The translated string, with fallback to EN if key is missing in target language.
     */
    translate(key: string, lang?: LanguageCode | string, params?: Record<string, any>): string {
        const targetLang = (lang || DEFAULT_LANGUAGE).toString().toUpperCase();

        // Parse the key: first segment is namespace, rest is the nested path
        const segments = key.split('.');
        if (segments.length < 2) return key;

        const namespace = segments[0];
        const nestedPath = segments.slice(1);

        // Try target language first
        let value = this.resolveKey(targetLang.toLowerCase(), namespace, nestedPath);

        // Fallback to EN if not found
        if (value === null && targetLang !== 'EN') {
            value = this.resolveKey('en', namespace, nestedPath);
        }

        // If still not found, return the key itself
        if (value === null) return key;

        // Interpolate parameters: replace {{param}} with actual values
        if (params) {
            for (const [paramKey, paramValue] of Object.entries(params)) {
                value = value.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), String(paramValue));
            }
        }

        return value;
    }

    /**
     * Shorthand for translate() — commonly used as t()
     */
    t(key: string, lang?: LanguageCode | string, params?: Record<string, any>): string {
        return this.translate(key, lang, params);
    }

    /**
     * Resolve a nested key from a specific language dictionary.
     */
    private resolveKey(lang: string, namespace: string, path: string[]): string | null {
        const dictKey = `${lang}.${namespace}`;
        const dict = this.dictionaries[dictKey];
        if (!dict) return null;

        let current: any = dict;
        for (const segment of path) {
            if (current === undefined || current === null || typeof current !== 'object') {
                return null;
            }
            current = current[segment];
        }

        return typeof current === 'string' ? current : null;
    }

    /**
     * Check if a language code is supported.
     */
    isSupported(lang: string): boolean {
        return SUPPORTED_LANGUAGES.includes(lang.toUpperCase() as LanguageCode);
    }

    /**
     * Get all supported language codes.
     */
    getSupportedLanguages(): LanguageCode[] {
        return [...SUPPORTED_LANGUAGES];
    }
}
