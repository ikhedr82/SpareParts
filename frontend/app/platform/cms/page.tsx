'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LayoutGrid, Quote, MessageCircleQuestion, Scale, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CMSPage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';

    const sections = [
        {
            title: t('platform.cms.landing_sections'),
            subtitle: t('platform.cms.hero') + ', ' + t('platform.cms.features'),
            href: '/platform/cms/landing',
            icon: LayoutGrid,
            color: 'bg-indigo-50 text-indigo-600'
        },
        {
            title: t('platform.cms.testimonials'),
            subtitle: 'Manage client feedback and success stories',
            href: '/platform/cms/testimonials',
            icon: Quote,
            color: 'bg-emerald-50 text-emerald-600'
        },
        {
            title: t('platform.cms.faqs'),
            subtitle: 'Manage frequently asked questions',
            href: '/platform/cms/faqs',
            icon: MessageCircleQuestion,
            color: 'bg-amber-50 text-amber-600'
        },
        {
            title: t('platform.cms.legal_pages'),
            subtitle: 'Update Privacy Policy and Terms & Conditions',
            href: '/platform/cms/legal',
            icon: Scale,
            color: 'bg-rose-50 text-rose-600'
        }
    ];

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-10" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="mb-10">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                    {t('platform.cms.title')}
                </h1>
                <p className="text-slate-500 mt-2 text-lg font-medium">
                    {t('platform.cms.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section) => (
                    <Link
                        key={section.href}
                        href={section.href}
                        className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col justify-between"
                    >
                        <div className="space-y-6">
                            <div className={`w-16 h-16 ${section.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                                <section.icon className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    {section.title}
                                </h3>
                                <p className="text-slate-500 font-medium mt-2">
                                    {section.subtitle}
                                </p>
                            </div>
                        </div>
                        <div className="mt-8 flex items-center gap-2 text-indigo-600 font-bold group-hover:translate-x-2 transition-transform duration-300 rtl:group-hover:-translate-x-2">
                            {t('common.manage') || 'Manage'}
                            <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
