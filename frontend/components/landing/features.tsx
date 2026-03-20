"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Section } from "./section";
import { 
  Package, 
  ShoppingCart, 
  Truck, 
  BarChart3, 
  Warehouse, 
  CreditCard,
} from "lucide-react";
import { motion } from "framer-motion";
import { useCMSContent } from "@/lib/hooks/use-cms-content";

const iconMap = {
  inventory: Package,
  sales: ShoppingCart,
  logistics: Truck,
  analytics: BarChart3,
  warehouse: Warehouse,
  finance: CreditCard,
};

export const Features = () => {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';
  const { data: cmsData, isLoading } = useCMSContent('features');

  const defaultFeatures = [
    { key: "inventory", icon: Package },
    { key: "sales", icon: ShoppingCart },
    { key: "logistics", icon: Truck },
    { key: "analytics", icon: BarChart3 },
    { key: "warehouse", icon: Warehouse },
    { key: "finance", icon: CreditCard },
  ];

  const content = isRtl ? cmsData?.contentAr : cmsData?.contentEn;
  const title = (isRtl ? cmsData?.titleAr : cmsData?.titleEn) || t("landing.features.title");
  const subtitle = content?.subtitle || t("landing.features.subtitle");
  const displayFeatures = content?.features?.length > 0 
    ? content.features.map((f: any, i: number) => ({
        ...f,
        icon: Object.values(iconMap)[i % Object.values(iconMap).length]
      }))
    : defaultFeatures.map(f => ({
        title: t(`landing.features.${f.key}_title`),
        description: t(`landing.features.${f.key}_desc`),
        icon: f.icon
      }));

  if (isLoading) {
    return (
      <Section id="features" className="bg-slate-950">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-pulse">
            <div className="h-10 w-64 bg-slate-800 rounded-xl mx-auto mb-4" />
            <div className="h-6 w-96 bg-slate-800 rounded-lg mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-900 rounded-3xl animate-pulse" />
            ))}
        </div>
      </Section>
    );
  }

  return (
    <Section id="features" className="bg-slate-950">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
          {title}
        </h2>
        <p className="text-lg text-slate-400">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayFeatures.map((feature: any, index: number) => {
          const Icon = feature.icon || Package;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-8 rounded-[2rem] border border-white/5 bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Icon className="w-7 h-7 text-blue-500 group-hover:text-inherit" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white text-start rtl:text-right">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed text-start rtl:text-right">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
};
