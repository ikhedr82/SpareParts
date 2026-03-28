# Platform Admin Portal — Functional Specification

## Overview
The Platform Admin Portal is the internal operations console for Partivo staff. It manages global catalog data, tenant lifecycle, SaaS billing, and system health monitoring.

## User Roles
- **Super Admin**: Full access to all platform functions.
- **Support Agent**: Read access to tenants and support tickets; limited write access.

## Functional Modules

### 1. Dashboard (`/platform/`)
- **KPI Cards**: Total tenants, active subscriptions, MRR (Monthly Recurring Revenue), total products.
- **Recent Activity Feed**: Latest tenant signups, subscription changes, support tickets.
- **Revenue Charts**: Subscription revenue over time.

### 2. Tenant Management (`/platform/tenants/`)
- **Tenant List**: Searchable, filterable grid showing all tenants.
  - Columns: Name, Subdomain, Status, Plan, Created Date.
  - Actions: View Details, Suspend, Activate, Delete.
- **Tenant Detail**: Full view of a tenant's configuration, branches, users, subscription, and usage metrics.

### 3. Plans & Pricing (`/platform/plans/`)
- **Plan List**: All SaaS subscription plans.
  - Fields: Name, Name (Arabic), Price, Currency, Billing Cycle, Active status.
  - Actions: Create, Edit, Deactivate.
- **Plan Features**: JSON-based feature configuration per plan.

### 4. Subscriptions (`/platform/subscriptions/`)
- **Subscription List**: All active and historical subscriptions.
  - Columns: Tenant, Plan, Status, Start Date, End Date, Provider.
  - Statuses: TRIAL, ACTIVE, PAST_DUE, CANCELLED, SUSPENDED, EXPIRED.
- **Subscription Actions**: Manually upgrade/downgrade, cancel, extend trial.

### 5. Revenue Dashboard (`/platform/revenue/`)
- Financial summaries: Total invoiced, collected, outstanding.
- Breakdown by plan and billing period.

### 6. User Management (`/platform/users/`)
- Manage platform-level admin users.
- Actions: Create user, assign roles, deactivate.

### 7. Currency Management (`/platform/currencies/`)
- Manage active currencies and exchange rates.
- Fields: Code, Name, Symbol, Precision, Is Active.

### 8. CMS Management (`/platform/cms/`)
- Manage landing page content: Hero, Features, Testimonials, FAQs, Pricing display.
- Content is translatable (EN/AR).

### 9. Audit Logs (`/platform/audit-logs/`)
- Filterable audit trail of all platform-level actions.
- Fields: User, Action, Entity Type, Entity ID, Timestamp, IP Address.

### 10. System Health (`/platform/health/`)
- Backend health check status.
- Database connectivity.

### 11. Support Tickets (`/platform/support/`)
- View and manage support tickets submitted by tenants.

### 12. Feature Flags (`/platform/features/`)
- Toggle feature flags per tenant or globally.

### 13. API Keys (`/platform/api-keys/`)
- Manage machine-to-machine API keys.

### 14. Monitoring (`/platform/monitoring/`)
- System monitoring dashboards and usage analytics.

### 15. Settings (`/platform/settings/`)
- Global platform configuration.
