# Self-Service Onboarding — Product Structure

## Epic: Marketing Website

### Feature: Product Showcase

- Story: Visitor can see the platform's value proposition with a bold hero section and CTA.
- Story: Visitor can browse a feature grid showcasing 6 key platform capabilities.
- Story: Visitor can navigate between Home, Features, Pricing, Login, and Signup pages.
- Story: Visitor can switch between English and Arabic with full RTL layout adaptation.

### Feature: Pricing Transparency

- Story: Visitor can compare three pricing tiers: Free, Professional, and Enterprise.
- Story: Visitor can see feature checklists for each plan with visual differentiation.
- Story: Visitor can identify the recommended plan via a "Most Popular" badge.

---

## Epic: Self-Service Onboarding

### Feature: Tenant Signup Flow

- Story: Visitor can fill out a signup form with company name, admin name, email, password, subdomain, and preferred language.
- Story: Visitor can see real-time subdomain availability as they type (after 3+ characters).
- Story: Visitor cannot submit the form if the subdomain is already taken (submit button disabled).
- Story: Visitor receives a success confirmation with their tenant URL and admin email after signup.
- Story: Visitor can navigate to the login page from the success confirmation.

### Feature: Automated Tenant Provisioning

- Story: System creates a complete tenant environment in a single atomic transaction.
- Story: System assigns the FREE plan automatically to all self-service signups.
- Story: System creates an admin role with full permissions for the new tenant.
- Story: System creates an admin user with the provided credentials.
- Story: System creates an audit log entry for the signup event.

---

## Epic: Free Plan Strategy

### Feature: Automatic Plan Resolution

- Story: System resolves the FREE plan from the database if it exists.
- Story: System creates a FREE plan with default limits if none exists.
- Story: FREE plan includes: 2 users, 1 branch, 100 products, 500 orders/month.
- Story: FREE plan enables Sales and Inventory; disables Reports, Logistics, and Multi-Currency.

---

## Epic: Security & Validation

### Feature: Input Validation

- Story: Email field enforces valid email format via class-validator.
- Story: Password field enforces minimum 8 characters.
- Story: Subdomain field enforces lowercase alphanumeric with optional hyphens (3-63 chars).
- Story: Duplicate email returns HTTP 409 with "Email is already registered" message.
- Story: Duplicate subdomain returns HTTP 409 with "Subdomain is already taken" message.

### Feature: Data Protection

- Story: Passwords are hashed with bcrypt (cost factor 12) before storage.
- Story: Public endpoints are excluded from TenantMiddleware and JWT authentication.
- Story: Error logs never contain passwords or sensitive credentials.

---

## Epic: Localization & Experience

### Feature: Bi-directional Landing Pages

- Story: All landing pages support English (LTR) and Arabic (RTL) via locale dictionaries.
- Story: Language switcher in the navbar toggles both text and layout direction.
- Story: 80+ locale keys maintain 1:1 parity between EN and AR dictionaries.
- Story: Signup form allows selecting preferred language for the new tenant environment.
