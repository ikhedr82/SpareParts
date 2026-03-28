# Partivo SaaS Billing - Production Hardening Specification

This document outlines the production-grade reliability features implemented in the Partivo billing system.

## 1. Webhook Reliability & Idempotency
- **Event Tracking**: Every incoming webhook (Stripe/Paymob) is logged in the `WebhookEvent` table before processing.
- **Idempotency**: Duplicate `eventId`s are rejected. If an event is already `PROCESSED`, it is skipped.
- **Error Handling**: Failed events are logged with error messages and marked as `FAILED`.
- **Scheduled Retries**: The `WebhookRetryService` runs every hour to re-process `PENDING` or `FAILED` events.

## 2. Financial Accuracy (VAT & Sequential Invoicing)
- **Sequential Numbering**: Invoices use a strictly sequential format `INV-YYYY-XXXXXX` managed atomically via the `InvoiceSequence` model.
- **VAT Support**: Tenants can have a configurable `vatPercentage`. If not set, it defaults to the platform standard.
- **Itemized Calculation**: Invoices clearly separate `subtotal`, `taxAmount` (VAT), and `total`.
- **PDF Generation**: The `InvoiceGeneratorService` produces legally compliant PDF invoices including tax details.

## 3. Subscription Lifecycle & Grace Periods
- **Grace Periods**: Configurable `gracePeriodDays` per tenant.
- **Dunning Process**: Daily checks for past-due invoices.
- **Status Progression**: `ACTIVE` -> `PAST_DUE` (Grace Period Active) -> `SUSPENDED` (Grace Period Expired).
- **Pro-rated Upgrades**: Immediate plan changes with partial credit.
- **Deferred Downgrades**: Downgrades scheduled for the end of the current billing cycle.

## 4. Reliable Notifications (BullMQ)
- **Queue-based System**: All billing emails are dispatched via BullMQ to avoid blocking the main thread and ensure delivery via retries.
- **Templates**: Localized (EN/AR) templates for:
  - Invoice Issuance
  - Payment Success/Failure
  - Subscription Expiry Alerts
  - Service Suspension Notices

## 5. Audit Logging
- **Immutable Trail**: All critical billing actions (suspensions, payment failures, plan changes) are recorded in `BillingAuditLog`.
- **Change History**: Detailed `SubscriptionChangeHistory` for auditing plan transitions.

## 6. Frontend Monitoring
- **Grace Period Banners**: Real-time alerts on the billing dashboard when a tenant enters the grace period.
- **Detailed History**: Expanded transaction archive with granular status tracking.
