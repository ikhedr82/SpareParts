# Tenant Admin Portal — Product Structure

## Epic: Sales & Point of Sale

### Feature: Transaction Management

- Story: Tenant user can record a new sale with line items, customer, and payment method.
- Story: Tenant user can search sales by sale ID or customer name with debounced filtering.
- Story: Tenant user can void a completed sale with a confirmation dialog and audit trail.
- Story: Tenant user can process a full refund for a completed sale.
- Story: Tenant user can see color-coded status badges (Completed, Refunded, Voided, Pending).

### Feature: Cash Session Management

- Story: Tenant user can open a cash session to begin POS operations at a branch.
- Story: Tenant user can close a cash session with a final count reconciliation.

---

## Epic: Inventory Management

### Feature: Stock Visibility & Search

- Story: Tenant user can view all inventory items across branches with on-hand, allocated, and available quantities.
- Story: Tenant user can search inventory by product name, SKU, or branch with debounced filtering.
- Story: Tenant user can see paginated results with page navigation controls.

### Feature: Stock Adjustments

- Story: Tenant user can adjust stock quantities (increase/decrease) with a mandatory reason field.
- Story: Tenant user must confirm the adjustment in a modal before execution.
- Story: Every stock adjustment creates an audit log entry for accountability.

---

## Epic: Warehouse Operations

### Feature: Pick List Management

- Story: Warehouse staff can view pick lists generated from confirmed orders.
- Story: Warehouse staff can mark individual pick list items as picked.

### Feature: Packing & Dispatch

- Story: Warehouse staff can seal packs for completed pick lists.
- Story: Warehouse staff can view pack details including items and destination.

---

## Epic: Logistics & Delivery

### Feature: Trip Planning & Dispatch

- Story: Tenant user can create a new delivery trip with driver assignment and fulfillment mode.
- Story: Tenant user can view all trips with status, driver, and stop count.
- Story: Tenant user can search trips by ID or driver name.

### Feature: Trip Execution

- Story: Tenant user can dispatch a planned trip to begin delivery.
- Story: Tenant user can mark a trip as completed after all stops are delivered.
- Story: Tenant user can view failed deliveries in a dedicated filtered view.

### Feature: Fulfillment Modes

- Story: System supports Internal Fleet, External Courier, Customer Pickup, and Third Party Driver modes.
- Story: Tenant user can see fulfillment mode badges on each trip record.

---

## Epic: Purchase Order Management

### Feature: Supplier Ordering

- Story: Tenant user can create a new purchase order with supplier selection and line items.
- Story: Tenant user can view all purchase orders with status and total cost.
- Story: Tenant user can search purchase orders by supplier or ID.

### Feature: Goods Reception

- Story: Tenant user can receive goods against a purchase order, updating inventory automatically.
- Story: Tenant user can view purchase order details including line items and delivery status.

---

## Epic: Returns Management

### Feature: Return-to-Vendor (RTV)

- Story: Tenant user can create a return request against a purchase order.
- Story: Tenant user can view all returns with status badges (Requested, Approved, Rejected, Shipped, Completed, Cancelled).
- Story: Tenant user can search returns by return ID or PO reference.
- Story: Tenant user can view return details including line items and approval status.

---

## Epic: Quotes & Estimates

### Feature: Quote Lifecycle

- Story: Tenant user can create a new quote with customer, line items, and validity period.
- Story: Tenant user can view all quotes with status (Draft, Sent, Accepted, Rejected, Expired, Converted).
- Story: Tenant user can send a draft quote to the customer.
- Story: Tenant user can convert an accepted quote into an order.
- Story: Tenant user can search quotes by number or customer name.

---

## Epic: Customer Management

### Feature: Customer Registry

- Story: Tenant user can create a new business client with name, contact info, and balance.
- Story: Tenant user can edit existing customer records.
- Story: Tenant user can delete a customer with a confirmation dialog.
- Story: Tenant user can view all customers with contact and balance columns.

---

## Epic: Supplier Management

### Feature: Supplier Registry

- Story: Tenant user can create a new supplier with name, contact info, and balance.
- Story: Tenant user can edit existing supplier records.
- Story: Tenant user can delete a supplier with a confirmation dialog.
- Story: Tenant user can view all suppliers in a searchable list.

---

## Epic: Financial Controls

### Feature: Invoice Management

- Story: Tenant user can view all invoices with status filtering (Paid, Unpaid, Void).
- Story: Tenant user can search invoices by invoice number or date.

### Feature: Tax Configuration

- Story: Tenant user can add, edit, and delete tax rates with name and percentage.
- Story: Tenant user can see active tax rates applied across the platform.

### Feature: Financial Reporting

- Story: Tenant user can access VAT, Profit & Loss, and Aging reports.
- Story: Tenant user can view Chart of Accounts, Journal Entries, and Accounting Periods.

---

## Epic: Analytics & Business Intelligence

### Feature: Performance Dashboards

- Story: Tenant user can view KPI cards for Total Revenue, Total Sales, Average Order Value, and Total Customers.
- Story: Tenant user can view a Revenue Trend line chart over time.
- Story: Tenant user can view a Sales by Branch bar chart.
- Story: Tenant user can view a Top Products table ranked by units sold.

---

## Epic: Branch Management

### Feature: Multi-Location Operations

- Story: Tenant user can create new branches with name, address, and phone.
- Story: Tenant user can view all branches with plan-based usage limits.
- Story: System enforces branch limits based on the tenant's subscription plan.

---

## Epic: User Management

### Feature: Team Access Control

- Story: Tenant admin can add new users with role assignment (Tenant Admin, Tenant User, Warehouse Manager, Sales Rep).
- Story: Tenant admin can view all team members with role and status.
- Story: System enforces user limits based on the tenant's subscription plan.

---

## Epic: Billing & Subscription

### Feature: Plan Management

- Story: Tenant admin can view their current subscription plan and usage statistics.
- Story: Tenant admin can upgrade or change their subscription plan.
- Story: Tenant admin can view billing history and payment status.

---

## Epic: Tenant Dashboard

### Feature: Operational Overview

- Story: Tenant user can see KPI cards for Total Revenue, Total Sales, Average Order Value, and Gross Sales.
- Story: Tenant user can view a Daily Sales Trend chart.
- Story: Tenant user can view Cash vs Card payment breakdown.
- Story: Tenant user can view Branch Performance comparison.
- Story: Tenant user can see quick stats for Open Cash Sessions, Unpaid Invoices, and Stock Alerts.

---

## Epic: Localization & Experience

### Feature: Bi-directional Language Support

- Story: Tenant user can switch the portal between English (LTR) and Arabic (RTL).
- Story: All UI text is resolved from locale dictionaries with 1:1 key parity (700+ keys).
- Story: Layout, icons, and navigation automatically mirror for RTL languages using CSS logical properties.
- Story: Language preference is persisted in localStorage and restored on subsequent visits.
- Story: System falls back to English translations when Arabic keys are missing.
