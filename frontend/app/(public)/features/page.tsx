'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Package, BarChart3, Shield, Globe, Truck, CreditCard, Warehouse, Users, Receipt, ArrowRightLeft } from 'lucide-react';

export default function FeaturesPage() {
    const { t } = useLanguage();

    const modules = [
        { icon: CreditCard, title: t('landing.features_page.sales'), desc: t('landing.features_page.sales_desc'), color: 'from-emerald-500 to-emerald-600' },
        { icon: Package, title: t('landing.features_page.inventory'), desc: t('landing.features_page.inventory_desc'), color: 'from-blue-500 to-blue-600' },
        { icon: Warehouse, title: t('landing.features_page.warehouse'), desc: t('landing.features_page.warehouse_desc'), color: 'from-violet-500 to-violet-600' },
        { icon: Truck, title: t('landing.features_page.logistics'), desc: t('landing.features_page.logistics_desc'), color: 'from-amber-500 to-amber-600' },
        { icon: BarChart3, title: t('landing.features_page.analytics'), desc: t('landing.features_page.analytics_desc'), color: 'from-rose-500 to-rose-600' },
        { icon: Receipt, title: t('landing.features_page.finance'), desc: t('landing.features_page.finance_desc'), color: 'from-cyan-500 to-cyan-600' },
        { icon: Users, title: t('landing.features_page.customers'), desc: t('landing.features_page.customers_desc'), color: 'from-pink-500 to-pink-600' },
        { icon: Globe, title: t('landing.features_page.multi_lang'), desc: t('landing.features_page.multi_lang_desc'), color: 'from-teal-500 to-teal-600' },
        { icon: Shield, title: t('landing.features_page.security'), desc: t('landing.features_page.security_desc'), color: 'from-orange-500 to-orange-600' },
        { icon: ArrowRightLeft, title: t('landing.features_page.substitutions'), desc: t('landing.features_page.substitutions_desc'), color: 'from-indigo-500 to-indigo-600' },
    ];

    return (
        <section className="py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {t('landing.features_page.title')}
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        {t('landing.features_page.subtitle')}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {modules.map((m, i) => (
                        <div key={i} className="group flex gap-5 p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all duration-300">
                            <div className={`w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <m.icon className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1">{m.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{m.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
