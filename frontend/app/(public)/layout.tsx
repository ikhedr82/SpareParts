'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Navbar } from '@/components/landing/navbar';
import { ScrollToTop } from '@/components/landing/scroll-to-top';
import Link from 'next/link';
import { useCMSContent } from '@/lib/hooks/use-cms-content';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const { t, dir, language } = useLanguage();
    const isAr = language === 'ar';
    const { data: footerData } = useCMSContent('footer');

    const content = isAr ? footerData?.contentAr : footerData?.contentEn;
    const tagline = (isAr ? footerData?.titleAr : footerData?.titleEn) || t('landing.footer.tagline');
    const description = content?.description || t('landing.footer.description');
    const address = content?.address || 'Riyadh, Saudi Arabia';
    const email = footerData?.contentEn?.email || 'info@partivo.com';
    const phone = footerData?.contentEn?.phone || '+966 11 000 0000';
    const copyrightText = content?.copyright || '2026 Partivo Commerce Platform';

    return (
        <div dir={dir} className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
            <Navbar />

            <main>
                {children}
            </main>

            <ScrollToTop />

            {/* Footer */}
            <footer className="bg-slate-950 border-t border-white/5 py-20">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-2">
                             <h2 className="text-2xl font-black mb-6 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent inline-block">
                                {tagline}
                             </h2>
                             <p className="text-slate-400 max-w-sm mb-8 font-medium">
                                {description}
                             </p>
                             <div className="space-y-2 text-sm text-slate-500 font-bold uppercase tracking-widest">
                                <p>{address}</p>
                                <p>{email}</p>
                                <p>{phone}</p>
                             </div>
                        </div>
                        
                        <div>
                            <h3 className="font-bold mb-6 text-white uppercase tracking-widest text-xs opacity-50">{t('landing.nav.about')}</h3>
                            <ul className="space-y-4 text-slate-400 font-bold">
                                <li><button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-blue-400 transition-colors">Home</button></li>
                                <li><a href="#features" className="hover:text-blue-400 transition-colors">{t('landing.nav.features')}</a></li>
                                <li><a href="#pricing" className="hover:text-blue-400 transition-colors">{t('landing.nav.pricing')}</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold mb-6 text-white uppercase tracking-widest text-xs opacity-50">{t('landing.nav.contact')}</h3>
                            <ul className="space-y-4 text-slate-400 font-bold">
                                <li><a href="#contact" className="hover:text-blue-400 transition-colors">{t('landing.nav.contact')}</a></li>
                                <li><a href="#faq" className="hover:text-blue-400 transition-colors">{t('landing.faq.title')}</a></li>
                                <li><Link href="/login" className="hover:text-blue-400 transition-colors">{t('landing.nav.login')}</Link></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 font-bold uppercase tracking-widest">
                        <p>© {copyrightText}. {t('landing.footer.rights')}</p>
                        <div className="flex gap-8">
                            <Link href="/privacy" className="hover:text-white transition-colors">{t('landing.nav.privacy')}</Link>
                            <Link href="/terms" className="hover:text-white transition-colors">{t('landing.nav.terms')}</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
