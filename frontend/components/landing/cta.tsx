"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Section } from "./section";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useCMSContent } from "@/lib/hooks/use-cms-content";
import Link from "next/link";

export const CTA = () => {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';
  
  const { data: cmsData, isLoading } = useCMSContent('cta');

  const content = isRtl ? cmsData?.contentAr : cmsData?.contentEn;
  const title = (isRtl ? cmsData?.titleAr : cmsData?.titleEn) || t("landing.cta.title");
  const subtitle = content?.subtitle || t("landing.cta.subtitle");
  const btnPrimary = content?.buttonText || t("landing.cta.cta_start");
  const btnSecondary = content?.buttonSecondary || t("landing.cta.cta_login");

  if (isLoading) {
    return (
      <Section id="cta" className="py-20 md:py-32 bg-blue-600 dark:bg-blue-700">
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 animate-pulse">
          <div className="h-16 bg-blue-500/50 rounded-3xl mb-8" />
          <div className="h-8 w-64 bg-blue-500/50 rounded-xl mx-auto mb-12" />
          <div className="flex gap-4 justify-center">
            <div className="h-16 w-48 bg-blue-500/50 rounded-2xl" />
            <div className="h-16 w-48 bg-blue-500/50 rounded-2xl" />
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section id="cta" className="py-20 md:py-32 bg-blue-600 dark:bg-blue-700 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_30%,#ffffff_0%,transparent_50%)]" />
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-black mb-8 tracking-tight text-white leading-tight">
            {title}
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-2xl mx-auto font-medium opacity-90">
            {subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button asChild size="lg" className="w-full sm:w-auto text-xl h-16 px-10 bg-white text-blue-600 hover:bg-blue-50 font-black rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95">
              <Link href="/signup">{btnPrimary}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto text-xl h-16 px-10 border-white text-white hover:bg-white/10 font-black rounded-2xl transition-all hover:scale-105 active:scale-95 backdrop-blur-sm bg-transparent">
              <Link href="/login">{btnSecondary}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </Section>
  );
};
