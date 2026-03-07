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

const STORAGE_KEY = 'antigravity-admin-language';

function resolveKey(dict: Record<string, any>, key: string): string | null {
    const segments = key.split('.');
    let current: any = dict;
    for (const segment of segments) {
        if (current === undefined || current === null || typeof current !== 'object') return null;
        current = current[segment];
    }
    return typeof current === 'string' ? current : null;
}

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

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
        if (saved && (saved === 'en' || saved === 'ar')) setLanguageState(saved);
    }, []);

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [language]);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(STORAGE_KEY, lang);
    }, []);

    const t = useCallback((key: string, params?: Record<string, string>): string => {
        let value = resolveKey(dictionaries[language], key);
        if (value === null && language !== 'en') value = resolveKey(dictionaries.en, key);
        if (value === null) return key;
        return interpolate(value, params);
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, dir: language === 'ar' ? 'rtl' : 'ltr', setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
    return context;
}
