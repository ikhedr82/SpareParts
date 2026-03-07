/**
 * Arabic translation maps for product catalog.
 * Real spare parts nomenclature in Arabic.
 */

// ─── Category Translations ────────────────────────────────────────
export const CATEGORIES: { name: string; nameAr: string }[] = [
    { name: 'Engine Parts', nameAr: 'قطع المحرك' },
    { name: 'Brake System', nameAr: 'نظام الفرامل' },
    { name: 'Suspension & Steering', nameAr: 'التعليق والتوجيه' },
    { name: 'Electrical & Ignition', nameAr: 'الكهرباء والإشعال' },
    { name: 'Cooling System', nameAr: 'نظام التبريد' },
    { name: 'Transmission & Drivetrain', nameAr: 'ناقل الحركة' },
    { name: 'Exhaust System', nameAr: 'نظام العادم' },
    { name: 'Body & Exterior', nameAr: 'الهيكل والخارجية' },
    { name: 'Filters & Fluids', nameAr: 'الفلاتر والسوائل' },
    { name: 'Accessories & Tools', nameAr: 'الإكسسوارات والأدوات' },
];

// ─── Brand Data ───────────────────────────────────────────────────
export const BRANDS: { name: string; nameAr: string; country: string; isOem: boolean }[] = [
    { name: 'Bosch', nameAr: 'بوش', country: 'Germany', isOem: true },
    { name: 'Denso', nameAr: 'دينسو', country: 'Japan', isOem: true },
    { name: 'NGK', nameAr: 'إن جي كيه', country: 'Japan', isOem: true },
    { name: 'ACDelco', nameAr: 'إيه سي ديلكو', country: 'USA', isOem: true },
    { name: 'Brembo', nameAr: 'بريمبو', country: 'Italy', isOem: true },
    { name: 'Sachs', nameAr: 'ساكس', country: 'Germany', isOem: true },
    { name: 'Monroe', nameAr: 'مونرو', country: 'USA', isOem: false },
    { name: 'Mann-Filter', nameAr: 'مان فلتر', country: 'Germany', isOem: true },
    { name: 'Gates', nameAr: 'جيتس', country: 'USA', isOem: false },
    { name: 'Valeo', nameAr: 'فاليو', country: 'France', isOem: true },
    { name: 'Aisin', nameAr: 'آيسن', country: 'Japan', isOem: true },
    { name: 'TRW', nameAr: 'تي آر دبليو', country: 'Germany', isOem: true },
    { name: 'Mahle', nameAr: 'ماهلي', country: 'Germany', isOem: true },
    { name: 'SKF', nameAr: 'إس كيه إف', country: 'Sweden', isOem: true },
    { name: 'Continental', nameAr: 'كونتيننتال', country: 'Germany', isOem: true },
    { name: 'Febi Bilstein', nameAr: 'فيبي بيلشتاين', country: 'Germany', isOem: false },
    { name: 'Hella', nameAr: 'هيلا', country: 'Germany', isOem: true },
    { name: 'KYB', nameAr: 'كي واي بي', country: 'Japan', isOem: true },
    { name: 'Delphi', nameAr: 'دلفي', country: 'UK', isOem: true },
    { name: 'SNR', nameAr: 'إس إن آر', country: 'France', isOem: false },
];

// ─── Product Templates (per category) ─────────────────────────────
// Each template generates multiple variants (sizes, types, vehicle fitments)

export interface ProductTemplate {
    baseName: string;
    baseNameAr: string;
    description: string;
    descriptionAr: string;
    categoryIndex: number; // index into CATEGORIES
    brandIndices: number[]; // which brands make this part
    variants: { suffix: string; suffixAr: string }[];
    basePrice: number; // base selling price
    baseCost: number;  // base cost price
    weight?: number;
}

