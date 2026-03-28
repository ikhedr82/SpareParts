# Partivo — Brand System Documentation

## Brand Identity

| Element | Value |
|---|---|
| **Name** | Partivo |
| **Domain** | partivo.net |
| **Tagline** | Multi-Tenant Spare Parts Commerce |
| **Logo Concept** | Cube (inventory) + Gear (operations) |

---

## Logo System

### Assets

| Asset | Path | Usage |
|---|---|---|
| Primary Logo (Light) | `/public/brand/logo.svg` | Light backgrounds, sidebars, login pages |
| Primary Logo (Dark) | `/public/brand/logo-dark.svg` | Dark backgrounds, landing website navbar |
| Icon Only | `/public/brand/logo-icon.svg` | Compact spaces, favicon fallback |
| Favicon | `/public/brand/favicon.svg` | Browser tab icon |
| App Icon | `/public/brand/app-icon.svg` | Mobile app stores, splash screens |

### Logo Usage Rules

1. **Minimum Size**: The logo should never appear smaller than 80px wide (horizontal) or 24px (icon only).
2. **Clear Space**: Maintain a minimum clear space equal to the cube icon's height around all sides of the logo.
3. **No Modification**: Do not stretch, rotate, change colors, or add effects to the logo.
4. **Light vs Dark**: Use `logo.svg` on light backgrounds (#FFFFFF, #F1F5F9). Use `logo-dark.svg` on dark backgrounds (#0C4A6E, #064E3B, #0F172A).
5. **Icon Only**: Use `logo-icon.svg` when the wordmark cannot fit (e.g., mobile navigation headers, compact sidebars).

---

## Color Palette

### Primary Colors — Growth & Commerce

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#10B981` | Buttons, links, active states |
| `primaryLight` | `#34D399` | Hover states, badges, highlights |
| `primaryDark` | `#059669` | Pressed states, emphasis |

### Secondary Colors — Trust & Infrastructure

| Token | Hex | Usage |
|---|---|---|
| `secondary` | `#0EA5E9` | Secondary actions, links, info states |
| `secondaryLight` | `#38BDF8` | Hover effects, subtle accents |
| `secondaryDark` | `#0284C7` | Pressed states, headers |

### Background Tones

| Token | Hex | Usage |
|---|---|---|
| `darkBg` | `#064E3B` | Splash screens, mobile app backgrounds |
| `darkBgAlt` | `#0C4A6E` | Landing page gradients, hero sections |

### Neutral / Text

| Token | Hex | Usage |
|---|---|---|
| `textLight` | `#F1F5F9` | Text on dark backgrounds |
| `textDark` | `#1E293B` | Primary text on light backgrounds |

---

## Typography

| Usage | Font Family | Weight | Fallback |
|---|---|---|---|
| **Headings / UI** | Inter | 700 (Bold) | Segoe UI, system-ui, sans-serif |
| **Arabic** | Noto Sans Arabic | 400 / 700 | Segoe UI, system-ui, sans-serif |
| **Monospace** | JetBrains Mono | 400 | Cascadia Code, monospace |

### Scale

| Level | Size | Usage |
|---|---|---|
| H1 | 32-48px | Hero titles, page headers |
| H2 | 24-28px | Section headers |
| H3 | 18-20px | Card titles, sidebar headers |
| Body | 14-16px | Content, descriptions |
| Caption | 12px | Hints, timestamps |

---

## Spacing System

| Token | Value | Usage |
|---|---|---|
| `xs` | 4px | Dense UI, icon padding |
| `sm` | 8px | Form field gaps |
| `md` | 16px | Card padding, section gaps |
| `lg` | 24px | Section padding |
| `xl` | 32px | Major section gaps |
| `xxl` | 48px | Page-level padding |

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `sm` | 8px | Inputs, small buttons |
| `md` | 12px | Cards, modals |
| `lg` | 16px | Feature cards, panels |
| `xl` | 24px | Hero elements, banners |
| `full` | 9999px | Badges, pills, avatars |

---

## Dark Mode Usage

| Component | Light Mode | Dark Mode |
|---|---|---|
| **Background** | `#FFFFFF` / `#F1F5F9` | `#0F172A` / `#1E293B` |
| **Logo** | `logo.svg` | `logo-dark.svg` |
| **Text** | `#1E293B` | `#F1F5F9` |
| **Primary Button** | `#10B981` on white | `#34D399` on dark |
| **Cards** | White with shadow | `#1E293B` with border |

### Portal Assignments

- **Landing Website**: Dark mode (gradient backgrounds, `logo-dark.svg`)
- **Platform Admin**: Light mode (`logo.svg`)
- **Tenant Admin**: Light mode (`logo.svg`)
- **Customer Portal**: Light mode (`logo.svg`)
- **Mobile Apps Driver**: Light mode with brand primary accent
- **Mobile Apps Warehouse**: Light mode with brand secondary accent

---

## Mobile Icon Usage

| Platform | Asset | Specs |
|---|---|---|
| **iOS App Store** | `app-icon.svg` | 1024×1024, no transparency |
| **Android Adaptive** | `app-icon.svg` foreground | 108dp foreground with `#064E3B` background |
| **Splash Screen** | `app-icon.svg` centered | Dark emerald background (`#064E3B`) |
| **Favicon** | `favicon.svg` | 32×32 simplified cube |

---

## Configuration Files

| File | Location | Scope |
|---|---|---|
| Web Brand Config | `/config/brand.ts` | All web portals (Platform, Tenant, Customer, Landing) |
| Mobile Brand Config | `/mobile-app/src/config/brand.ts` | Driver App, Warehouse App |
| App Manifest | `/mobile-app/app.json` | Expo/React Native build config |

### Referencing in Code

**Web (Next.js)**:
```tsx
import { BRAND } from '@/config/brand';
// or use directly
<img src="/brand/logo.svg" alt="Partivo" />
```

**Mobile (React Native)**:
```tsx
import BRAND from '../config/brand';
<Text style={{ color: BRAND.colors.primary }}>{BRAND.name}</Text>
```
