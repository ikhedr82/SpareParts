# CRM Technical Specification

## Architecture
The CRM module is built as a standard Nest.js module within the Partivo micro-service architecture.

- **Module**: `CrmModule`
- **ORM**: Prisma (PostgreSQL)
- **Frontend**: Next.js App Router (Admin Panel)

## Data Model
New entities were added to the Prisma schema:
- `Lead`, `Opportunity`, `Deal`, `Activity`, `Note`, `CreditAccount`.
- Relationships:
    - All entities are `Tenant` aware via `tenantId`.
    - `CreditAccount` has a 1:1 relationship with `BusinessClient`.
    - `Opportunity` links to either a `Lead` or a `BusinessClient`.

## Backend Implementation
- `CrmService`: Handles business logic, including 360-view aggregation and credit limit synchronization.
- `TenantAwarePrismaService`: Ensures data isolation across tenants.
- `OrdersService`: Modified to perform synchronous credit checks during order creation.

## API Endpoints
- `GET /crm/customers/:id/360`: Aggregates data from 5+ tables into a unified view.
- `POST /crm/leads`, `POST /crm/opportunities`, etc.: CRUD operations.
- `PATCH /crm/credit/limit`: Updates credit limits and status with backward compatibility sync.

## Frontend Implementation
- Located in `admin-panel/app/crm`.
- Uses `Tailwind CSS` for styling and `Lucide` for icons.
- Responsive Kanban board implemented using flex/overflow containers.
- Dynamic timeline component for chronological activity logs.

## Security
- Multi-tenant isolation at the database level.
- Standard API authentication/authorization guards (inherited from `AppModule`).
