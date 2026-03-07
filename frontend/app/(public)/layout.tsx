'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const { t, dir } = useLanguage();

    return (
        <div dir={dir} className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white">
            {/* Navigation */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/(public)" className="flex items-center gap-2">
                        <Image src="/brand/logo-dark.svg" alt="Partivo" width={140} height={36} priority />
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/(public)/features" className="text-sm text-gray-300 hover:text-white transition-colors">
                            {t('landing.nav.features')}
                        </Link>
                        <Link href="/(public)/pricing" className="text-sm text-gray-300 hover:text-white transition-colors">
                            {t('landing.nav.pricing')}
                        </Link>
                        <LanguageSwitcher />
                        <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
                            {t('landing.nav.login')}
                        </Link>
                        <Link
                            href="/(public)/signup"
                            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-500 rounded-lg text-sm font-semibold hover:from-emerald-500 hover:to-cyan-400 transition-all shadow-lg shadow-emerald-500/25"
                        >
                            {t('landing.nav.start_free')}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <div className="pt-20">
                {children}
            </div>

            {/* Footer */}
            <footer className="border-t border-white/5 mt-20">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-500">
                            © 2026 Partivo Commerce Platform. {t('landing.footer.rights')}
                        </p>
                        <div className="flex gap-6 text-sm text-gray-500">
                            <Link href="/(public)/features" className="hover:text-gray-300 transition-colors">{t('landing.nav.features')}</Link>
                            <Link href="/(public)/pricing" className="hover:text-gray-300 transition-colors">{t('landing.nav.pricing')}</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