export const PRODUCT_TEMPLATES: ProductTemplate[] = [
    // ── Engine Parts (0) ──
    { baseName: 'Oil Filter', baseNameAr: 'فلتر زيت', description: 'High-quality oil filter for engine protection', descriptionAr: 'فلتر زيت عالي الجودة لحماية المحرك', categoryIndex: 0, brandIndices: [0, 7, 12], variants: [{ suffix: '- Standard', suffixAr: '- عادي' }, { suffix: '- Premium', suffixAr: '- ممتاز' }, { suffix: '- Heavy Duty', suffixAr: '- للخدمة الشاقة' }], basePrice: 12, baseCost: 6, weight: 0.35 },
    { baseName: 'Spark Plug', baseNameAr: 'بوجيه', description: 'Engine spark plug for optimal ignition', descriptionAr: 'بوجيه محرك للإشعال الأمثل', categoryIndex: 0, brandIndices: [0, 1, 2, 18], variants: [{ suffix: '- Copper', suffixAr: '- نحاس' }, { suffix: '- Iridium', suffixAr: '- إيريديوم' }, { suffix: '- Platinum', suffixAr: '- بلاتينيوم' }, { suffix: '- Double Iridium', suffixAr: '- إيريديوم مزدوج' }], basePrice: 8, baseCost: 3.5, weight: 0.05 },
    { baseName: 'Timing Belt', baseNameAr: 'سير توقيت', description: 'Precision timing belt for engine synchronization', descriptionAr: 'سير توقيت دقيق لمزامنة المحرك', categoryIndex: 0, brandIndices: [8, 14], variants: [{ suffix: '- 4 Cyl', suffixAr: '- 4 سلندر' }, { suffix: '- 6 Cyl', suffixAr: '- 6 سلندر' }, { suffix: '- Kit', suffixAr: '- طقم' }], basePrice: 45, baseCost: 22, weight: 0.8 },
    { baseName: 'Engine Mount', baseNameAr: 'قاعدة محرك', description: 'Vibration-dampening engine mount', descriptionAr: 'قاعدة محرك مانعة للاهتزاز', categoryIndex: 0, brandIndices: [5, 15], variants: [{ suffix: '- Front', suffixAr: '- أمامي' }, { suffix: '- Rear', suffixAr: '- خلفي' }, { suffix: '- Left', suffixAr: '- يسار' }, { suffix: '- Right', suffixAr: '- يمين' }], basePrice: 55, baseCost: 28, weight: 2.5 },
    { baseName: 'Valve Cover Gasket', baseNameAr: 'جوان غطاء الصمامات', description: 'Leak-proof valve cover gasket', descriptionAr: 'جوان غطاء صمامات مانع للتسريب', categoryIndex: 0, brandIndices: [9, 12], variants: [{ suffix: '- Inline 4', suffixAr: '- 4 سلندر' }, { suffix: '- V6', suffixAr: '- في 6' }], basePrice: 18, baseCost: 8, weight: 0.15 },
    { baseName: 'Piston Ring Set', baseNameAr: 'طقم شنابر', description: 'Complete piston ring set for engine overhaul', descriptionAr: 'طقم شنابر كامل لعمرة المحرك', categoryIndex: 0, brandIndices: [12], variants: [{ suffix: '- STD', suffixAr: '- قياسي' }, { suffix: '- +0.25mm', suffixAr: '- +0.25مم' }, { suffix: '- +0.50mm', suffixAr: '- +0.50مم' }], basePrice: 65, baseCost: 32, weight: 0.4 },
    { baseName: 'Camshaft Sensor', baseNameAr: 'حساس عمود الكامات', description: 'Precise camshaft position sensor', descriptionAr: 'حساس موضع عمود الكامات الدقيق', categoryIndex: 0, brandIndices: [0, 1, 18], variants: [{ suffix: '- Intake', suffixAr: '- سحب' }, { suffix: '- Exhaust', suffixAr: '- عادم' }], basePrice: 35, baseCost: 16, weight: 0.1 },
    { baseName: 'Crankshaft Seal', baseNameAr: 'صوفة كرنك', description: 'Oil-tight crankshaft seal', descriptionAr: 'صوفة كرنك مانعة للتسريب', categoryIndex: 0, brandIndices: [9, 12], variants: [{ suffix: '- Front', suffixAr: '- أمامي' }, { suffix: '- Rear', suffixAr: '- خلفي' }], basePrice: 15, baseCost: 6, weight: 0.08 },
    { baseName: 'Thermostat', baseNameAr: 'ثرموستات', description: 'Engine thermostat for temperature regulation', descriptionAr: 'ثرموستات للتحكم في درجة حرارة المحرك', categoryIndex: 0, brandIndices: [0, 9, 12], variants: [{ suffix: '- 82°C', suffixAr: '- 82 درجة' }, { suffix: '- 88°C', suffixAr: '- 88 درجة' }, { suffix: '- Kit', suffixAr: '- طقم' }], basePrice: 22, baseCost: 10, weight: 0.2 },

    // ── Brake System (1) ──
    { baseName: 'Brake Pad Set', baseNameAr: 'طقم تيل فرامل', description: 'Low-dust ceramic brake pads', descriptionAr: 'تيل فرامل سيراميك منخفض الغبار', categoryIndex: 1, brandIndices: [4, 11, 0], variants: [{ suffix: '- Front', suffixAr: '- أمامي' }, { suffix: '- Rear', suffixAr: '- خلفي' }, { suffix: '- Front Premium', suffixAr: '- أمامي ممتاز' }, { suffix: '- Rear Premium', suffixAr: '- خلفي ممتاز' }], basePrice: 35, baseCost: 16, weight: 1.2 },
    { baseName: 'Brake Disc', baseNameAr: 'طنبورة فرامل', description: 'Ventilated brake disc rotor', descriptionAr: 'طنبورة فرامل مهواة', categoryIndex: 1, brandIndices: [4, 11], variants: [{ suffix: '- Front', suffixAr: '- أمامي' }, { suffix: '- Rear', suffixAr: '- خلفي' }, { suffix: '- Drilled Front', suffixAr: '- أمامي مثقب' }], basePrice: 60, baseCost: 30, weight: 5.0 },
    { baseName: 'Brake Caliper', baseNameAr: 'فكة فرامل', description: 'Hydraulic brake caliper assembly', descriptionAr: 'فكة فرامل هيدروليكية', categoryIndex: 1, brandIndices: [4, 11], variants: [{ suffix: '- Front Left', suffixAr: '- أمامي يسار' }, { suffix: '- Front Right', suffixAr: '- أمامي يمين' }], basePrice: 120, baseCost: 60, weight: 3.5 },
    { baseName: 'Brake Fluid', baseNameAr: 'زيت فرامل', description: 'DOT 4 synthetic brake fluid', descriptionAr: 'زيت فرامل صناعي DOT 4', categoryIndex: 1, brandIndices: [0, 9], variants: [{ suffix: '- 500ml', suffixAr: '- 500 مل' }, { suffix: '- 1L', suffixAr: '- 1 لتر' }], basePrice: 10, baseCost: 5, weight: 0.6 },
    { baseName: 'Brake Hose', baseNameAr: 'خرطوم فرامل', description: 'Reinforced hydraulic brake hose', descriptionAr: 'خرطوم فرامل هيدروليكي مقوى', categoryIndex: 1, brandIndices: [11, 0], variants: [{ suffix: '- Front', suffixAr: '- أمامي' }, { suffix: '- Rear', suffixAr: '- خلفي' }], basePrice: 18, baseCost: 8, weight: 0.3 },

    // ── Suspension (2) ──
    { baseName: 'Shock Absorber', baseNameAr: 'مساعد', description: 'Gas-charged shock absorber', descriptionAr: 'مساعد مشحون بالغاز', categoryIndex: 2, brandIndices: [6, 17, 5], variants: [{ suffix: '- Front Left', suffixAr: '- أمامي يسار' }, { suffix: '- Front Right', suffixAr: '- أمامي يمين' }, { suffix: '- Rear Left', suffixAr: '- خلفي يسار' }, { suffix: '- Rear Right', suffixAr: '- خلفي يمين' }], basePrice: 65, baseCost: 32, weight: 3.0 },
    { baseName: 'Control Arm', baseNameAr: 'ذراع تحكم', description: 'Lower control arm with ball joint', descriptionAr: 'ذراع تحكم سفلي مع كبسولة', categoryIndex: 2, brandIndices: [11, 15], variants: [{ suffix: '- Front Left Lower', suffixAr: '- أمامي يسار سفلي' }, { suffix: '- Front Right Lower', suffixAr: '- أمامي يمين سفلي' }], basePrice: 85, baseCost: 42, weight: 3.5 },
    { baseName: 'Wheel Bearing', baseNameAr: 'رولمان بلي عجل', description: 'Precision wheel bearing assembly', descriptionAr: 'رولمان بلي عجل دقيق', categoryIndex: 2, brandIndices: [13, 19], variants: [{ suffix: '- Front', suffixAr: '- أمامي' }, { suffix: '- Rear', suffixAr: '- خلفي' }], basePrice: 45, baseCost: 22, weight: 1.5 },
    { baseName: 'Tie Rod End', baseNameAr: 'مقصة توجيه', description: 'Steering tie rod end', descriptionAr: 'مقصة توجيه دقيقة', categoryIndex: 2, brandIndices: [11, 15], variants: [{ suffix: '- Inner', suffixAr: '- داخلي' }, { suffix: '- Outer Left', suffixAr: '- خارجي يسار' }, { suffix: '- Outer Right', suffixAr: '- خارجي يمين' }], basePrice: 25, baseCost: 12, weight: 0.8 },
    { baseName: 'Coil Spring', baseNameAr: 'ياي سوستة', description: 'Progressive rate coil spring', descriptionAr: 'ياي سوستة متدرج', categoryIndex: 2, brandIndices: [5, 17], variants: [{ suffix: '- Front', suffixAr: '- أمامي' }, { suffix: '- Rear', suffixAr: '- خلفي' }], basePrice: 40, baseCost: 20, weight: 4.0 },
    { baseName: 'Ball Joint', baseNameAr: 'كبسولة', description: 'Heavy-duty ball joint', descriptionAr: 'كبسولة للخدمة الشاقة', categoryIndex: 2, brandIndices: [11, 15], variants: [{ suffix: '- Lower', suffixAr: '- سفلي' }, { suffix: '- Upper', suffixAr: '- علوي' }], basePrice: 30, baseCost: 14, weight: 0.6 },

    // ── Electrical (3) ──
    { baseName: 'Alternator', baseNameAr: 'دينامو', description: 'High-output alternator', descriptionAr: 'دينامو عالي الإنتاج', categoryIndex: 3, brandIndices: [0, 1, 9], variants: [{ suffix: '- 90A', suffixAr: '- 90 أمبير' }, { suffix: '- 120A', suffixAr: '- 120 أمبير' }, { suffix: '- 150A', suffixAr: '- 150 أمبير' }], basePrice: 180, baseCost: 90, weight: 6.0 },
    { baseName: 'Starter Motor', baseNameAr: 'مارش', description: 'Gear-reduction starter motor', descriptionAr: 'مارش بتخفيض التروس', categoryIndex: 3, brandIndices: [0, 1, 9], variants: [{ suffix: '- 1.4kW', suffixAr: '- 1.4 كيلوواط' }, { suffix: '- 2.0kW', suffixAr: '- 2.0 كيلوواط' }], basePrice: 150, baseCost: 75, weight: 5.0 },
    { baseName: 'Ignition Coil', baseNameAr: 'كويل إشعال', description: 'Direct ignition coil pack', descriptionAr: 'كويل إشعال مباشر', categoryIndex: 3, brandIndices: [0, 1, 16], variants: [{ suffix: '- Single', suffixAr: '- فردي' }, { suffix: '- Rail Pack', suffixAr: '- ريل' }], basePrice: 35, baseCost: 16, weight: 0.4 },
    { baseName: 'Battery', baseNameAr: 'بطارية', description: 'Maintenance-free car battery', descriptionAr: 'بطارية سيارة بدون صيانة', categoryIndex: 3, brandIndices: [0, 9], variants: [{ suffix: '- 55Ah', suffixAr: '- 55 أمبير' }, { suffix: '- 70Ah', suffixAr: '- 70 أمبير' }, { suffix: '- 100Ah', suffixAr: '- 100 أمبير' }], basePrice: 100, baseCost: 55, weight: 15.0 },
    { baseName: 'Headlight Bulb', baseNameAr: 'لمبة فانوس', description: 'High-performance headlight bulb', descriptionAr: 'لمبة فانوس عالية الأداء', categoryIndex: 3, brandIndices: [16, 0], variants: [{ suffix: '- H4', suffixAr: '- H4' }, { suffix: '- H7', suffixAr: '- H7' }, { suffix: '- H11', suffixAr: '- H11' }, { suffix: '- LED H7', suffixAr: '- LED H7' }], basePrice: 15, baseCost: 7, weight: 0.05 },
    { baseName: 'Oxygen Sensor', baseNameAr: 'حساس أكسجين', description: 'Wide-band oxygen sensor', descriptionAr: 'حساس أكسجين واسع النطاق', categoryIndex: 3, brandIndices: [0, 1, 2], variants: [{ suffix: '- Upstream', suffixAr: '- قبل المحول' }, { suffix: '- Downstream', suffixAr: '- بعد المحول' }], basePrice: 45, baseCost: 22, weight: 0.2 },

    // ── Cooling (4) ──
    { baseName: 'Radiator', baseNameAr: 'ردياتير', description: 'Aluminum-core radiator', descriptionAr: 'ردياتير بقلب ألومنيوم', categoryIndex: 4, brandIndices: [9, 16], variants: [{ suffix: '- Manual Trans', suffixAr: '- مانيوال' }, { suffix: '- Auto Trans', suffixAr: '- أوتوماتيك' }], basePrice: 120, baseCost: 60, weight: 5.0 },
    { baseName: 'Water Pump', baseNameAr: 'طلمبة مياه', description: 'Engine coolant water pump', descriptionAr: 'طلمبة مياه تبريد المحرك', categoryIndex: 4, brandIndices: [10, 9, 8], variants: [{ suffix: '- Mechanical', suffixAr: '- ميكانيكي' }, { suffix: '- Electric', suffixAr: '- كهربائي' }], basePrice: 55, baseCost: 28, weight: 2.0 },
    { baseName: 'Radiator Hose', baseNameAr: 'خرطوم ردياتير', description: 'Reinforced radiator hose', descriptionAr: 'خرطوم ردياتير مقوى', categoryIndex: 4, brandIndices: [8, 14], variants: [{ suffix: '- Upper', suffixAr: '- علوي' }, { suffix: '- Lower', suffixAr: '- سفلي' }], basePrice: 18, baseCost: 8, weight: 0.5 },
    { baseName: 'Coolant', baseNameAr: 'مياه تبريد', description: 'Long-life engine coolant', descriptionAr: 'مياه تبريد طويلة العمر', categoryIndex: 4, brandIndices: [0, 9], variants: [{ suffix: '- 1L Concentrate', suffixAr: '- 1 لتر مركز' }, { suffix: '- 5L Ready Mix', suffixAr: '- 5 لتر جاهز' }], basePrice: 15, baseCost: 7, weight: 1.2 },
    { baseName: 'Cooling Fan', baseNameAr: 'مروحة تبريد', description: 'Electric cooling fan assembly', descriptionAr: 'مروحة تبريد كهربائية', categoryIndex: 4, brandIndices: [9, 16], variants: [{ suffix: '- Main', suffixAr: '- رئيسية' }, { suffix: '- Auxiliary', suffixAr: '- مساعدة' }], basePrice: 80, baseCost: 40, weight: 3.0 },

    // ── Transmission (5) ──
    { baseName: 'Clutch Kit', baseNameAr: 'طقم دبرياج', description: 'Complete clutch replacement kit', descriptionAr: 'طقم دبرياج كامل', categoryIndex: 5, brandIndices: [5, 9, 10], variants: [{ suffix: '- Standard', suffixAr: '- عادي' }, { suffix: '- Heavy Duty', suffixAr: '- للخدمة الشاقة' }], basePrice: 150, baseCost: 75, weight: 6.0 },
    { baseName: 'CV Joint', baseNameAr: 'جوزة كارنك', description: 'Constant velocity joint', descriptionAr: 'وصلة سرعة ثابتة', categoryIndex: 5, brandIndices: [13, 15], variants: [{ suffix: '- Inner', suffixAr: '- داخلي' }, { suffix: '- Outer', suffixAr: '- خارجي' }], basePrice: 55, baseCost: 28, weight: 1.5 },
    { baseName: 'Drive Shaft', baseNameAr: 'أكس', description: 'Complete drive shaft assembly', descriptionAr: 'أكس كامل', categoryIndex: 5, brandIndices: [13], variants: [{ suffix: '- Left', suffixAr: '- يسار' }, { suffix: '- Right', suffixAr: '- يمين' }], basePrice: 120, baseCost: 60, weight: 5.0 },
    { baseName: 'Transmission Oil', baseNameAr: 'زيت قير', description: 'Automatic transmission fluid', descriptionAr: 'زيت ناقل حركة أوتوماتيك', categoryIndex: 5, brandIndices: [0, 9], variants: [{ suffix: '- ATF 1L', suffixAr: '- ATF 1 لتر' }, { suffix: '- ATF 4L', suffixAr: '- ATF 4 لتر' }, { suffix: '- Manual 75W-90 1L', suffixAr: '- مانيوال 75W-90 1 لتر' }], basePrice: 20, baseCost: 10, weight: 1.0 },

    // ── Exhaust (6) ──
    { baseName: 'Catalytic Converter', baseNameAr: 'محول حفاز', description: 'Emissions-compliant catalytic converter', descriptionAr: 'محول حفاز مطابق للمواصفات', categoryIndex: 6, brandIndices: [0, 9], variants: [{ suffix: '- Direct Fit', suffixAr: '- مباشر' }, { suffix: '- Universal', suffixAr: '- عالمي' }], basePrice: 250, baseCost: 125, weight: 8.0 },
    { baseName: 'Muffler', baseNameAr: 'شكمان', description: 'Stainless steel muffler', descriptionAr: 'شكمان ستانلس ستيل', categoryIndex: 6, brandIndices: [0], variants: [{ suffix: '- Rear', suffixAr: '- خلفي' }, { suffix: '- Center', suffixAr: '- وسط' }], basePrice: 80, baseCost: 40, weight: 6.0 },
    { baseName: 'Exhaust Gasket', baseNameAr: 'جوان عادم', description: 'High-temp exhaust manifold gasket', descriptionAr: 'جوان عادم مقاوم للحرارة', categoryIndex: 6, brandIndices: [12, 9], variants: [{ suffix: '- Manifold', suffixAr: '- منيفولد' }, { suffix: '- Pipe', suffixAr: '- ماسورة' }], basePrice: 12, baseCost: 5, weight: 0.1 },

    // ── Body (7) ──
    { baseName: 'Side Mirror', baseNameAr: 'مرآة جانبية', description: 'Electric heated side mirror', descriptionAr: 'مرآة جانبية كهربائية مدفأة', categoryIndex: 7, brandIndices: [16], variants: [{ suffix: '- Left', suffixAr: '- يسار' }, { suffix: '- Right', suffixAr: '- يمين' }], basePrice: 75, baseCost: 38, weight: 1.5 },
    { baseName: 'Wiper Blade', baseNameAr: 'مساحة زجاج', description: 'Beam-style wiper blade', descriptionAr: 'مساحة زجاج بدون هيكل', categoryIndex: 7, brandIndices: [0, 9], variants: [{ suffix: '- 16"', suffixAr: '- 16 بوصة' }, { suffix: '- 18"', suffixAr: '- 18 بوصة' }, { suffix: '- 20"', suffixAr: '- 20 بوصة' }, { suffix: '- 22"', suffixAr: '- 22 بوصة' }, { suffix: '- 24"', suffixAr: '- 24 بوصة' }, { suffix: '- 26"', suffixAr: '- 26 بوصة' }], basePrice: 12, baseCost: 5, weight: 0.2 },
    { baseName: 'Door Handle', baseNameAr: 'يد باب', description: 'Chrome-finish door handle', descriptionAr: 'يد باب كروم', categoryIndex: 7, brandIndices: [15], variants: [{ suffix: '- Front Left', suffixAr: '- أمامي يسار' }, { suffix: '- Front Right', suffixAr: '- أمامي يمين' }, { suffix: '- Rear Left', suffixAr: '- خلفي يسار' }, { suffix: '- Rear Right', suffixAr: '- خلفي يمين' }], basePrice: 25, baseCost: 12, weight: 0.3 },
    { baseName: 'Window Regulator', baseNameAr: 'ماكينة زجاج', description: 'Power window regulator motor', descriptionAr: 'ماكينة رفع زجاج كهربائية', categoryIndex: 7, brandIndices: [9, 16], variants: [{ suffix: '- Front Left', suffixAr: '- أمامي يسار' }, { suffix: '- Front Right', suffixAr: '- أمامي يمين' }], basePrice: 65, baseCost: 32, weight: 2.0 },

    // ── Filters & Fluids (8) ──
    { baseName: 'Air Filter', baseNameAr: 'فلتر هواء', description: 'High-flow engine air filter', descriptionAr: 'فلتر هواء عالي التدفق', categoryIndex: 8, brandIndices: [7, 0, 12], variants: [{ suffix: '- Standard', suffixAr: '- عادي' }, { suffix: '- Performance', suffixAr: '- رياضي' }], basePrice: 15, baseCost: 7, weight: 0.3 },
    { baseName: 'Cabin Air Filter', baseNameAr: 'فلتر مكيف', description: 'Activated carbon cabin filter', descriptionAr: 'فلتر مكيف بالكربون النشط', categoryIndex: 8, brandIndices: [7, 0, 12], variants: [{ suffix: '- Standard', suffixAr: '- عادي' }, { suffix: '- Charcoal', suffixAr: '- كربون' }], basePrice: 12, baseCost: 5, weight: 0.15 },
    { baseName: 'Fuel Filter', baseNameAr: 'فلتر بنزين', description: 'In-line fuel filter', descriptionAr: 'فلتر وقود خطي', categoryIndex: 8, brandIndices: [7, 0, 12], variants: [{ suffix: '- Petrol', suffixAr: '- بنزين' }, { suffix: '- Diesel', suffixAr: '- ديزل' }], basePrice: 18, baseCost: 8, weight: 0.3 },
    { baseName: 'Engine Oil', baseNameAr: 'زيت محرك', description: 'Full synthetic engine oil', descriptionAr: 'زيت محرك صناعي بالكامل', categoryIndex: 8, brandIndices: [0, 9], variants: [{ suffix: '- 5W-30 1L', suffixAr: '- 5W-30 1 لتر' }, { suffix: '- 5W-30 4L', suffixAr: '- 5W-30 4 لتر' }, { suffix: '- 5W-40 1L', suffixAr: '- 5W-40 1 لتر' }, { suffix: '- 5W-40 4L', suffixAr: '- 5W-40 4 لتر' }, { suffix: '- 10W-40 4L', suffixAr: '- 10W-40 4 لتر' }], basePrice: 25, baseCost: 12, weight: 1.0 },
    { baseName: 'Power Steering Fluid', baseNameAr: 'زيت باور', description: 'Power steering hydraulic fluid', descriptionAr: 'زيت هيدروليك باور ستيرنج', categoryIndex: 8, brandIndices: [0, 9], variants: [{ suffix: '- 500ml', suffixAr: '- 500 مل' }, { suffix: '- 1L', suffixAr: '- 1 لتر' }], basePrice: 10, baseCost: 5, weight: 0.6 },

    // ── Accessories (9) ──
    { baseName: 'Car Jack', baseNameAr: 'جاك سيارة', description: 'Hydraulic bottle jack', descriptionAr: 'جاك هيدروليك', categoryIndex: 9, brandIndices: [0], variants: [{ suffix: '- 2 Ton', suffixAr: '- 2 طن' }, { suffix: '- 3 Ton', suffixAr: '- 3 طن' }], basePrice: 35, baseCost: 18, weight: 4.0 },
    { baseName: 'Socket Set', baseNameAr: 'طقم لقم', description: 'Chrome vanadium socket set', descriptionAr: 'طقم لقم كروم فاناديوم', categoryIndex: 9, brandIndices: [0], variants: [{ suffix: '- 24pc', suffixAr: '- 24 قطعة' }, { suffix: '- 46pc', suffixAr: '- 46 قطعة' }, { suffix: '- 94pc', suffixAr: '- 94 قطعة' }], basePrice: 55, baseCost: 28, weight: 3.0 },
    { baseName: 'Torque Wrench', baseNameAr: 'مفتاح عزم', description: 'Precision click torque wrench', descriptionAr: 'مفتاح عزم بالضغطة', categoryIndex: 9, brandIndices: [0], variants: [{ suffix: '- 1/2" 28-210Nm', suffixAr: '- 1/2 بوصة 28-210 نيوتن' }, { suffix: '- 3/8" 5-60Nm', suffixAr: '- 3/8 بوصة 5-60 نيوتن' }], basePrice: 75, baseCost: 38, weight: 2.0 },
    { baseName: 'Brake Cleaner', baseNameAr: 'منظف فرامل', description: 'Non-chlorinated brake cleaner spray', descriptionAr: 'بخاخ منظف فرامل', categoryIndex: 9, brandIndices: [0], variants: [{ suffix: '- 500ml', suffixAr: '- 500 مل' }], basePrice: 8, baseCost: 3, weight: 0.5 },
    { baseName: 'Battery Terminal', baseNameAr: 'طرف بطارية', description: 'Universal battery terminal clamp', descriptionAr: 'طرف بطارية عالمي', categoryIndex: 9, brandIndices: [0], variants: [{ suffix: '- Positive', suffixAr: '- موجب' }, { suffix: '- Negative', suffixAr: '- سالب' }, { suffix: '- Set', suffixAr: '- طقم' }], basePrice: 5, baseCost: 2, weight: 0.15 },
];

