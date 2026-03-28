"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Section } from "./section";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Typewriter } from "./typewriter";
import { useCMSContent } from "@/lib/hooks/use-cms-content";

export const Hero = () => {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';
  const { data: cmsData, isLoading } = useCMSContent('hero');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] as const },
    },
  };

  // Fallback data
  const content = isRtl ? cmsData?.contentAr : cmsData?.contentEn;
  const title = (isRtl ? cmsData?.titleAr : cmsData?.titleEn) || t("landing.hero.title_line1");
  const badge = content?.badge || t("landing.hero.badge");
  const subtitle = content?.subtitle || t("landing.hero.subtitle");
  const ctaStart = content?.ctaStart || t("landing.hero.cta_start");
  const learnMore = content?.learnMore || t("landing.hero.learn_more");

  if (isLoading) {
    return (
      <Section id="hero" className="pt-32 pb-20 md:pt-48 md:pb-32 bg-slate-950 overflow-hidden">
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 animate-pulse">
          <div className="h-8 w-32 bg-slate-800 rounded-full mx-auto mb-8" />
          <div className="h-20 bg-slate-800 rounded-3xl mb-8" />
          <div className="h-24 bg-slate-800 rounded-3xl mb-12 max-w-2xl mx-auto" />
          <div className="flex gap-4 justify-center">
            <div className="h-14 w-40 bg-slate-800 rounded-xl" />
            <div className="h-14 w-40 bg-slate-800 rounded-xl" />
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section id="hero" className="pt-32 pb-20 md:pt-48 md:pb-32 bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <span className="inline-block px-4 py-1.5 mb-8 text-sm font-medium tracking-wider text-blue-400 uppercase bg-blue-400/10 rounded-full border border-blue-400/20">
              {badge}
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className={cn(
              "text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8",
              isRtl ? "leading-[1.4]" : "leading-tight"
            )}
          >
            {title}{" "}
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              {language === 'en' ? (
                <>
                  <Typewriter words={["Smarter", "Faster", "Easier", "Better"]} className="text-blue-400" />
                </>
              ) : (
                <Typewriter words={["بذكاء", "بسرعة", "بسهولة", "باحترافية"]} className="text-blue-400" />
              )}
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed" 
            dir="auto"
          >
            {subtitle.split("SaaS").map((part: string, i: number, arr: string[]) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && <span dir="ltr" className="font-bold text-blue-400 mx-1">SaaS</span>}
              </React.Fragment>
            ))}
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Button asChild size="lg" className="w-full sm:w-auto text-lg h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 font-bold">
              <Link href="/signup">{ctaStart}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-10 border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent backdrop-blur-sm transition-all hover:border-white/40 font-bold">
              <a href="#features">{learnMore}</a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
};
