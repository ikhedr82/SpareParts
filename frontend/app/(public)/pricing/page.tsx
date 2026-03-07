'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Check, ArrowRight } from 'lucide-react';

export default function PricingPage() {
    const { t } = useLanguage();

    const plans = [
        {
            name: t('landing.pricing.free_name'),
            price: '$0',
            period: t('landing.pricing.per_month'),
            highlight: false,
            features: [
                t('landing.pricing.free_users'),
                t('landing.pricing.free_branch'),
                t('landing.pricing.free_products'),
                t('landing.pricing.free_orders'),
                t('landing.pricing.free_support'),
            ],
            cta: t('landing.nav.start_free'),
            href: '/(public)/signup',
        },
        {
            name: t('landing.pricing.pro_name'),
            price: '$49',
            period: t('landing.pricing.per_month'),
            highlight: true,
            features: [
                t('landing.pricing.pro_users'),
                t('landing.pricing.pro_branches'),
                t('landing.pricing.pro_products'),
                t('landing.pricing.pro_orders'),
                t('landing.pricing.pro_analytics'),
                t('landing.pricing.pro_logistics'),
                t('landing.pricing.pro_support'),
            ],
            cta: t('landing.pricing.contact_sales'),
            href: '/(public)/signup',
        },
        {
            name: t('landing.pricing.enterprise_name'),
            price: t('landing.pricing.custom'),
            period: '',
            highlight: false,
            features: [
                t('landing.pricing.enterprise_users'),
                t('landing.pricing.enterprise_branches'),
                t('landing.pricing.enterprise_products'),
                t('landing.pricing.enterprise_api'),
                t('landing.pricing.enterprise_sla'),
                t('landing.pricing.enterprise_support'),
            ],
            cta: t('landing.pricing.contact_sales'),
            href: '/(public)/signup',
        },
    ];

    return (
        <section className="py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {t('landing.pricing.title')}
                    </h1>
                    <p className="text-gray-400 text-lg">{t('landing.pricing.subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`relative flex flex-col p-8 rounded-2xl border transition-all duration-300 ${
                                plan.highlight
                                    ? 'bg-gradient-to-b from-blue-950/80 to-blue-900/40 border-blue-500/30 shadow-xl shadow-blue-500/10 scale-105'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                            }`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-4 inset-x-0 flex justify-center">
                                    <span className="px-4 py-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full text-xs font-bold uppercase tracking-widest">
                                        {t('landing.pricing.popular')}
                                    </span>
                                </div>
                            )}
                            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                            <div className="mb-6">
                                <span className="text-4xl font-black">{plan.price}</span>
                                {plan.period && <span className="text-gray-500 ms-1">/{plan.period}</span>}
                            </div>
                            <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((f, j) => (
                                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={plan.href}
                                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                                    plan.highlight
                                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg'
                                        : 'border border-white/10 hover:bg-white/5'
                                }`}
                            >
                                {plan.cta}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
