# Partivo SaaS Billing Specification

## Overview

Partivo uses a multi-tenant billing system that supports both Global (Stripe) and Egypt-specific (Paymob) payment gateways.

## Core Models

### Plan

Defines features, price, and limits.

- `price`: Monthly/Yearly cost.
- `limits`: JSON defining max users, branches, products, etc.

### Subscription
The active link between a Tenant and a Plan.
- `status`: TRIAL, ACTIVE, PAST_DUE, UNPAID, CANCELED.
- `provider`: STRIPE or PAYMOB.

### BillingInvoice
Record of a payment request.
- `status`: DRAFT, ISSUED, PAID, FAILED.
- `invoiceNumber`: Unique ID for accounting.

## Features

### checkout

Endpoint: `POST /api/billing/checkout`

Creates a session for Stripe or a Payment Key for Paymob.

### webhook

Endpoint: `POST /api/billing/webhook/[stripe|paymob]`

Handles asynchronous payment notifications.

- `invoice.paid` -> Updates status to PAID.
- `invoice.payment_failed` -> Starts Dunning process.

### Dunning System
Automated retries for failed payments:
1.  **Day 1-3**: Retry and notify via email.
2.  **Day 7**: Final retry and account suspension if failed.

### Invoicing
PDF invoices are generated on-demand or upon payment success using `pdfkit`.
Accessible via `GET /api/billing/invoices/:id/pdf`.
