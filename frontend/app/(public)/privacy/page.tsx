'use client';

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Section } from "@/components/landing/section";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <Section id="privacy" className="py-32 bg-slate-950 text-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-black mb-12 tracking-tight text-white leading-tight">
            {t("landing.nav.privacy")}
          </h1>
          
          <div className="space-y-12 text-slate-400 leading-relaxed text-lg" dir="auto">
            <section>
              <h2 className="text-2xl font-bold text-blue-400 mb-4">{isAr ? "نظرة عامة" : "Overview"}</h2>
              <p>
                {isAr 
                  ? "تلتزم منصة بارتيفو (Partivo) بحماية خصوصيتك وضمان أمن بياناتك. توضح هذه السياسة كيفية جمعنا واستخدامنا وحماية بياناتك كتاجر أو مستخدم للمنصة."
                  : "Partivo Commerce Platform is committed to protecting your privacy and ensuring the security of your data. This policy outlines how we collect, use, and safeguard your data as a merchant or platform user."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-blue-400 mb-4">{isAr ? "البيانات التي نجمعها" : "Data We Collect"}</h2>
              <p>
                {isAr
                  ? "نجمع المعلومات اللازمة لتقديم خدمات السحابية لتجارة قطع الغيار، بما في ذلك بيانات الاتصال، معلومات التسجيل الضريبي، وبيانات المخزون والمبيعات."
                  : "We collect information necessary to provide cloud-based spare parts commerce services, including contact details, tax registration information, and inventory/sales data."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-blue-400 mb-4">{isAr ? "أمن البيانات وعزلها" : "Data Security & Isolation"}</h2>
              <p>
                {isAr
                  ? "يتم تخزين جميع بيانات المستأجرين في بيئات معزولة منطقياً لضمان عدم تداخل البيانات بين التجار. نستخدم تشفير SSL للبيانات أثناء الانتقال والتشفير للبيانات المخزنة."
                  : "All tenant data is stored in logically isolated environments to ensure no data crossover between merchants. We use SSL encryption for data in transit and AES encryption for data at rest."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-blue-400 mb-4">{isAr ? "الامتثال للقوانين" : "Legal Compliance"}</h2>
              <p>
                {isAr
                  ? "نلتزم بقوانين حماية البيانات في دولة الإمارات العربية المتحدة والمعايير الدولية (GDPR) لضمان أعلى مستويات الخصوصية لمستخدمينا."
                  : "We comply with UAE data protection laws and international standards (GDPR) to ensure the highest levels of privacy for our users."}
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
