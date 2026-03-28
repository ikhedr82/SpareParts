# Audit Logging

## Overview
Partivo maintains a comprehensive audit trail of all significant operations via the `AuditLog` model.

## What Is Logged
Every CREATE, UPDATE, and DELETE operation on business entities is recorded.

## AuditLog Fields
| Field | Type | Description |
|---|---|---|
| `id` | UUID | Log entry identifier |
| `tenantId` | UUID | Tenant context (null for platform-level actions) |
| `userId` | UUID | User who performed the action |
| `action` | String | CREATE, UPDATE, DELETE |
| `entityType` | String | Model name (e.g., "Sale", "Order", "Inventory") |
| `entityId` | UUID | Specific record identifier |
| `oldValue` | JSON | Previous state (for updates) |
| `newValue` | JSON | New state |
| `ipAddress` | String | Client IP address |
| `correlationId` | String | Groups related operations |
| `createdAt` | DateTime | Timestamp |

## Access
- Platform Admins access logs via `/platform/audit-logs/`.
- Tenant Admins access their tenant's logs via the Tenant Admin portal.
- Logs are **immutable** — they cannot be edited or deleted.

## Indexing
Audit logs are indexed on:
- `(tenantId, entityType, entityId)` — for entity history lookups.
- `(tenantId, userId)` — for user activity auditing.
- `(tenantId, createdAt)` — for time-range queries.

## Transactional Outbox Pattern
For cross-system events, Partivo uses the `OutboxEvent` model:
- Events are written to the outbox table within the same database transaction as the business operation.
- A background processor reads and dispatches outbox events.
- This ensures at-least-once delivery of async events without distributed transactions.
