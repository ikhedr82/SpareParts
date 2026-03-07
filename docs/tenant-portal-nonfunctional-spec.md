# Tenant Admin Portal — Non-Functional Requirements & Implementation

> Version: 1.0 | Status: Production-Ready | Last Updated: March 2026

---

## 1. Security

### Authentication
- **JWT-based auth** — tokens issued on login, stored in `HttpOnly` cookies, sent via Axios request interceptor.  
- **Token invalidation** — 401 from any API auto-clears token and redirects to `/login`.  
- Passwords hashed with **bcrypt** (min 10 rounds) server-side.

### Authorization (RBAC)
- NestJS guards: `JwtAuthGuard` (validates token) + `PermissionsGuard` (checks `@RequirePermissions` decorator).
- **Controller-level guard application** — all tenant-facing controllers annotated at class level.
- Role hierarchy: `PLATFORM_ADMIN` → `TENANT_ADMIN` → `TENANT_USER`, `WHS_MANAGER`, `SALES_REP`.

### Multi-Tenancy Isolation
- `TenantAwarePrismaService` injects `tenantId` filter into every Prisma query.
- No cross-tenant data leakage possible via the ORM layer.

### Input Validation
- DTOs validated with `class-validator` decorators (whitelist, forbid non-whitelisted).
- Global `ValidationPipe` with `transform: true` on the NestJS application.

---

## 2. Performance

### Frontend
- **Debounced search** (300 ms) on the Inventory page to avoid API flooding.
- **Server-side pagination** on Inventory and Sales endpoints — only current page rows fetched.
- React Query **staleTime** and **cacheTime** configured to reduce redundant network requests.
- Dynamic imports used for chart components (Recharts) to reduce initial bundle size.

### Backend
- **Prisma `$transaction`** for atomic multi-table mutations (inventory adjust, sale create).
- Indexed columns on `tenantId`, `createdAt`, `status` for the most common query filters.
- **Outbox pattern** for async event publishing — no blocking calls on the write path.

---

## 3. Observability

### Frontend
- Structured API error logging via the Axios interceptor:  
  ```
  [API Error] METHOD /endpoint → HTTP 422: Validation failed
  ```
- React **ErrorBoundary** catches uncaught render errors and logs `componentStack` — can be wired to Sentry/DataDog in production.

### Backend
- NestJS built-in `Logger` service logs request/response lifecycle.
- **AuditLog** table records every mutating action: actor, tenant, action type, entity type/ID, timestamp, metadata (JSON).
- Audit log entries created for: `CREATE_INVENTORY`, `UPDATE_INVENTORY`, `DELETE_INVENTORY`, `ADJUST_STOCK`, `CREATE_SALE`, `REFUND_SALE`, `VOID_SALE`, and all user management actions.

---

## 4. Reliability

### Frontend
- All async operations have explicit `loading`, `empty`, and `error` states rendered in the UI.
- `ErrorBoundary` component at the tenant layout root catches and recovers from page-level render crashes.
- Optimistic UI avoided for destructive actions — confirmations gated by API success.

### Backend
- **Optimistic concurrency control** via `version` field on mutable entities.
- `$transaction` used for all multi-step mutations to guarantee atomicity.
- **Plan enforcement** (`PlanEnforcementService`) checked before any creation that consumes a metered resource (branches, users, products).
- Usage tracking updated transactionally alongside the operation to prevent drift.

---

## 5. Scalability

- Stateless NestJS API — horizontal scaling supported.
- Tenant isolation by `tenantId` key enables sharding if needed.
- Stripe Checkout and billing portal backed by Stripe APIs — externally scalable.
- Feature flags per plan (`BASIC`, `PRO`, `ENTERPRISE`) enforced server-side via `PlanEnforcementService`.
