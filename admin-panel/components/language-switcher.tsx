'use client';

import { useLanguage, Language } from '@/lib/i18n/LanguageContext';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function LanguageSwitcher() {
    const { language, setLanguage, t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const langs: { code: Language; native: string }[] = [
        { code: 'en', native: 'English' },
        { code: 'ar', native: 'العربية' },
    ];

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-2 py-1 text-sm rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                id="admin-language-switcher"
            >
                <Globe className="w-4 h-4" />
                {language.toUpperCase()}
            </button>
            {isOpen && (
                <div className="absolute end-0 top-full mt-1 w-36 bg-white border rounded-lg shadow-lg z-50 py-1">
                    {langs.map((l) => (
                        <button
                            key={l.code}
                            onClick={() => { setLanguage(l.code); setIsOpen(false); }}
                            className={`w-full text-start px-4 py-2 text-sm hover:bg-gray-50 flex justify-between
                                ${language === l.code ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-700'}`}
                        >
                            {l.native}
                            {language === l.code && <span>✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
