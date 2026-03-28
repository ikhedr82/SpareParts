"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Section } from "./section";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  isPopular?: boolean;
}

export const Pricing = () => {
  const { t } = useLanguage();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get("/api/public/plans");
        setPlans(response.data);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const safeFeatures = (features: any): string[] => {
    if (Array.isArray(features)) return features;
    if (typeof features === 'object' && features !== null) {
      return Object.entries(features)
        .filter(([, v]) => v === true || typeof v === 'string')
        .map(([k, v]) => typeof v === 'string' ? v : k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1'));
    }
    return [];
  };

  if (loading) {
    return (
      <Section id="pricing" className="bg-slate-950">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Section>
    );
  }

  if (plans.length === 0) return null;

  return (
    <Section id="pricing" className="bg-slate-950">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
          {t("landing.pricing.title")}
        </h2>
        <p className="text-lg text-slate-400">
          {t("landing.pricing.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className={cn(
              "relative p-8 rounded-[2rem] border transition-all duration-500 flex flex-col h-full group",
              plan.isPopular 
                ? "bg-gradient-to-b from-blue-600 to-indigo-700 border-blue-400 shadow-[0_20px_50px_rgba(59,130,246,0.3)] scale-105 z-10" 
                : "bg-white/5 border-white/5 hover:border-blue-500/50"
            )}
          >
            {plan.isPopular && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-white text-blue-600 text-xs font-black rounded-full shadow-xl tracking-widest whitespace-nowrap">
                {t("landing.pricing.popular").toUpperCase()}
              </div>
            )}
            
            <div className="mb-10 text-start rtl:text-right">
              <h3 className={cn(
                "text-2xl font-black mb-4 tracking-tight",
                plan.isPopular ? "text-white" : "text-white"
              )}>
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">
                  {typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price}
                </span>
                <span className={cn(
                  "text-base font-medium",
                  plan.isPopular ? "text-blue-100" : "text-slate-500"
                )}>
                  {plan.currency}/{t("landing.pricing.per_month")}
                </span>
              </div>
            </div>

            <ul className="space-y-5 mb-12 flex-grow">
              {safeFeatures(plan.features).map((feature, i) => (
                <li key={i} className="flex items-start gap-4 text-start rtl:text-right">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    plan.isPopular ? "bg-white/20 text-white" : "bg-blue-500/10 text-blue-500"
                  )}>
                    <Check className="w-4 h-4" />
                  </div>
                  <span
                    className={cn(
                      "text-base font-medium leading-tight",
                      plan.isPopular ? "text-blue-50" : "text-slate-300"
                    )}
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              className={cn(
                "w-full h-14 rounded-2xl text-lg font-black transition-all mt-auto shadow-lg",
                plan.isPopular 
                  ? "bg-white text-blue-600 hover:bg-slate-100 shadow-white/10" 
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20"
              )}
            >
              <Link href="/signup">{t("landing.pricing.cta")}</Link>
            </Button>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};
