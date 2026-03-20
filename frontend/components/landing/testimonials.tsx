"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Section } from "./section";
import { Quote } from "lucide-react";
import { useCMSTestimonials } from "@/lib/hooks/use-cms-content";

export const Testimonials = () => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  
  const { data: cmsTestimonials, isLoading } = useCMSTestimonials();

  const fallbackTestimonials = [
    {
      authorName: t("landing.testimonials.author1"),
      authorNameAr: t("landing.testimonials.author1"),
      role: t("landing.testimonials.role1"),
      roleAr: t("landing.testimonials.role1"),
      company: "Partivo Client",
      companyAr: "عميل بارتيفو",
      content: t("landing.testimonials.quote1"),
      contentAr: t("landing.testimonials.quote1"),
    },
    {
      authorName: t("landing.testimonials.author2"),
      authorNameAr: t("landing.testimonials.author2"),
      role: t("landing.testimonials.role2"),
      roleAr: t("landing.testimonials.role2"),
      company: "Fleet Manager",
      companyAr: "مدير أسطول",
      content: t("landing.testimonials.quote2"),
      contentAr: t("landing.testimonials.quote2"),
    },
    {
      authorName: t("landing.testimonials.author3"),
      authorNameAr: t("landing.testimonials.author3"),
      role: t("landing.testimonials.role3"),
      roleAr: t("landing.testimonials.role3"),
      company: "Retail Owner",
      companyAr: "صاحب متجر",
      content: t("landing.testimonials.quote3"),
      contentAr: t("landing.testimonials.quote3"),
    },
  ];

  const displayTestimonials = cmsTestimonials?.length > 0 ? cmsTestimonials : fallbackTestimonials;

  if (isLoading) {
    return (
      <Section id="testimonials" className="bg-slate-950">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-pulse">
            <div className="h-10 w-64 bg-slate-800 rounded-xl mx-auto mb-4" />
            <div className="h-6 w-96 bg-slate-800 rounded-lg mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-900 rounded-3xl animate-pulse" />
            ))}
        </div>
      </Section>
    );
  }

  return (
    <Section id="testimonials" className="bg-slate-950">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
          {t("landing.testimonials.title")}
        </h2>
        <p className="text-lg text-slate-400">
          {t("landing.testimonials.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {displayTestimonials.slice(0, 3).map((item: any, index: number) => {
          const author = isAr ? (item.authorNameAr || item.authorName) : item.authorName;
          const role = isAr ? (item.roleAr || item.role) : item.role;
          const company = isAr ? (item.companyAr || item.company) : item.company;
          const content = isAr ? (item.contentAr || item.content) : item.content;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 relative group hover:border-blue-500/30 transition-all duration-300"
            >
              <Quote className="w-10 h-10 text-blue-500/10 absolute top-6 right-6 rtl:right-auto rtl:left-6" />
              <p className="text-lg mb-8 relative z-10 italic text-slate-300 text-start rtl:text-right leading-relaxed" dir="auto">
                &quot;{content}&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                  {author[0]}
                </div>
                <div className="text-start rtl:text-right">
                  <h4 className="font-bold text-white text-lg leading-tight">
                    {author}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
                    {role} @ {company}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
};
