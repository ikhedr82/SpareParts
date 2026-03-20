"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Section } from "./section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";

export const Contact = () => {
  const { t } = useLanguage();

  return (
    <Section id="contact" className="bg-slate-900/50">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rtl:order-last"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white text-start rtl:text-right">
            {t("landing.contact.title")}
          </h2>
          <p className="text-lg text-slate-400 mb-10 text-start rtl:text-right">
            {t("landing.contact.subtitle")}
          </p>

          <div className="space-y-8">
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-lg shadow-blue-500/5">
                <Mail className="w-7 h-7" />
              </div>
              <div className="text-start rtl:text-right">
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">{t("landing.contact.email_label")}</p>
                <p className="text-xl font-bold text-white">sales@partivo.com</p>
              </div>
            </div>
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-lg shadow-blue-500/5">
                <Phone className="w-7 h-7" />
              </div>
              <div className="text-start rtl:text-right">
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">{t("landing.contact.sales_label")}</p>
                <p className="text-xl font-bold text-white">+1 (800) PARTIVO</p>
              </div>
            </div>
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-lg shadow-blue-500/5">
                <MapPin className="w-7 h-7" />
              </div>
              <div className="text-start rtl:text-right">
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">{t("landing.contact.hq_label")}</p>
                <p className="text-xl font-bold text-white">Dubai Silicon Oasis, UAE</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-8 md:p-12 rounded-[2.5rem] bg-white/5 border border-white/5 backdrop-blur-sm shadow-2xl"
        >
          <form className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300 uppercase tracking-widest block text-start rtl:text-right">{t("landing.contact.form_name")}</label>
              <Input placeholder="John Doe" className="h-14 rounded-2xl bg-slate-950 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50 transition-all text-start rtl:text-right" />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300 uppercase tracking-widest block text-start rtl:text-right">{t("landing.contact.form_email")}</label>
              <Input type="email" placeholder="john@company.com" className="h-14 rounded-2xl bg-slate-950 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50 transition-all text-start rtl:text-right" />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-300 uppercase tracking-widest block text-start rtl:text-right">{t("landing.contact.form_message")}</label>
              <textarea 
                className="w-full min-h-[160px] rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-start rtl:text-right"
                placeholder={t("landing.contact.form_message")}
              />
            </div>
            <Button size="lg" className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-lg shadow-blue-500/20">
              {t("landing.contact.form_submit")}
            </Button>
          </form>
        </motion.div>
      </div>
    </Section>
  );
};
