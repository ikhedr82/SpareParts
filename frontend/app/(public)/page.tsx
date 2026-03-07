'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Package, BarChart3, Shield, Globe, Truck, CreditCard, Zap, ArrowRight } from 'lucide-react';

export default function LandingPage() {
    const { t } = useLanguage();

    const features = [
        { icon: Package, title: t('landing.features.inventory.title'), desc: t('landing.features.inventory.desc'), color: 'from-blue-500 to-blue-600' },
        { icon: CreditCard, title: t('landing.features.sales.title'), desc: t('landing.features.sales.desc'), color: 'from-emerald-500 to-emerald-600' },
        { icon: Truck, title: t('landing.features.logistics.title'), desc: t('landing.features.logistics.desc'), color: 'from-violet-500 to-violet-600' },
        { icon: BarChart3, title: t('landing.features.analytics.title'), desc: t('landing.features.analytics.desc'), color: 'from-amber-500 to-amber-600' },
        { icon: Globe, title: t('landing.features.multi_tenant.title'), desc: t('landing.features.multi_tenant.desc'), color: 'from-cyan-500 to-cyan-600' },
        { icon: Shield, title: t('landing.features.security.title'), desc: t('landing.features.security.desc'), color: 'from-rose-500 to-rose-600' },
    ];

    return (
        <div>
            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex items-center py-24">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-8">
                            <Zap className="w-4 h-4" />
                            {t('landing.hero.badge')}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
                            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                                {t('landing.hero.title_line1')}
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                                {t('landing.hero.title_line2')}
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl">
                            {t('landing.hero.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/(public)/signup"
                                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-lg font-bold hover:from-blue-500 hover:to-cyan-400 transition-all shadow-2xl shadow-blue-500/25"
                            >
                                {t('landing.hero.cta')}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/(public)/features"
                                className="inline-flex items-center justify-center px-8 py-4 border border-white/10 rounded-xl text-lg font-medium text-gray-300 hover:bg-white/5 hover:border-white/20 transition-all"
                            >
                                {t('landing.hero.learn_more')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.features.section_title')}</h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t('landing.features.section_subtitle')}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <div key={i} className="group p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all duration-300">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <f.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Teaser */}
            <section className="py-24 bg-gradient-to-b from-transparent via-blue-950/30 to-transparent">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.pricing.teaser_title')}</h2>
                    <p className="text-gray-400 text-lg mb-10">{t('landing.pricing.teaser_subtitle')}</p>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 backdrop-blur-sm">
                        <div className="text-sm text-blue-400 font-semibold uppercase tracking-widest mb-2">{t('landing.pricing.free_label')}</div>
                        <div className="text-5xl md:text-6xl font-black mb-4">$0<span className="text-xl text-gray-500">/{t('landing.pricing.per_month')}</span></div>
                        <ul className="text-gray-300 space-y-3 mb-8 max-w-md mx-auto">
                            <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> {t('landing.pricing.free_users')}</li>
                            <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> {t('landing.pricing.free_branch')}</li>
                            <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> {t('landing.pricing.free_products')}</li>
                            <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> {t('landing.pricing.free_orders')}</li>
                        </ul>
                        <Link
                            href="/(public)/signup"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-lg font-bold hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg shadow-blue-500/25"
                        >
                            {t('landing.hero.cta')}
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
