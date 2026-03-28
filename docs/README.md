# Partivo Documentation System

> **The official, single source of truth for the Partivo SaaS Platform.**

This documentation covers the complete Partivo ecosystem — from executive vision to technical architecture, from user manuals to test scenarios.

## Documentation Structure

| Folder | Contents | Audience |
|---|---|---|
| [00-executive](./00-executive/) | Vision, Value Proposition, Market Positioning | Executives, Sales, Investors |
| [01-platform-overview](./01-platform-overview/) | System Overview with architecture diagram | All stakeholders |
| [02-architecture](./02-architecture/) | System, Backend, Frontend, Mobile, Database, Multi-Tenancy, Offline, Billing, CRM, Data Contracts | Developers, Architects |
| [03-platform-admin](./03-platform-admin/) | Functional spec, Technical spec, API reference, User manual | Platform Ops, Support |
| [04-tenant-admin](./04-tenant-admin/) | Functional spec, Technical spec, API reference, User manual | Tenant Owners, Developers |
| [05-customer-portal](./05-customer-portal/) | Functional spec, Technical spec, API reference, User manual | B2B Clients, Developers |
| [06-landing](./06-landing/) | Functional spec, Technical spec, API reference, User manual | Marketing, Sales, Developers |
| [07-driver-app](./07-driver-app/) | Functional spec, Technical spec, API reference, User manual | Logistics, Drivers |
| [08-pos-app](./08-pos-app/) | Functional spec, Technical spec, API reference, User manual | Branch Staff, QA |
| [09-cross-cutting](./09-cross-cutting/) | Auth, RBAC, Permissions Matrix, Error Codes, i18n, Logging | All Developers, QA |
| [10-operations](./10-operations/) | Deployment Guide, Environment Setup | DevOps, Developers |
| [11-testing](./11-testing/) | Test Strategy, Test Scenarios | QA, Developers |
| [12-business-flows](./12-business-flows/) | Order, Billing, Delivery, Onboarding Lifecycles | Business, QA, Sales |

## Per-App Documentation Pattern

Each application (03–08) follows a standardized four-document structure:

1. **functional-spec.md** — Business capabilities, features, and workflows.
2. **technical-spec.md** — Technology stack, project structure, and design patterns.
3. **api-reference.md** — Authentication, error formats, endpoint groups, and link to Swagger.
4. **user-manual.md** — Screen-by-screen guide with fields, buttons, actions, modals, error states, and role-based visibility.

## Key Principles

- **Code is truth**: If this documentation contradicts the code, the documentation is wrong.
- **No placeholders**: Every documented feature exists in the codebase.
- **Diagrams are Mermaid.js**: All architectural and flow diagrams use standard Mermaid syntax.
- **Legacy Archive**: Previous documentation is preserved in `_archive/` for reference.

## Quick Links

### For Developers
- [Backend Architecture](./02-architecture/backend-architecture.md)
- [Database Design](./02-architecture/database-design.md)
- [Data Contracts](./02-architecture/data-contracts.md)
- [Environment Setup](./10-operations/environment-setup.md)

### For QA
- [Test Strategy](./11-testing/test-strategy.md)
- [Test Scenarios](./11-testing/test-scenarios.md)
- [Permissions Matrix](./09-cross-cutting/permissions-matrix.md)
- [Error Codes](./09-cross-cutting/error-codes.md)

### For Business / Sales
- [Executive Vision](./00-executive/vision.md)
- [Value Proposition](./00-executive/value-proposition.md)
- [Order Lifecycle](./12-business-flows/order-lifecycle.md)
- [Onboarding Lifecycle](./12-business-flows/onboarding-lifecycle.md)
