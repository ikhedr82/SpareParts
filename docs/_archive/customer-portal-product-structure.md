# Customer Portal — Product Structure

## Epic: Order Management

### Feature: Order History & Tracking

- Story: Business client can view a complete history of all orders placed under their account.
- Story: Business client can search orders by order number or ID with debounced client-side filtering.
- Story: Business client can see color-coded status badges (Pending, Shipped, Delivered, Cancelled) for each order.
- Story: Business client can navigate to a detailed order view for any order.
- Story: Business client can manually refresh the order list to see the latest updates.

### Feature: Order Placement

- Story: Business client can place a new order through the portal interface.
- Story: System enforces that orders are scoped to the authenticated client and rejects cross-client order attempts.

---

## Epic: Product Catalog Visibility

### Feature: Inventory Search & Availability

- Story: Business client can search the tenant's product catalog by name, SKU, or brand.
- Story: Business client can see real-time available stock quantities aggregated across all branches.
- Story: Business client can see the selling price for each product.
- Story: Business client can see visual stock status indicators (In Stock / Out of Stock).
- Story: Business client can see KPI summary cards showing total available SKUs and low-stock alerts.

---

## Epic: Financial Account Management

### Feature: Account Balance & Credit

- Story: Business client can view their credit limit, current balance, and available credit.
- Story: Business client can view their payment terms (e.g., Net 30, Net 60).
- Story: Balance information is fetched from `GET /portal/financials/balance` and displayed in summary cards.

### Feature: Invoice Tracking

- Story: Business client can view a historical list of all invoices linked to their account.
- Story: Business client can see invoice status with color-coded badges (Paid, Overdue, Pending).
- Story: Invoice data is fetched from `GET /portal/financials/invoices` and displayed in a sortable table.

---

## Epic: Product Substitution Workflow

### Feature: Substitution Decision Gateway

- Story: Business client can view all pending substitution requests for their orders.
- Story: Business client can see the original product and proposed substitute displayed side-by-side.
- Story: Business client can approve a substitution, updating the order item to the substitute product.
- Story: Business client can reject a substitution, cancelling the affected order item.
- Story: Approve/Reject actions require explicit confirmation before execution.
- Story: Processed substitutions are removed from the pending list immediately.
- Story: Business client sees a counter showing the number of pending substitutions.

---

## Epic: Pricing & Quote Management

### Feature: Price Rule Visibility

- Story: Business client can view all pricing rules applicable to their account.
- Story: Business client can see discount types (Percentage or Fixed), values, and priority order.
- Story: Business client can distinguish between active and inactive pricing rules.

---

## Epic: Logistics Tracking

### Feature: Delivery Visibility

- Story: Business client can view the delivery status of shipped orders.
- Story: Business client can see trip details and stop information linked to their orders.
- Story: Delivery tracking data is available through the order detail view via `tripStops` relation.

---

## Epic: Localization & Experience

### Feature: Bi-directional Language Support

- Story: Business client can switch the portal between English (LTR) and Arabic (RTL).
- Story: All UI text is resolved from locale dictionaries with 1:1 key parity.
- Story: Layout, icons, and navigation automatically mirror for RTL languages using CSS logical properties.
- Story: Language preference is persisted in localStorage and restored on subsequent visits.

---

## Epic: Portal Dashboard

### Feature: Aggregated Business Overview

- Story: Business client can see a unified dashboard with KPI cards for Pending Orders, Total Spent, Pending Substitutions, and Available Credit.
- Story: Business client can see the 5 most recent orders in a quick-reference table.
- Story: KPI cards serve as navigation shortcuts to their respective detail modules.
- Story: Dashboard gracefully handles partial API failures, displaying available data even if one endpoint fails.
