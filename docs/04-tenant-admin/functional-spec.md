# Tenant Admin Portal — Functional Specification

## Overview
The Tenant Admin Portal is the primary ERP back-office system for spare parts retailers. It provides complete operational control over inventory, sales, procurement, logistics, finance, and CRM.

## User Roles
- **Owner**: Full access to all tenant modules.
- **Manager**: Branch management, financial reports, user management.
- **Clerk**: Day-to-day operations (inventory, sales, orders).

## Functional Modules

### 1. Dashboard (`/tenant/`)
- **KPI Cards**: Total inventory value, today's sales, pending orders, active drivers.
- **Sales Chart**: Revenue over time (daily/weekly/monthly).
- **Quick Actions**: Create sale, create order, check inventory.
- **Recent Activity**: Latest sales, orders, and stock changes.

### 2. Inventory Management (`/tenant/inventory/`)
- **Inventory List**: All products with stock levels per branch.
  - Columns: Product, Brand, Branch, Quantity, Allocated, Available, Selling Price, Cost Price, Barcode, Bin Location.
  - Actions: Edit price, adjust quantity, view ledger.
- **Stock Adjustments**: Manual stock corrections with reason codes.
- **Branch Transfers**: Request/approve inter-branch stock movements.
- **Inventory Ledger**: Immutable log of all stock changes.

### 3. Sales Management (`/tenant/sales/`)
- **Sales List**: All POS counter sales.
  - Columns: Sale ID, Date, Branch, Customer, Total, Status, Payment Method.
  - Filters: Date range, Branch, Status.
- **Sale Detail**: Line items, payments, invoices, associated returns.
- **Void Sale**: Cancel a completed sale with reason.

### 4. Customer Management (`/tenant/customers/`)
- **Customer List**: B2C end customers.
  - Fields: Name, Phone, Email, Balance.
- **Customer Detail**: Purchase history, balance statement.

### 5. B2B Client Management (`/tenant/billing/` section)
- **Business Client List**: B2B workshops and retailers.
  - Fields: Business Name, Type (Workshop/Retailer), Contact, Credit Limit, Current Balance, Status.
- **Client Detail**: Addresses, contacts, orders, quotes, invoices, credit account.
- **Price Rules**: Client-specific or tier-based pricing rules.

### 6. Orders & Quotes (`/tenant/quotes/`)
- **Quote List**: Sales quotations with lifecycle tracking.
  - Statuses: DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED, CONVERTED.
- **Order Processing**: From quote acceptance→ order confirmation → pick → pack → dispatch → delivery.

### 7. Procurement (`/tenant/purchase-orders/`)
- **Purchase Order List**: Orders to suppliers.
  - Statuses: DRAFT, ORDERED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED.
- **Goods Receiving**: Record received items against PO line items.
- **Purchase Returns**: Return defective items to suppliers.

### 8. Warehouse Operations (`/tenant/warehouse/`)
- **Pick Lists**: Warehouse picking assignments for confirmed orders.
- **Pack Management**: Group picked items into shipping packs.
- **Stock Lookup**: Quick product search with branch-level stock visibility.

### 9. Logistics (`/tenant/logistics/`)
- **Delivery Trip Management**: Plan and track delivery routes.
- **Driver Management**: Register and manage fleet drivers.
- **Vehicle Management**: Fleet vehicles with capacity tracking.
- **Shipment Manifests**: Create manifests grouping orders for dispatch.
- **Trip Tracking**: Real-time trip status updates from driver app.
- **Delivery Exceptions**: Handle failed deliveries, chargebacks.

### 10. Returns Management (`/tenant/returns/`)
- **Return Requests**: Process customer return requests.
  - Workflow: REQUESTED → APPROVED → IN_TRANSIT → RECEIVED → INSPECTED → COMPLETED.
- **Refund Processing**: Financial refunds linked to returns.
- **Chargeback Management**: Dispute resolution for delivery issues.

### 11. Finance & Accounting (`/tenant/finance/`)
- **Chart of Accounts**: General ledger account management.
- **Journal Entries**: Double-entry bookkeeping with posting workflow.
- **Accounting Periods**: Period close management.
- **Tax Rates**: Configure VAT/tax rates.
- **Tax Filings**: Prepare and track VAT filings.
- **Supplier Invoices**: AP invoice matching against purchase orders.

### 12. Analytics (`/tenant/analytics/`)
- **Sales Analytics**: Revenue trends, top products, branch comparison.
- **Inventory Analytics**: Stock aging, turnover rates.

### 13. User Management (`/tenant/users/`)
- **User List**: Manage tenant staff.
- **Role Assignment**: Assign predefined roles to users at tenant or branch level.

### 14. Branch Management (`/tenant/branches/`)
- **Branch List**: All retail locations.
  - Fields: Name, Name (AR), Address, Phone.
- **Branch Detail**: Associated inventory, users, cash sessions.

### 15. Supplier Management (`/tenant/suppliers/`)
- **Supplier List**: Vendor records.
  - Fields: Name, Balance, linked products and POs.

### 16. CRM (`/admin-panel/crm/`)
- **Leads**: Track prospective B2B clients.
- **Opportunities**: Sales pipeline management.
- **Activities**: Log calls, meetings, emails against clients.
- **Notes**: Attach contextual notes to client records.
- **Credit Accounts**: Manage B2B credit limits and balances.
