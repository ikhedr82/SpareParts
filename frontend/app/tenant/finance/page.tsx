'use client';

import Link from 'next/link';
import { FileText, PieChart, Percent } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function FinanceDashboard() {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';

    const cards = [
        { title: t('finance.invoices'), href: '/tenant/finance/invoices', icon: FileText, desc: t('finance.invoices_desc') },
        { title: t('finance.taxes'), href: '/tenant/finance/taxes', icon: Percent, desc: t('finance.taxes_desc') },
        { title: t('finance.reports'), href: '/tenant/finance/reports', icon: PieChart, desc: t('finance.reports_desc') },
    ];

    return (
        <div className={`p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">{t('finance.title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card) => (
                    <Link key={card.href} href={card.href} className="block p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                                <card.icon className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-semibold text-slate-900">{card.title}</h2>
                        </div>
                        <p className="text-slate-600">{card.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
