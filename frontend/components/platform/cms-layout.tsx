'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CMSPageLayoutProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    backHref?: string;
}

export function CMSPageLayout({ title, subtitle, children, actions, backHref = '/platform/cms' }: CMSPageLayoutProps) {
    const { language } = useLanguage();
    const isRtl = language === 'ar';
    const router = useRouter();

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
                <div className="space-y-4 max-w-2xl">
                    <button
                        onClick={() => router.push(backHref)}
                        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-all group"
                    >
                        <ArrowLeft className={`h-4 w-4 transition-transform group-hover:-translate-x-1 ${isRtl ? 'rotate-180 group-hover:translate-x-1' : ''}`} />
                        {language === 'ar' ? 'الرجوع' : 'Back'}
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-slate-500 mt-2 text-lg font-medium">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                {actions && (
                    <div className="flex items-center gap-3 shrink-0">
                        {actions}
                    </div>
                )}
            </div>

            <div className="pt-4">
                {children}
            </div>
        </div>
    );
}
