# POS App — Functional Specification

## Overview
The POS (Point of Sale) App is a React Native mobile/tablet application designed for high-speed counter sales at spare parts retail branches. It is the primary revenue-generating interface and is built for **offline-first** operation.

## User Role
- **Cashier/Counter Staff**: Authenticated tenant user with POS permissions assigned to a specific branch.

## Screens & Capabilities

### 1. Login (`POSLoginScreen`)
- Email/password authentication.
- Branch selection for multi-branch users.
- Validates user has POS access permissions.

### 2. Home (`POSHomeScreen`)
- Active cash session display (opening cash, current totals).
- Quick action buttons: New Sale, Product Search, Sales History.
- Cash session management: Open Session, Close Session.
- Sync status indicator showing offline queue status.

### 3. Product Search (`ProductSearchScreen`)
- Search by: Product name, part number, barcode, brand.
- Vehicle fitment lookup: Make → Model → Year → Compatible parts.
- Results show: Product name, brand, price, stock availability at current branch.
- Tap product to add to cart.

### 4. Cart (`CartScreen`)
- Active sale line items.
- For each item: Product name, quantity (editable), unit price, line total.
- Cart totals: Subtotal, VAT (if applicable), Grand Total.
- Remove items with swipe gesture.
- Customer selection (optional): Link sale to a registered customer.

### 5. Checkout (`CheckoutScreen`)
- Payment method selection: CASH, CARD, TRANSFER.
- Split payment support: Accept partial payments across methods.
- For CASH: Enter tendered amount, calculate change.
- For CARD/TRANSFER: Record reference number.
- Complete sale → Creates `Sale`, `SaleItem`, `Payment`, deducts `Inventory`.
- Print/share receipt option.

### 6. Sales History (`SalesHistoryScreen`)
- List of completed sales for the current session/day.
- Filters: Date, status.
- Tap to view sale details.
- Void sale capability with reason.

## Cash Session Management

### Open Session
| Field | Type | Validation |
|---|---|---|
| Opening Cash | Currency | Required, ≥ 0 |

### Close Session
| Field | Type | Description |
|---|---|---|
| Closing Cash | Currency | Actual cash in register |
| Expected Cash | Auto-calculated | Opening + Cash Sales − Cash Refunds |
| Difference | Auto-calculated | Closing − Expected (surplus/shortage) |

## Offline Capabilities
- All sales, payments, and inventory changes persist to local SQLite.
- Sync queue processes when online.
- Each record tagged with `offlineSyncId` for idempotent server-side processing.
- Cash sessions can be opened and closed entirely offline.
