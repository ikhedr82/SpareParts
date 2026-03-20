# Landing Portal Technical Specification

## 1. Component Architecture
The Landing Portal is architected using React Server Components where applicable, with dynamic client components hydrated selectively.
- **Static Assets**: Loaded asynchronously via a CDN pattern to minimize First Contentful Paint (FCP).
- **Client Components**: (`Hero`, `Features`, `Testimonials`, `FAQ`, `CTA`) utilize `framer-motion` for complex animations and interactivity.

## 2. State Management & Data Fetching
- **React Query**: `useQuery` is employed for fetching CMS content using custom hooks (`useCMSContent`, `useCMSTestimonials`, `useCMSFAQs`).
- **Caching & Stale Time**: Data is cached with a default 5-minute stale-time (`staleTime: 1000 * 60 * 5`) to optimize performance and reduce database load while ensuring relative freshness.
- **Loading States**: Fallback UI (Skeleton loaders) utilizing Tailwind's `animate-pulse` ensures Cumulative Layout Shift (CLS) remains near zero during asynchronous data fetching.

## 3. API Contracts
The frontend interfaces with the public NestJS endpoints:
- `GET /api/public/content/:key`: Fetches unified section content (`hero`, `features`, `cta`, `footer`).
- `GET /api/public/testimonials`: Fetches an ordered array of user testimonials.
- `GET /api/public/faqs`: Fetches an ordered array of Frequently Asked Questions.
- `GET /api/public/legal/:type`: Fetches active legal documentation (`privacy`, `terms`).

## 4. i18n and RTL Implementation
- **Context API**: `LanguageContext` provides global language state and translation functions (`t`).
- **CSS Logical Properties**: Tailwind V4 (`dir="rtl"`) is used globally in `layout.tsx` combined with specific Arabic typography (`Cairo` font) mapping.
- **Content Fallbacks**: Frontend components implement a robust fallback pattern mapping `data.contentAr || data.contentEn` based on the active direction.

## 5. Performance Optimization Strategies
- Dynamic imports for heavy animations where applicable.
- Image optimization via Next.js `<Image />` component.
- Skeleton UI rendering before React Query hydration to ensure perceived performance remains high.
