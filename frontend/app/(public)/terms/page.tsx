'use client';

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Section } from "@/components/landing/section";
import { motion } from "framer-motion";

export default function TermsPage() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <Section id="terms" className="py-32 bg-slate-950 text-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-black mb-12 tracking-tight text-white leading-tight">
            {t("landing.nav.terms")}
          </h1>
          
          <div className="space-y-12 text-slate-400 leading-relaxed text-lg" dir="auto">
            <section>
              <h2 className="text-2xl font-bold text-blue-400 mb-4">{isAr ? "قبول الشروط" : "Acceptance of Terms"}</h2>
              <p>
                {isAr 
                  ? "باستخدامك لمنصة بارتيفو، فإنك توافق على الالتزام بهذه الشروط والأحكام. تم تصميم المنصة لخدمة تجار قطع غيار السيارات بالجملة والتجزئة."
                  : "By using the Partivo platform, you agree to be bound by these Terms & Conditions. The platform is designed to serve wholesale and retail automotive spare parts dealers."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-blue-400 mb-4">{isAr ? "مسؤوليات المستأجر" : "Tenant Responsibilities"}</h2>
              <p>
                {isAr
                  ? "يتحمل التاجر (المستأجر) المسؤولية الكاملة عن دقة بيانات المخزون، توافقية قطع الغيار، والأسعار المدخلة في النظام. المنصة هي أداة لإدارة العمليات ولا تضمن دقة البيانات المدخلة يدوياً."
                  : "The Merchant (Tenant) bears full responsibility for the accuracy of inventory data, spare parts compatibility (fitment), and pricing entered into the system. The platform is an operational tool and does not guarantee the accuracy of manually entered records."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-blue-400 mb-4">{isAr ? "الملكية الفكرية" : "Intellectual Property"}</h2>
              <p>
                {isAr
                  ? "تظل المنصة وبنيتها البرمجية ملكية حصرية لبارتيفو. يمتلك المستأجر جميع البيانات التجارية والبيانات الخاصة بالعملاء التي يتم إنشاؤها عبر المنصة."
                  : "The platform and its software architecture remain the exclusive property of Partivo. The Tenant owns all commercial data and customer data generated through the platform."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-blue-400 mb-4">{isAr ? "حدود المسؤولية" : "Limitation of Liability"}</h2>
              <p>
                {isAr
                  ? "لا تتحمل بارتيفو مسؤولية أي خسائر تجارية ناتجة عن أخطاء في تركيب قطع الغيار أو انقطاع الخدمة خارج نطاق اتفاقية مستوى الخدمة (SLA)."
                  : "Partivo is not liable for any commercial losses resulting from incorrect spare parts fitment or service interruptions outside the scope of our Service Level Agreement (SLA)."}
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