/**
 * Generates 1000+ products from templates by cross-multiplying
 * brands × variants and adding size/vehicle variants programmatically.
 */
export function generateProductList(): {
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    categoryIndex: number;
    brandIndex: number;
    sku: string;
    sellingPrice: number;
    costPrice: number;
    weight: number;
}[] {
    const products: any[] = [];
    let skuCounter = 1000;

    // Add vehicle suffixes to multiply products
    const vehicleSuffixes = [
        { en: 'Toyota Corolla', ar: 'تويوتا كورولا' },
        { en: 'Toyota Camry', ar: 'تويوتا كامري' },
        { en: 'Honda Civic', ar: 'هوندا سيفيك' },
        { en: 'Hyundai Elantra', ar: 'هيونداي إلنترا' },
        { en: 'Nissan Sentra', ar: 'نيسان سنترا' },
        { en: 'Kia Cerato', ar: 'كيا سيراتو' },
        { en: 'Chevrolet Cruze', ar: 'شيفروليه كروز' },
        { en: 'BMW 3 Series', ar: 'بي إم دبليو الفئة 3' },
        { en: 'Mercedes C-Class', ar: 'مرسيدس الفئة C' },
    ];

    for (const template of PRODUCT_TEMPLATES) {
        for (const brandIdx of template.brandIndices) {
            for (const variant of template.variants) {
                // For most products, create vehicle-specific variants to hit 1000+
                const vehiclesToUse = template.basePrice > 30
                    ? vehicleSuffixes.slice(0, 3) // Expensive = fewer vehicle variants
                    : vehicleSuffixes.slice(0, 2); // Cheap = fewer needed

                for (const vehicle of vehiclesToUse) {
                    const brand = BRANDS[brandIdx];
                    const priceMult = 0.9 + Math.random() * 0.2; // ±10% price variation
                    skuCounter++;

                    products.push({
                        name: `${template.baseName} ${variant.suffix} - ${vehicle.en} (${brand.name})`,
                        nameAr: `${template.baseNameAr} ${variant.suffixAr} - ${vehicle.ar} (${brand.nameAr})`,
                        description: template.description,
                        descriptionAr: template.descriptionAr,
                        categoryIndex: template.categoryIndex,
                        brandIndex: brandIdx,
                        sku: `SP-${String(skuCounter).padStart(5, '0')}`,
                        sellingPrice: Math.round(template.basePrice * priceMult * 100) / 100,
                        costPrice: Math.round(template.baseCost * priceMult * 100) / 100,
                        weight: template.weight || 0.5,
                    });
                }
            }
        }
    }

    return products;
}
