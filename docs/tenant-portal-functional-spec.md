# Tenant Admin Portal — Functional Specification

> Version: 1.0 | Status: Production-Ready | Last Updated: March 2026

## Overview

The Tenant Admin Portal is a white-label, multi-tenant SaaS web application built with **Next.js 14** (App Router) on the frontend and **NestJS** on the backend. It provides a full administrative workspace for tenant (company) administrators to manage operations: inventory, sales, purchasing, logistics, customers, users, and billing.

---

## Modules & Features

### 1. Dashboard (`/tenant`)
- Real-time KPI cards: Revenue, Sales Count, Open Cash Sessions, Unpaid Invoices, Stock Alerts, Pending Orders.
- Revenue trend bar chart (Recharts) with localized legends.
- Branch-by-branch performance breakdown.
- RTL-aware chart axis and localized number formatting.

### 2. Branch Management (`/tenant/branches`)
- List all branches with name, address, and phone.
- Create / edit branches via modal with form validation.
- Plan enforcement: shows live usage vs. limit badge; blocks creation when limit reached.
- Localized warning banner when limit is hit.

### 3. User Management (`/tenant/users`)
- List all tenant users with email and assigned roles.
- Create new users with email, password, and role selector.
- Roles supported: `TENANT_USER`, `TENANT_ADMIN`, `WHS_MANAGER`, `SALES_REP`.
- Plan enforcement: tracks user count vs. plan limit.

### 4. Inventory (`/tenant/inventory`)
- Server-side paginated data table with debounced search (product name, SKU, branch).
- Color-coded stock badges: Out of Stock (red), Low Stock (amber), In Stock (green).
- Two-stage stock adjustment workflow: enter change + reason → confirmation dialog → API call.
- Per-item fields: on-hand, allocated, available quantities; cost and selling price.

### 5. Customers (`/tenant/customers`)
- CRUD management: create, edit, and delete customers.
- Displays name, email, phone, and account balance.
- Balance color-coded: red for debit, green for credit.

### 6. Suppliers (`/tenant/suppliers`)
- CRUD management for supplier accounts.
- Balance tracking (amount owed to each supplier).

### 7. Purchase Orders (`/tenant/purchase-orders`)
- List all POs with supplier, date, status, and total.
- Search by supplier name or PO ID (client-side).
- Status badges: DRAFT, ORDERED, RECEIVED with matching icons (Clock, Truck, CheckCircle).
- Link to individual PO detail page.

### 8. Returns (`/tenant/returns`)
- List purchase returns (RTV) with PO reference, date, and status.
- Search by return ID or PO ID.
- Status badges: REQUESTED, APPROVED, REJECTED, SHIPPED, COMPLETED, CANCELLED.
- Link to individual return detail page.

### 9. Quotes (`/tenant/quotes`)
- List sales quotes with quote number, customer, total, validity, and status.
- Client-side search by quote number or customer name.
- Visual expired-quote override (red highlight) when past `validUntil` date.
- Status badges: DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED, CONVERTED.

### 10. Warehouse / Pick Lists (`/tenant/warehouse`)
- List active pick lists for order fulfillment.
- Status indicators: CREATED, PICKING (animated pulse), PICKED, PACKED, CANCELLED.
- Link to individual pick list task page.

### 11. Billing & Subscription (`/tenant/billing`)
- Active plan hero card with price, renewal date, and Stripe portal link.
- Live capacity utilization bars: Users, Branches, Products, Monthly Sales.
- Transaction archive table with payment history.
- Upgrade plan section with pricing cards for Basic, Professional, and Enterprise tiers.

---

## Shared Behaviors

### Authentication & Authorization
- JWT tokens stored in cookies, injected via Axios interceptor on all API calls.
- Unauthorized (401) responses automatically clear the token and redirect to `/login`.
- Role-based access enforced by NestJS `JwtAuthGuard` + `PermissionsGuard` on all controllers.
- Tenant isolation enforced by `TenantAwarePrismaService` (all queries scoped to `tenantId`).

### Localization
- Two locales: English (`en`) and Arabic (`ar`).
- Language persistence via cookie; context provided by `LanguageContext`.
- Full RTL layout support: `document.dir` set dynamically; all pages use `${isRTL ? 'rtl' : 'ltr'}`.
- 1:1 key parity between `en.json` and `ar.json` for all modules.
- Date formatting uses `date-fns` with locale-specific `arSA` / `enUS` adapters.

### Data Fetching
- All pages use either `@tanstack/react-query` (`useQuery`) or `useState` + `useEffect`.
- All API calls go through the shared `apiClient` (Axios instance with `NEXT_PUBLIC_API_URL`).
- **No raw axios calls with hardcoded URLs** remain in any tenant page.

### Error Handling & States
- Every data table has explicit **loading**, **empty**, and **error** states.
- A top-level `ErrorBoundary` wraps all tenant pages (in `layout.tsx`) to catch render errors.
- API errors logged with structured format: `[API Error] METHOD URL → HTTP STATUS: message`.

### Audit Logging
- All mutating backend operations call `AuditService.logAction` with actor, tenant, action type, and affected resource.
- Inventory adjustments, stock transfers, sales creation, refunds, and voids are all audit-logged.
