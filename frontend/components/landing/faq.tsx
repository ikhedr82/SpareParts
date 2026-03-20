"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Section } from "./section";
import { Plus, Minus } from "lucide-react";
import { useCMSFAQs } from "@/lib/hooks/use-cms-content";

export const FAQ = () => {
  const { t, language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const isAr = language === 'ar';
  
  const { data: cmsFAQs, isLoading } = useCMSFAQs();

  const fallbackFAQs = [
    {
      question: t("landing.faq.q1"),
      questionAr: t("landing.faq.q1"),
      answer: t("landing.faq.a1"),
      answerAr: t("landing.faq.a1"),
    },
    {
      question: t("landing.faq.q2"),
      questionAr: t("landing.faq.q2"),
      answer: t("landing.faq.a2"),
      answerAr: t("landing.faq.a2"),
    },
    {
      question: t("landing.faq.q3"),
      questionAr: t("landing.faq.q3"),
      answer: t("landing.faq.a3"),
      answerAr: t("landing.faq.a3"),
    },
  ];

  const currentFAQs = cmsFAQs?.length > 0 ? cmsFAQs : fallbackFAQs;

  if (isLoading) {
    return (
      <Section id="faq" className="bg-slate-950">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-pulse">
            <div className="h-10 w-64 bg-slate-800 rounded-xl mx-auto mb-4" />
            <div className="h-6 w-96 bg-slate-800 rounded-lg mx-auto" />
        </div>
        <div className="max-w-3xl mx-auto space-y-4 px-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-900 rounded-2xl animate-pulse" />
            ))}
        </div>
      </Section>
    );
  }

  return (
    <Section id="faq" className="bg-slate-950">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
          {t("landing.faq.title")}
        </h2>
        <p className="text-lg text-slate-400">
          {t("landing.faq.subtitle")}
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4 px-4">
        {currentFAQs.map((faq: any, i: number) => (
          <div 
            key={i}
            className="group border border-white/5 bg-slate-900/50 rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-500/30"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full py-6 px-8 flex items-center justify-between text-left rtl:text-right"
            >
              <span className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">
                {isAr ? (faq.questionAr || faq.question) : faq.question}
              </span>
              <div className="flex-shrink-0 ml-4 rtl:ml-0 rtl:mr-4 text-blue-500 bg-blue-500/5 p-2 rounded-xl">
                {openIndex === i ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
            </button>

            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-8 pb-6 text-slate-400 text-lg leading-relaxed pt-2 border-t border-white/5" dir="auto">
                    {isAr ? (faq.answerAr || faq.answer) : faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </Section>
  );
};
