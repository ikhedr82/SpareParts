'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useCMSLegal } from '@/lib/hooks/use-cms-content';
import { Navbar } from '@/components/landing/navbar';
import { motion } from 'framer-motion';

export default function TermsConditionsPage() {
    const { t, language } = useLanguage();
    const isAr = language === 'ar';
    const { data: legal, isLoading } = useCMSLegal('terms');

    const title = isAr ? (legal?.titleAr || 'الشروط والأحكام') : (legal?.titleEn || 'Terms & Conditions');
    const content = isAr ? (legal?.contentAr || 'Content is being updated...') : (legal?.contentEn || 'Content is being updated...');

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col">
                <Navbar />
                <div className="flex-grow container mx-auto px-4 py-32 max-w-4xl animate-pulse">
                    <div className="h-12 w-64 bg-slate-800 rounded-xl mb-12" />
                    <div className="space-y-6">
                        <div className="h-6 w-full bg-slate-800 rounded-lg" />
                        <div className="h-6 w-full bg-slate-800 rounded-lg" />
                        <div className="h-6 w-3/4 bg-slate-800 rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-32 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-6xl font-black mb-12 tracking-tight">
                        {title}
                    </h1>
                    <div 
                        className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed font-medium"
                        dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
                        dir="auto"
                    />
                </motion.div>
            </main>
        </div>
    );
}
