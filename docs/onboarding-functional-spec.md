# Self-Service Onboarding — Functional Specification

## Module Overview

The Self-Service Onboarding layer enables external customers to create tenant environments on the Antigravity Commerce Platform without Platform Admin intervention. It provides a public-facing landing website with product marketing, pricing transparency, and a fully automated signup flow.

### 1. Public Landing Website

**Purpose**: Marketing-grade entry point for prospective customers.
**Actors**: Anonymous Visitor.
**Key Capabilities**:

- **Hero Section**: Bold value proposition with gradient CTA directing to signup.
- **Feature Highlights**: Six-card grid showcasing Inventory, Sales, Logistics, Analytics, Multi-Tenancy, and Security.
- **Pricing Transparency**: Three-tier plan comparison (Free, Professional, Enterprise) with feature checklists.
- **Navigation**: Fixed glassmorphism navbar with language switcher and login/signup links.
**Screens**: Landing Page (`/`), Features (`/features`), Pricing (`/pricing`).
**APIs**: None (static content).

**Epic**: Marketing Website
**Feature**: Product Showcase

| # | User Story | Acceptance Criteria |
|---|---|---|
| 1 | As a visitor, I can see the platform's value proposition on the landing page. | Hero section displays title, subtitle, and "Start Free" CTA button. |
| 2 | As a visitor, I can browse all platform features. | Features page lists 10 modules with icons and descriptions. |
| 3 | As a visitor, I can compare pricing plans. | Pricing page shows Free, Pro, and Enterprise tiers with feature lists. |
| 4 | As a visitor, I can switch between English and Arabic. | Language switcher in navbar toggles locale and layout direction. |
| 5 | As a visitor, I see RTL layout when Arabic is selected. | All elements mirror correctly including navbar, cards, and text alignment. |

---

### 2. Self-Service Signup

**Purpose**: Automated tenant provisioning without admin intervention.
**Actors**: Prospective Customer.
**Key Capabilities**:

- **Form Collection**: Company name, admin name, email, password, subdomain, and preferred language.
- **Real-Time Subdomain Validation**: Async check against `GET /onboarding/check-subdomain`.
- **Automated Provisioning**: Full tenant lifecycle creation in a single atomic transaction.
- **Success Confirmation**: Tenant URL and admin credentials displayed post-signup.
**Screens**: Signup Page (`/signup`).
**APIs**: `POST /onboarding/signup`, `GET /onboarding/check-subdomain`.

**Epic**: Self-Service Onboarding
**Feature**: Tenant Signup Flow

| # | User Story | Acceptance Criteria |
|---|---|---|
| 1 | As a visitor, I can enter my company details to create an account. | Form collects: Company Name, Admin Name, Admin Email, Password, Subdomain, Preferred Language. |
| 2 | As a visitor, I can check if my desired subdomain is available in real-time. | Subdomain field calls `GET /onboarding/check-subdomain` after 3+ characters, showing ✓ (available) or ✗ (taken). |
| 3 | As a visitor, I receive my tenant URL after successful signup. | Success state displays `tenantUrl` and `adminEmail` returned by the API. |
| 4 | As a visitor, my signup creates a complete tenant environment. | Transaction creates: Tenant, Subscription (FREE), Admin Role, Admin User, Audit Log. |
| 5 | As a visitor, I cannot sign up with a duplicate email. | API returns 409 Conflict with "Email is already registered" message. |
| 6 | As a visitor, I cannot sign up with a taken subdomain. | API returns 409 Conflict with "Subdomain is already taken" message. |
| 7 | As a visitor, I see validation errors for invalid input. | class-validator decorators enforce email format, password min-length, and subdomain regex. |

---

### 3. Free Plan Strategy

**Purpose**: Zero-friction entry for new customers.
**Actors**: System (automatic).
**Key Capabilities**:

- **Auto-Resolution**: If no FREE plan exists, the system creates one automatically.
- **Default Limits**: 2 users, 1 branch, 100 products, 500 orders/month.
- **Feature Gating**: Sales and Inventory enabled; Reports, Logistics, Multi-Currency disabled.
**APIs**: Internal (resolved in `OnboardingService.resolveFreePlan()`).

**Epic**: Free Plan Strategy
**Feature**: Automatic Plan Assignment

| # | User Story | Acceptance Criteria |
|---|---|---|
| 1 | As a new customer, I receive a FREE plan automatically. | Signup assigns the FREE plan without manual intervention. |
| 2 | As a platform operator, the FREE plan is created if it doesn't exist. | `resolveFreePlan()` checks for an existing FREE plan and creates one if missing. |
| 3 | As a new customer, my plan has sensible default limits. | Limits: maxUsers=2, maxBranches=1, maxProducts=100, maxOrdersPerMonth=500. |
