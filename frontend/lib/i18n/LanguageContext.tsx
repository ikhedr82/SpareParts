'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import enLocale from '../../locales/en.json';
import arLocale from '../../locales/ar.json';

export type Language = 'en' | 'ar';

const dictionaries: Record<Language, Record<string, any>> = {
    en: enLocale,
    ar: arLocale,
};

interface LanguageContextType {
    language: Language;
    dir: 'ltr' | 'rtl';
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'partivo-language';

/**
 * Resolve a dot-notation key from a nested dictionary.
 */
function resolveKey(dict: Record<string, any>, key: string): string | null {
    const segments = key.split('.');
    let current: any = dict;
    for (const segment of segments) {
        if (current === undefined || current === null || typeof current !== 'object') {
            return null;
        }
        current = current[segment];
    }
    return typeof current === 'string' ? current : null;
}

/**
 * Interpolate {{params}} in a translation string.
 */
function interpolate(value: string, params?: Record<string, string>): string {
    if (!params) return value;
    let result = value;
    for (const [k, v] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
    }
    return result;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    // Load saved language preference on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
        if (saved && (saved === 'en' || saved === 'ar')) {
            setLanguageState(saved);
        }
    }, []);

    // Update <html> attributes when language changes
    useEffect(() => {
        const dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
        document.documentElement.dir = dir;
    }, [language]);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(STORAGE_KEY, lang);
    }, []);

    const t = useCallback((key: string, params?: Record<string, string>): string => {
        // Try target language first
        let value = resolveKey(dictionaries[language], key);

        // Fallback to English
        if (value === null && language !== 'en') {
            value = resolveKey(dictionaries.en, key);
        }

        // Return key if nothing found
        if (value === null) return key;

        return interpolate(value, params);
    }, [language]);

    const dir = language === 'ar' ? 'rtl' : 'ltr';

    return (
        <LanguageContext.Provider value={{ language, dir, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

/**
 * Hook to access translation function and language state.
 *
 * Usage:
 * const { t, language, setLanguage, dir } = useLanguage();
 * <h1>{t('dashboard.title')}</h1>
 */
export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
