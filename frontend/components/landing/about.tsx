"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Section } from "./section";

export const About = () => {
  const { t } = useLanguage();

  const stats = [
    { value: t("landing.about.stat1_value"), label: t("landing.about.stat1_label") },
    { value: t("landing.about.stat2_value"), label: t("landing.about.stat2_label") },
    { value: t("landing.about.stat3_value"), label: t("landing.about.stat3_label") },
  ];

  return (
    <Section id="about" className="bg-slate-900 overflow-hidden relative">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-3xl -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rtl:order-last"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">
            {t("landing.about.title")}
          </h2>
          <p className="text-xl text-blue-400 font-semibold mb-6">
            {t("landing.about.subtitle")}
          </p>
          <p className="text-slate-400 text-lg leading-relaxed mb-10" dir="auto">
            {t("landing.about.content")}
          </p>

          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative aspect-square lg:aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
        >
          {/* Placeholder for a high-quality brand image/video */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-emerald-600/20" />
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center rotate-12">
                <div className="w-10 h-10 border-4 border-white/20 rounded-lg animate-pulse" />
              </div>
              <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">Partivo Ecosystem Matrix</p>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
};
