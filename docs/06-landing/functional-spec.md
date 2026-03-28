# Landing Portal — Functional Specification

## Overview
The Landing Portal is the public-facing marketing and onboarding website for the Partivo SaaS platform itself. It targets prospective spare parts retailers looking to subscribe.

## Key Functions

### 1. Hero Section
- Dynamic headline and subheadline (EN/AR).
- Call-to-action button: "Get Started" / "Request Demo".
- Managed via CMS from the Platform Admin Portal.

### 2. Features Section
- Showcase of platform capabilities.
- Features are CMS-driven: icon, title, description (EN/AR).
- Displayed as responsive card grid.

### 3. About / Ecosystem Section
- Visual representation of the Partivo ecosystem.
- Animated matrix showing module interconnections (POS, Inventory, Logistics, Finance, Analytics, Orders).

### 4. Testimonials Section
- Customer quotes and reviews.
- CMS-managed with dynamic rendering.
- Graceful fallback if no testimonials exist in the database.

### 5. FAQ Section
- CMS-managed question/answer pairs.
- Accordion-style expandable items.

### 6. Pricing Section
- Displays SaaS subscription plans.
- Only rendered if plans are configured in the Platform Admin.
- Shows: Plan name, price, billing cycle, feature list.
- Hidden entirely if no plans are active.

### 7. Contact Section
- Contact form or contact information.
- Enables prospective retailers to reach out.

### 8. Self-Serve Onboarding
- "Get Started" flow leading to tenant registration.
- Collects: Business name, email, phone, selected plan.

### 9. Legal Pages
- Terms & Conditions and Privacy Policy.
- Publicly accessible without authentication.
- Content managed via CMS.

## Localization
- Full Arabic (RTL) and English (LTR) support.
- Language toggle in the header.
- All content is translatable through the CMS.
