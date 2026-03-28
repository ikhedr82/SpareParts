# Landing Portal — Technical Specification

## Technology Stack
- **Framework**: Next.js (App Directory) — shares the `/frontend/` codebase.
- **Styling**: Tailwind CSS with custom design system.
- **Language**: TypeScript.
- **Rendering**: Server-Side Rendering (SSR) for SEO optimization.
- **API**: Fetches CMS content from the NestJS backend's public endpoints.

## Project Structure
The Landing Portal is served from the `/frontend/app/(public)/` route group:
```
frontend/app/
├── (public)/
│   ├── layout.tsx       # Landing layout with public navigation
│   ├── page.tsx         # Main landing page (Hero, Features, Pricing, etc.)
│   ├── signup/          # Onboarding registration
│   ├── terms/           # Terms & Conditions
│   └── privacy/         # Privacy Policy
```

## CMS Architecture
- Content sections (Hero, Features, Testimonials, FAQs) are stored in the database via the Platform Admin.
- The landing page fetches content at render time via `/public-info/cms/:section` endpoints.
- Backend resilience: If CMS data is unavailable, sections degrade gracefully (hidden) rather than erroring.

## SEO Implementation
- Server-rendered HTML with proper `<title>`, `<meta description>`, and Open Graph tags.
- Single `<h1>` per page with semantic heading hierarchy.
- All interactive elements have unique, descriptive IDs.
- Fast initial load via optimized bundle splitting.

## Responsive Design
- Mobile-first approach.
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px).
- Navigation collapses to hamburger menu on mobile.
