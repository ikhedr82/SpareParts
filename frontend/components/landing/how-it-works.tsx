"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Section } from "./section";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [1, 2, 3];

  return (
    <Section id="how-it-works" className="bg-slate-900/50">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
          {t("landing.how_it_works.title")}
        </h2>
        <p className="text-lg text-slate-400">
          {t("landing.how_it_works.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
        <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent z-0" />
        
        {steps.map((step, index) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="relative z-10 flex flex-col items-center text-center group"
          >
            <div className="w-24 h-24 rounded-3xl bg-slate-950 border border-white/10 text-blue-500 flex items-center justify-center text-3xl font-bold mb-8 shadow-2xl group-hover:border-blue-500/50 transition-all duration-300">
              {step}
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">
              {t(`landing.how_it_works.step${step}_title`)}
            </h3>
            <p className="text-slate-400 leading-relaxed">
              {t(`landing.how_it_works.step${step}_desc`)}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};
