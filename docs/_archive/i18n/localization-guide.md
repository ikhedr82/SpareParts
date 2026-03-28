# Native Arabic Localization & UX Copywriting Guide

## 1. Vision & Core Philosophy

The Partivo platform must feel **originally built in Arabic**. The translation should never feel robotic, overly formal, or literal. 

We utilize a **Hybrid Arabic Style**:
- **Base:** Modern Standard Arabic (MSA / Fusha) for structural correctness.
- **Tone:** Friendly, clear, and natural.
- **Influence:** Familiar to Egyptian users while remaining professional and respectful enough for Gulf (GCC) businesses.

### Avoid at all costs:
- Robotic, literal word-by-word translations.
- Overly formal or archaic Arabic terminology.
- Inconsistent wording for the same business concepts.

---

## 2. Terminology Dictionary

This unified glossary ensures consistency across the entire SaaS platform.

| English Concept | Approved Arabic Translation | Notes |
|-----------------|-----------------------------|-------|
| Dashboard | لوحة التحكم | Industry standard, clear |
| Tenant | الشركة / الحساب | Avoid literal "مستأجر", use context |
| Subscription | الاشتراك | Standard |
| Plan | الباقة | Better than "الخطة" for pricing |
| Invoice | الفاتورة | Standard |
| Customer | العميل | Standard |
| Supplier | المورد | Standard |
| Inventory | المخزون | Standard |
| Order | الطلب | Standard |
| Checkout | إتمام الدفع | More natural than "الدفع" |
| Submit | إرسال / اعتماد | Avoid literal submission words |
| Create | إنشاء | Standard |
| Delete | حذف | Standard |
| Cancel | إلغاء | Standard |
| Save Changes | حفظ التغييرات | Natural action text |

---

## 3. UX Writing Guidelines

### Action Buttons
CTAs should be action-oriented and encouraging.
- ❌ **Bad:** "Get Started" → "البدء" (Too literal/formal)
- ✅ **Good:** "Get Started" → "ابدأ الآن مجانًا" (Action-oriented, clear value)
- ❌ **Bad:** "Submit Form" → "تقديم النموذج"
- ✅ **Good:** "Submit" → "إرسال البيانات"

### Empty States
Empty states should guide the user or softly indicate no data.
- ❌ **Bad:** "No data" → "لا توجد بيانات"
- ✅ **Good:** "No data" → "لا توجد بيانات حتى الآن" (Hopeful, implies future action)
- ❌ **Bad:** "No customers found" → "لم يتم العثور على عملاء"
- ✅ **Good:** "No customers found" → "لم نجد أي عملاء حتى الآن"

### Error Messages
Errors should be helpful and soft, not blaming the user.
- ❌ **Bad:** "Error occurred" → "حدث خطأ" 
- ✅ **Good:** "Error occurred" → "حدث خطأ، يرجى المحاولة مرة أخرى" 

### Context-Aware Translations
Words change meaning based on where they live.
- **Plan**: If on Pricing Page → "الباقة". If talking about business strategy → "الخطة".
- **Home**: If navigation main page → "الرئيسية". If building address → "المنزل".

---

## 4. Landing Page Copywriting Style

The landing page must be persuasive, selling the **value** of the software, not just translating the words.

- ❌ **English:** "Manage your business efficiently"
- ❌ **Robotic Arabic:** "إدارة عملك بكفاءة"
- ✅ **Persuasive Arabic:** "إدارة أعمالك أصبحت أسهل وأسرع مع Partivo"

---

## 5. RTL UX Rules & Formatting

1. **Alignment:** Ensure all text aligns right in Arabic (`rtl:text-right`, `dir="auto"`).
2. **Icons:** Directional icons (arrows) must flip using `rtl:rotate-180`. Left/Right margins must flip using `rtl:mr-`, `rtl:ml-`, or V4 logical properties like `ms-` and `me-`.
3. **Numerals:** Stick to standard Arabic numerals (1, 2, 3...) to ensure legibility across MENA, unless specifically requested otherwise.
4. **Punctuation:** Use Arabic commas (،) and question marks (؟).
5. **Spacing:** Arabic fonts (like Cairo) naturally need higher line height (`leading-relaxed` or `leading-loose`) to accommodate diacritics and ascenders/descenders. Do not crowd the text.
