import React, { createContext, useContext, useState, useCallback } from 'react';
import { I18nManager } from 'react-native';
import en from '../locales/en.json';
import ar from '../locales/ar.json';

type Language = 'en' | 'ar';
const dictionaries: Record<Language, any> = { en, ar };

interface LanguageContextType {
    language: Language;
    dir: 'ltr' | 'rtl';
    isRtl: boolean;
    t: (key: string, params?: Record<string, string | number>) => string;
    setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function resolve(obj: any, path: string): string {
    return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? path;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLang] = useState<Language>('en');

    const isRtl = language === 'ar';
    const dir = isRtl ? 'rtl' : 'ltr';

    const t = useCallback((key: string, params?: Record<string, string | number>) => {
        let value = resolve(dictionaries[language], key);
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                value = value.replace(`{{${k}}}`, String(v));
            });
        }
        return value;
    }, [language]);

    const setLanguage = useCallback((lang: Language) => {
        setLang(lang);
        I18nManager.forceRTL(lang === 'ar');
    }, []);

    return (
        <LanguageContext.Provider value={{ language, dir, isRtl, t, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
    return ctx;
}
