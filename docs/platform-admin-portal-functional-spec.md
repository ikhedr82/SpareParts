# Platform Admin Portal — Functional Specification

## Module Overview

The Platform Admin Portal serves as the centralized SaaS Control Plane, enabling high-fidelity orchestration of the entire ecosystem.

### 1. Tenant Management

**Purpose**: Lifecycle orchestration of ecosystem nodes (tenants).
**Actors**: Platform Admin, Infrastructure Provisioner (System).
**Key Capabilities**:

- **Node Provisioning**: Deploy new tenant instances with isolated resource contexts.
- **Identity Governance**: Manage subdomains, entity names, and base operational currencies.
- **Access Control**: Suspend or reactivate entire tenant clusters immediately.
- **Tactical Intervention**: Execute logged administrative overrides for emergency assistance.
- **Soft Delete**: Deletion of tenant environments with audit retention.
**Screens**: Tenant Registry, Tenant Details (360 Overview).
**APIs**: `GET /api/platform/tenants`, `POST /api/platform/tenants`, `POST /api/platform/tenants/:id/suspend`, `POST /api/platform/tenants/:id/reactivate`, `POST /api/platform/tenants/:id/intervention`.

### 2. Subscription Management

**Purpose**: Monetization and lifecycle management of tenant subscriptions.
**Actors**: Platform Admin, Billing System.
**Key Capabilities**:

- **Strategy Assignment**: Assign and modify monetization blueprints (plans) for tenants.
- **Pulse Monitoring**: Real-time tracking of MRR, active vs. past-due subscriptions.
- **Administrative Overrides**: Force renewal of periods or override next billing dates.
- **Kill Switch**: Immediate termination of under-performing or non-compliant subscriptions.
**Screens**: Subscription Hub, Subscription Registry.
**APIs**: `GET /api/platform/subscriptions`, `PATCH /api/platform/tenants/:id/plan`, `POST /api/platform/subscriptions/:id/force-renewal`, `PATCH /api/platform/subscriptions/:id/override`.

### 3. Billing & Financial Configuration

**Purpose**: Global financial standards and settlement orchestration.
**Actors**: Platform Admin, Finance Auditor.
**Key Capabilities**:

- **Monetization Blueprints**: CRUD for subscription plans (pricing, resource limits, features).
- **Currency Registry**: Manage supported currencies and their active status.
- **Exchange Engine**: Configure system-wide exchange rates for multi-currency settlement.
- **Base Anchor**: Designate a Platform Base Currency for global revenue reporting.
**Screens**: Plans Registry, Currencies & Rates, Revenue Intelligence.
**APIs**: `GET /api/platform/plans`, `POST /api/platform/plans`, `GET /api/platform/currencies`, `POST /api/platform/currencies/rates`, `GET /api/platform/revenue/trends`.

### 4. API Key & Resource Gateway

**Purpose**: Secure programmatic access and telemetry tracking.
**Actors**: Platform Admin, External Systems.
**Key Capabilities**:

- **Key Provisioning**: Generate secure, hashed tokens for external integrations.
- **Usage Telemetry**: High-fidelity visualization of request volume, method distribution, and error rates.
- **Security Revocation**: Immediate invalidate compromised access keys.
**Screens**: API Keys Management, Telemetry Modal.
**APIs**: `GET /api/platform/api-keys`, `POST /api/platform/api-keys`, `GET /api/platform/api-keys/:id/metrics`.

### 5. Infrastructure Monitoring

**Purpose**: Global system health and resilience observability.
**Actors**: Platform Admin, DevOps.
**Key Capabilities**:

- **Health Pulse**: Real-time status of the primary database and system metrics (CPU/Memory/Uptime).
- **Service Mesh Health**: Heartbeat monitoring for Redis/Cache services.
- **Incident Response**: Quick-refresh triggers for infrastructure validation.
**Screens**: System Health dashboard.
**APIs**: `GET /api/platform/health`.

### 6. System Configuration & Features

**Purpose**: Dynamic behavior management without code deployment.
**Actors**: Platform Admin.
**Key Capabilities**:

- **Feature Flags**: Toggles for enabling/disabling capabilities globally or per tenant.
- **System Config**: Manage global constants and operational parameters.
**Screens**: Feature Flags, System Settings.
**APIs**: `GET /api/platform/features`, `GET /api/platform/settings`.

### 7. Localization Controls

**Purpose**: Multi-lingual support and RTL orchestration.
**Actors**: Platform Admin.
**Key Capabilities**:

- **Protocol Management**: Update tenant-specific language protocols.
- **Dictionary Parity**: Enforcement of 1:1 parity between English and Arabic.
- **RTL Mirroring**: Automatic UI adaptation for Right-to-Left languages.
**Screens**: Integrated across all modules via Language Switcher.
**APIs**: `PATCH /api/platform/tenants/:id/language`.

### 8. Security & Security Administration

**Purpose**: Governance, accountability, and user lifecycle management.
**Actors**: Platform Admin, Security Officer.
**Key Capabilities**:

- **User Lifecycle**: Provision, suspend, and reset credentials for platform administrators and tenant users.
- **High-Fidelity Audit**: Immutable logs of every administrative action with JSON state diffs.
- **Accountability**: Actor tracking and resource target mapping for all operations.
**Screens**: Platform Users, Audit Logs, Security Sidebar.
**APIs**: `GET /api/platform/users`, `POST /api/platform/users`, `GET /api/platform/audit-logs`, `POST /api/platform/users/:id/suspend`.
