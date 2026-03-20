import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Landing Data...');

  const testimonials = [
    {
      author: 'Yousif Al-Hamed',
      role: 'CEO, Gulf Parts Corp',
      quote: 'Partivo transformed our multi-branch logistics from a nightmare into a streamlined machine.',
      authorAr: 'يوسف الحامد',
      roleAr: 'الرئيس التنفيذي، شركة قطع الخليج',
      quoteAr: 'حول بارتيفو لوجستيات فروعنا المتعددة من كابوس إلى آلة انسيابية.',
      order: 1,
    },
    {
      author: 'Marco Rossi',
      role: 'Operations Director, EuroAuto',
      quote: 'The real-time inventory sync saved us thousands in lost sales and overstocking errors.',
      authorAr: 'ماركو روسي',
      roleAr: 'مدير العمليات، أورو أوتو',
      quoteAr: 'وفر لنا مزامنة المخزون في الوقت الفعلي آلافاً من المبيعات المفقودة وأخطاء زيادة المخزون.',
      order: 2,
    },
    {
      author: 'Sarah Jenkins',
      role: 'Wholesale Manager, Apex Spares',
      quote: 'Finally, a platform that understands the complexity of automotive sub-numbering and fitment.',
      authorAr: 'سارة جينكينز',
      roleAr: 'مديرة الجملة، أيبكس سبيرز',
      quoteAr: 'خيراً، منصة تفهم تعقيدات الترقيم الفرعي والتركيب في قطاع السيارات.',
      order: 3,
    },
  ];

  for (const t of testimonials) {
    await prisma.landingTestimonial.create({ data: t });
  }

  const faqs = [
    {
      question: 'Is my data isolated from other tenants?',
      answer: 'Yes, Partivo uses high-fidelity tenant isolation. Your data is stored in logically separate schemas with dedicated access controls.',
      questionAr: 'هل بياناتي معزولة عن المستأجرين الآخرين؟',
      answerAr: 'نعم، يستخدم بارتيفو عزلاً عالي الدقة للمستأجرين. يتم تخزين بياناتك في مخططات منفصلة منطقياً مع ضوابط وصول مخصصة.',
      order: 1,
    },
    {
      question: 'Can I use my own domain?',
      answer: 'Absolutely. Pro and Enterprise plans support custom domains and SSL termination at the edge.',
      questionAr: 'هل يمكنني استخدام النطاق الخاص بي؟',
      answerAr: 'بالطبع. تدعم خطط Pro و Enterprise النطاقات المخصصة وإنهاء SSL عند الحافة.',
      order: 2,
    },
    {
      question: 'Does it support local tax regulations?',
      answer: 'Our engine is built for global compliance, supporting VAT, GST, and custom tax rules based on your jurisdiction.',
      questionAr: 'هل يدعم اللوائح الضريبية المحلية؟',
      answerAr: 'تم بناء نظامنا للامتثال العالمي، ويدعم ضريبة القيمة المضافة و GST والقواعد الضريبية المخصصة بناءً على ولايتك القضائية.',
      order: 3,
    },
  ];

  for (const f of faqs) {
    await prisma.landingFAQ.create({ data: f });
  }

  console.log('Seeding Completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
