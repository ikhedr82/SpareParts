# Partivo Platform Admin Portal — User Manual

Welcome to the Partivo Platform Admin Portal. This manual provides a comprehensive guide to every screen, field, and action available to platform administrators.

---

## 1. Dashboard
**Route**: `/platform`  
**Purpose**: High-level overview of the ecosystem's health, revenue, and tenant activity.

### Fields
- **Total Tenants**: Count of all registered business entities.
- **MRR**: Monthly Recurring Revenue synthesized from all active subscriptions.
- **Active Tenants**: Currently authorized and operational ecosystem nodes.
- **Total Users**: Cumulative user count across all tenants.

### Actions
- **View All Tenants**: Redirects to the Tenant Registry.
- **View Full Ledger**: Redirects to the Revenue & Intelligence page.

---

## 2. Tenant Registry
**Route**: `/platform/tenants`  
**Purpose**: Global coordination and provisioning of tenant instances (ecosystem nodes).

### Fields
- **Entity Identity**: The unique name representing the business.
- **Blueprint**: The monetization strategy/plan currently assigned.
- **Utilization**: Total user count within the tenant.
- **Inception**: The timestamp of resource provisioning.
- **State**: `ACTIVE` or `SUSPENDED`.

### Buttons & Actions
- **Provision Node**: Opens a modal to deploy a new tenant.
- **Modify Blueprint**: Reassign the subscription plan for a tenant.
- **Suspend Node**: Execute immediate resource isolation for a tenant.
- **Reactivate Node**: Restore access and resources for a suspended tenant.
- **Audit Logs**: View high-fidelity logs for a specific tenant.

---

## 3. Subscription Lifecycle
**Route**: `/platform/subscriptions`  
**Purpose**: Manage billing resonance and ecosystem lifecycle overrides.

### Fields
- **Tenant Entity**: The target business for the subscription.
- **Active Strategy**: The current pricing tier.
- **Next Pulse**: The upcoming billing date.

### Actions
- **Kill Switch**: Terminate a subscription immediately.
- **Force Renewal**: Manually trigger a billing cycle renewal.
- **Override Billing**: Manually adjust billing parameters for a tenant.

---

## 4. Revenue & Intelligence
**Route**: `/platform/revenue`  
**Purpose**: Financial health monitoring and expansion analysis.

### Fields
- **Growth Trajectory**: Historical monthly performance aggregation chart.
- **Expansion Pulse**: Metrics for conversion velocity and churn sensitivity.
- **Global Transaction Feed**: Live log of all billing operations.

### Actions
- **Sync Stats**: Manually trigger a synthesis of financial intelligence.
- **Export**: Download transaction data for external auditing.

---

## 5. Support & Concierge
**Route**: `/platform/support`  
**Purpose**: Managed system-level ticketing for tenant assistance.

### Fields
- **Ticket ID**: Unique reference for the support case.
- **Priority**: Scaled from `Low` to `Critical`.
- **Origin**: Indicates if the issue started from a tenant or the internal system.

### Actions
- **Initiate Case**: Escalate a new issue to specialized support.
- **Update Status**: Move a ticket through `Open` to `Closed` lifecycle.

---

## 6. System Health
**Route**: `/platform/health`  
**Purpose**: Real-time monitoring of infrastructure and services.

### Fields
- **Database Status**: Health of the primary relational persistence layer.
- **Cache Service (Redis)**: Latency and health of the caching node.
- **System Metrics**: Live CPU, Memory, and Uptime reports.

### Actions
- **Refresh**: Trigger an immediate health telemetry scan.

---

## 7. API Keys
**Route**: `/platform/api-keys`  
**Purpose**: Manage programmatic access tokens for third-party integrations.

### Fields
- **Owner**: The identity authorized by the key.
- **Usage Telemetry**: Detailed metrics on request volume and error rates.

### Actions
- **Generate New Key**: Provision a new secure cryptographic token.
- **View Telemetry**: Open high-fidelity usage analytics.

---

## 8. System Accountability (Audit Logs)
**Route**: `/platform/audit-logs`  
**Purpose**: Immutable records of every administrative action taken on the platform.

### Fields
- **Actor / Scope**: The administrator who initiated the action.
- **Operation**: The exact change executed (e.g., `CREATE_TENANT`).
- **Resource Target**: The entity affected by the operation.

### Actions
- **JSON Export**: Export full audit trails for compliance reporting.
