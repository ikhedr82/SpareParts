# Partivo Product Navigation Map

This document provides a visual representation of the architecture and navigation flows across both the Landing Portal and the Platform Admin Portal.

---

## 1. Landing Portal Structure
Marketing gateway and public onboarding.

```mermaid
graph TD
    A["/ (Home)"] --> B["/features"]
    A --> C["/pricing"]
    A --> D["/about"]
    A --> E["/contact"]
    A --> F["/docs"]
    A --> G["/signup"]
    A --> H["/login"]

    G -- "Success" --> H
    H -- "Authorized" --> I["/platform (Dashboard)"]
```

---

## 2. Platform Admin Portal Structure
Internal administrative orchestration.

```mermaid
graph TD
    A["/platform (Dashboard)"] --> B["/platform/tenants"]
    A --> C["/platform/revenue"]
    A --> D["/platform/plans"]
    A --> E["/platform/subscriptions"]
    A --> F["/platform/support"]
    A --> G["/platform/health"]
    A --> H["/platform/api-keys"]
    A --> I["/platform/audit-logs"]
    A --> J["/platform/users"]
    A --> K["/platform/currencies"]
    A --> L["/platform/features"]
    A --> M["/platform/settings"]

    B -- "Search/Filter" --> B
    B -- "Modal" --> B1["Provision Node"]
    
    C -- "Analysis" --> C1["Expansion Pulse"]
    C -- "Ledger" --> C2["Transaction Feed"]

    H -- "Click Key" --> H1["Telemetry Charts"]
```

---

## 3. Global Navigation Flows

### Onboarding Flow
`Landing Home` -> `Pricing` -> `Signup` -> `Login` -> `Platform Dashboard`

### Support Lifecycle
`Platform Support` -> `Initiate Case` -> `Active Queue` -> `Resolution`

### Infrastructure Monitoring
`Platform Health` -> `Telemetry Scan` -> `Prisma/Redis Metrics`
