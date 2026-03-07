'use client';

import { useLanguage, Language } from '@/lib/i18n/LanguageContext';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

/**
 * Language Switcher dropdown component.
 * Shows current language with a globe icon, and a dropdown to switch between EN/AR.
 * Updates the UI instantly and persists the selection.
 */
export function LanguageSwitcher() {
    const { language, setLanguage, t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const languages: { code: Language; label: string; nativeLabel: string }[] = [
        { code: 'en', label: t('languages.en'), nativeLabel: 'English' },
        { code: 'ar', label: t('languages.ar'), nativeLabel: 'العربية' },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg
                           text-slate-600 hover:bg-slate-100 hover:text-slate-900
                           transition-colors duration-150"
                aria-label="Change language"
                id="language-switcher"
            >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">
                    {language === 'en' ? 'EN' : 'AR'}
                </span>
            </button>

            {isOpen && (
                <div className="absolute end-0 top-full mt-1 w-40 bg-white border border-slate-200
                                rounded-lg shadow-lg z-50 py-1 animate-in fade-in slide-in-from-top-2">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                setLanguage(lang.code);
                                setIsOpen(false);
                            }}
                            className={`w-full text-start px-4 py-2 text-sm flex items-center justify-between
                                        hover:bg-slate-50 transition-colors duration-100
                                        ${language === lang.code ? 'text-blue-600 font-semibold bg-blue-50' : 'text-slate-700'}`}
                        >
                            <span>{lang.nativeLabel}</span>
                            {language === lang.code && (
                                <span className="text-blue-600">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
