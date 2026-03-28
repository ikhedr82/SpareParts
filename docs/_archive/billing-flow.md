# Partivo SaaS Billing Flow

## 1. Subscription Creation

```mermaid
sequenceDiagram
    participant T as Tenant Admin
    participant P as Partivo API
    participant G as Payment Gateway (Stripe/Paymob)
    
    T->>P: POST /billing/checkout (planId, provider)
    P->>G: Create Session
    G-->>P: Session URL
    P-->>T: Redirect URL
    T->>G: User completes payment
    G->>P: Webhook: checkout.session.completed
    P->>P: Update Tenant Subscription Status: ACTIVE
```

## 2. Invoicing & Renewal

- `Cron Job` runs every hour.
- Identifies expiring subscriptions.
- Creates `BillingInvoice` (ISSUED).
- Triggers `Charge` via Stripe/Paymob.
- Success -> Webhook `invoice.paid` -> `invoiceNumber` Generated.

## 3. Dunning & Suspension (Failed Payments)

```mermaid
graph TD
    A[Payment Failed] --> B[Retry 1 + Email Reminder]
    B --> C{Success?}
    C -- Yes --> D[Mark PAID]
    C -- No --> E[Retry 2 + Email Reminder]
    E --> F{Success?}
    F -- Yes --> D
    F -- No --> G[Final Retry]
    G --> H{Success?}
    H -- Yes --> D
    H -- No --> I[Tenant Status: SUSPENDED]
    I --> J[Email: Service Interruption]
```

## 4. Self-Service Portal

- `GET /billing/plan`: Returns active plan and usage.
- `GET /billing/invoices`: List history.
- `GET /billing/invoices/:id/pdf`: Direct PDF download.
- `PATCH /billing/subscription`: Update plan (Stripe/Paymob portal redirect).
