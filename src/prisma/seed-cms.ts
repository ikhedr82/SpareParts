import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CMS content...');

  // 1. Landing Page Content (Hero, Features, etc.)
  const landingSections = [
    {
      key: 'hero',
      contentEn: {
        badge: 'Next-Gen Commerce Platform',
        title: 'Run Your Spare Parts Business Smarter',
        subtitle: 'All-in-one SaaS platform for spare parts dealers. Manage inventory, sales, logistics, and finance — from a single dashboard.',
        ctaStart: 'Start Free Trial',
        learnMore: 'Explore Features',
      },
      contentAr: {
        badge: 'منصة تجارة قطع الغيار للجيل القادم',
        title: 'أدر أعمال قطع الغيار بذكاء واحترافية',
        subtitle: 'منصة SaaS متكاملة لتجار قطع الغيار. أدر المخزون والمبيعات واللوجستيات والمالية — من لوحة تحكم موحدة.',
        ctaStart: 'ابدأ الفترة التجريبية',
        learnMore: 'استكشف المميزات',
      },
    },
    {
      key: 'features',
      contentEn: {
        title: 'Enterprise Capabilities',
        subtitle: 'Everything you need to scale your automotive commerce ecosystem.',
        items: [
          { key: 'inventory', title: 'Inventory Management', desc: 'Real-time stock tracking across branches with SKU management and low-stock alerts.' },
          { key: 'sales', title: 'Point of Sale', desc: 'Fast, accurate sales recording with automatic inventory deduction and invoice generation.' },
          { key: 'logistics', title: 'Logistics & Delivery', desc: 'Plan delivery trips, assign drivers, and track fulfillment in real time.' },
          { key: 'analytics', title: 'Analytics & Intelligence', desc: 'Revenue trends, top products, branch performance, and custom financial reports.' },
          { key: 'warehouse', title: 'Warehouse Operations', desc: 'Pick list management, packing workflows, and bin-level storage tracking.' },
          { key: 'finance', title: 'Financial Controls', desc: 'Automated invoicing, tax calculations, and multi-currency settlement logs.' },
        ],
      },
      contentAr: {
        title: 'قدرات المؤسسات',
        subtitle: 'كل ما تحتاجه لتوسيع نطاق نظام تجارة السيارات الخاص بك.',
        items: [
          { key: 'inventory', title: 'إدارة المخزون', desc: 'تتبع المخزون في الوقت الفعلي عبر الفروع مع إدارة SKU وتنبيهات نقص المخزون.' },
          { key: 'sales', title: 'نقطة البيع', desc: 'تسجيل مبيعات سريع ودقيق مع خصم تلقائي للمخزون وإنشاء الفواتير.' },
          { key: 'logistics', title: 'اللوجستيات والتوصيل', desc: 'تخطيط رحلات التوصيل وتعيين السائقين وتتبع التنفيذ في الوقت الفعلي.' },
          { key: 'analytics', title: 'التحليلات والذكاء', desc: 'اتجاهات الإيرادات وأفضل المنتجات وأداء الفروع والتقارير المالية المخصصة.' },
          { key: 'warehouse', title: 'عمليات المستودعات', desc: 'إدارة قوائم الالتقاط وسير عمل التعبئة وتتبع التخزين على مستوى الصناديق.' },
          { key: 'finance', title: 'الضوابط المالية', desc: 'فواتير مؤتمتة وحسابات ضرائب وسجلات تسوية متعددة العملات.' },
        ],
      },
    },
    {
      key: 'how-it-works',
      contentEn: {
        title: 'How Partivo Works',
        subtitle: 'Implementation is seamless, results are immediate.',
        steps: [
          { step: 1, title: 'Provision Your Node', desc: 'Deploy your dedicated SaaS instance with isolated resources.' },
          { step: 2, title: 'Import Your Catalog', desc: 'Sync your existing spare parts inventory and supplier lists.' },
          { step: 3, title: 'Scale Globally', desc: 'Manage unlimited branches and process transactions worldwide.' }
        ]
      },
      contentAr: {
        title: 'كيف يعمل بارتيفو',
        subtitle: 'التنفيذ سلس والنتائج فورية.',
        steps: [
          { step: 1, title: 'توفير نقطة الوصول', desc: 'قم بنشر مثيل SaaS المخصص الخاص بك مع موارد معزولة.' },
          { step: 2, title: 'استيراد الكتالوج', desc: 'قم بمزامنة مخزون قطع الغيار الحالي وقوائم الموردين.' },
          { step: 3, title: 'التوسع عالمياً', desc: 'أدر فروعاً غير محدودة وقم بمعالجة المعاملات في جميع أنحاء العالم.' }
        ]
      }
    }
  ];

  for (const section of landingSections) {
    await prisma.landingPageContent.upsert({
      where: { key: section.key },
      update: section,
      create: section,
    });
  }

  // 2. Testimonials
  const testimonials = [
    {
      author: 'Ahmed Mansour',
      role: 'CEO, AutoParts Global',
      company: 'AutoParts Global',
      quote: 'Partivo transformed our entire logistics chain. We reduced delivery times by 40% in just three months.',
      authorAr: 'أحمد منصور',
      roleAr: 'الرئيس التنفيذي، أوتو بارتس العالمية',
      companyAr: 'أوتو بارتس العالمية',
      quoteAr: 'لقد أحدث Partivo تحولاً جذرياً في سلسلة التوريد الخاصة بنا. لقد قللنا أوقات التسليم بنسبة 40% في ثلاثة أشهر فقط.',
      order: 1,
    },
    {
      author: 'Sarah Jenkins',
      role: 'Operations Lead, PartHub UK',
      company: 'PartHub UK',
      quote: 'The multi-currency support and real-time inventory tracking are game-changers for international dealers.',
      authorAr: 'سارة جينكينز',
      roleAr: 'مسؤولة العمليات، بارت هب المملكة المتحدة',
      companyAr: 'بارت هب المملكة المتحدة',
      quoteAr: 'دعم العملات المتعددة وتتبع المخزون في الوقت الفعلي هما أهم ميزتين للتجار الدوليين.',
      order: 2,
    },
    {
      author: 'Khalid Al-Fahied',
      role: 'Regional Manager, Desert Spares',
      company: 'Desert Spares',
      quote: 'Finally a platform that understands the Arabic market needs. The localization is perfect.',
      authorAr: 'خالد الفهيد',
      roleAr: 'المدير الإقليمي، ديزرت سبيرز',
      companyAr: 'ديزرت سبيرز',
      quoteAr: 'أخيراً هناك منصة تفهم احتياجات السوق العربي. التوطين مثالي.',
      order: 3,
    },
  ];

  for (const t of testimonials) {
    await prisma.landingTestimonial.create({
      data: t,
    });
  }

  // 3. FAQs
  const faqs = [
    {
      question: 'Is my data isolated from other tenants?',
      answer: 'Yes, Partivo utilizes a high-fidelity logical isolation strategy. Your data resides in a shared database but is filtered by a unique Tenant ID at the database level, ensuring absolute privacy.',
      questionAr: 'هل بياناتي معزولة عن المستأجرين الآخرين؟',
      answerAr: 'نعم، يستخدم Partivo استراتيجية عزل منطقي عالية الدقة. توجد بياناتك في قاعدة بيانات مشتركة ولكن يتم تصفيتها بواسطة معرف مستأجر فريد على مستوى قاعدة البيانات، مما يضمن الخصوصية المطلقة.',
      order: 1,
    },
    {
      question: 'Can I manage multiple branches in different countries?',
      answer: 'Absolutely. Partivo is built for global scale, supporting multi-currency, multi-language (RTL/LTR), and cross-border logistics management from a single dashboard.',
      questionAr: 'هل يمكنني إدارة فروع متعددة في دول مختلفة؟',
      answerAr: 'بالتأكيد. تم بناء Partivo للتوسع العالمي، حيث يدعم تعدد العملات، وتعدد اللغات (RTL/LTR)، وإدارة اللوجستيات عبر الحدود من لوحة تحكم واحدة.',
      order: 2,
    },
    {
      question: 'Do you provide API access for integration?',
      answer: 'Yes, we provide enterprise-grade API keys with full usage telemetry and status monitoring, allowing you to integrate Partivo with your existing ERP or mobile applications.',
      questionAr: 'هل توفرون وصولاً عبر الـ API للتكامل؟',
      answerAr: 'نعم، نحن نوفر مفاتيح API من فئة المؤسسات مع قياس استخدام كامل ومراقبة الحالة، مما يتيح لك ربط Partivo بأنظمة ERP الحالية أو تطبيقات الهاتف المحمول.',
      order: 3,
    },
  ];

  for (const f of faqs) {
    await prisma.landingFAQ.create({
      data: f,
    });
  }

  // 4. Legal Content
  const legalPages = [
    {
      type: 'privacy',
      titleEn: 'Privacy Policy',
      titleAr: 'سياسة الخصوصية',
      contentEn: '<h1>Privacy Policy</h1><p>Welcome to Partivo. We are committed to protecting your professional data...</p>',
      contentAr: '<h1>سياسة الخصوصية</h1><p>مرحباً بكم في بارتيفو. نحن ملتزمون بحماية بياناتكم المهنية...</p>',
    },
    {
      type: 'terms',
      titleEn: 'Terms and Conditions',
      titleAr: 'الشروط والأحكام',
      contentEn: '<h1>Terms and Conditions</h1><p>By using Partivo, you agree to the following terms of service...</p>',
      contentAr: '<h1>الشروط والأحكام</h1><p>باستخدام بارتيفو، فإنك توافق على شروط الخدمة التالية...</p>',
    },
  ];

  for (const lp of legalPages) {
    await prisma.legalContent.upsert({
      where: { type: lp.type },
      update: lp,
      create: lp,
    });
  }

  console.log('CMS Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
