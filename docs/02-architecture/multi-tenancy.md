# Multi-Tenancy Architecture

## Isolation Model
Partivo implements **Column-Based Multi-Tenancy** within a single shared PostgreSQL database. Every tenant-scoped table contains a `tenantId` column that acts as the isolation boundary.

## How It Works

### 1. Tenant Entity
The `Tenant` model is the root of isolation:
- `id` (UUID): Primary identifier.
- `subdomain` (String, unique): Each tenant has a unique subdomain.
- `status`: `ACTIVE`, `SUSPENDED`, `DELETED`.
- `planId`: Links to the SaaS subscription plan.
- `baseCurrency`: The tenant's primary currency.
- `supportedLanguages`: Array of language codes (`EN`, `AR`).
- `vatPercentage`: Tax configuration.

### 2. Data Flow Enforcement

```mermaid
sequenceDiagram
    participant Client
    participant AuthGuard
    participant PrismaMiddleware
    participant Database

    Client->>AuthGuard: Request with JWT
    AuthGuard->>AuthGuard: Extract tenantId from JWT claims
    AuthGuard->>PrismaMiddleware: Set tenantId in request context
    PrismaMiddleware->>Database: auto-inject WHERE tenantId = 'xxx'
    Database-->>PrismaMiddleware: Filtered results
    PrismaMiddleware-->>Client: Tenant-scoped data only
```

### 3. Global vs. Tenant Data
| Scope | Models | Access |
|---|---|---|
| **Global** (Platform-Owned) | `Product`, `Brand`, `ProductCategory`, `VehicleMake`, `VehicleModel`, `ProductFitment`, `Currency` | Read by all tenants; Write by Platform Admins only |
| **Tenant-Scoped** | `Inventory`, `Sale`, `Order`, `Customer`, `BusinessClient`, all financial models | Strictly filtered by `tenantId` |

### 4. User Isolation
- Users with `isPlatformUser = true` can access platform-admin routes. They have no `tenantId`.
- Users with `tenantId` set are scoped to that tenant. Their roles are further scoped by `branchId` when applicable.
- The `UserRole` junction table enforces `(userId, roleId, tenantId, branchId)` uniqueness.

## Tenant Lifecycle

```mermaid
stateDiagram-v2
    [*] --> ACTIVE : Onboarding Complete
    ACTIVE --> SUSPENDED : Payment Failed / Policy Violation
    SUSPENDED --> ACTIVE : Payment Restored / Issue Resolved
    SUSPENDED --> DELETED : Grace Period Expired
    ACTIVE --> DELETED : Manual Deletion
    DELETED --> [*]
```

## Branch-Level Scoping
Within a tenant, data is further partitioned by `branchId`:
- `Inventory` is per-branch per-product.
- `CashSession` and `Sale` belong to a specific branch.
- `UserRole` can be scoped to a specific branch, allowing branch-level access control.
