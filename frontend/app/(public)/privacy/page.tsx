'use client';

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Section } from "@/components/landing/section";
import { motion } from "framer-motion";
import { useCMSLegal } from "@/lib/hooks/use-cms-content";

export default function PrivacyPage() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const { data: legal, isLoading } = useCMSLegal('privacy');

  const title = isAr ? (legal?.titleAr || 'سياسة الخصوصية') : (legal?.titleEn || 'Privacy Policy');
  const content = isAr ? (legal?.contentAr || 'Content is being updated...') : (legal?.contentEn || 'Content is being updated...');

  if (isLoading) {
      return (
          <Section id="privacy" className="py-32 bg-slate-950 text-white min-h-screen">
              <div className="max-w-4xl mx-auto px-4 animate-pulse">
                  <div className="h-12 w-64 bg-slate-800 rounded-xl mb-12" />
                  <div className="space-y-6">
                      <div className="h-6 w-full bg-slate-800 rounded-lg" />
                      <div className="h-6 w-full bg-slate-800 rounded-lg" />
                      <div className="h-6 w-3/4 bg-slate-800 rounded-lg" />
                  </div>
              </div>
          </Section>
      );
  }

  return (
    <Section id="privacy" className="py-32 bg-slate-950 text-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-black mb-12 tracking-tight text-white leading-tight">
            {title}
          </h1>
          
          <div 
            className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed font-medium"
            dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
            dir="auto"
          />
        </motion.div>
      </div>
    </Section>
  );
}
