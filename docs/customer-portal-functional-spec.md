# Customer Portal — Functional Specification

## Module Overview

The Customer Portal is a B2B self-service interface designed for business clients (wholesale buyers) to manage their commercial relationship with a tenant. It provides order placement and tracking, real-time inventory visibility, financial account management, and collaborative substitution workflows — all scoped strictly to the authenticated business client's data.

### 1. Dashboard

**Purpose**: Aggregated overview of the business client's activity and account health.
**Actors**: Business Client User.
**Key Capabilities**:

- **KPI Summary**: Real-time display of Pending Orders, Total Spent, Pending Substitutions, and Available Credit.
- **Recent Orders Feed**: Latest 5 orders with status indicators for at-a-glance tracking.
- **Quick Navigation**: KPI cards link directly to their respective detail modules.
**Screens**: Portal Dashboard.
**APIs**: `GET /portal/orders`, `GET /portal/financials/balance`, `GET /portal/substitutions/pending`.

**Epic**: Business Client Dashboard
**Feature**: Aggregated Business Overview

| # | User Story | Acceptance Criteria |
|---|---|---|
| 1 | As a business client, I can see my pending order count on the dashboard. | Dashboard fetches `/portal/orders` and counts items with status `PENDING`. KPI card displays the count. |
| 2 | As a business client, I can see my total spend across all orders. | Dashboard sums `totalAmount` from all orders and displays the aggregate value. |
| 3 | As a business client, I can see how many substitution requests are awaiting my decision. | Dashboard fetches `/portal/substitutions/pending` and displays the array length. |
| 4 | As a business client, I can see my available credit from the dashboard. | Dashboard fetches `/portal/financials/balance` and displays `availableCredit`. |
| 5 | As a business client, I can see my most recent orders in a table. | Dashboard displays the 5 most recent orders with order number, status, amount, and date. |
| 6 | As a business client, I can click a KPI card to navigate to its detail page. | Each KPI card links to `/procurement`, `/financials`, or `/substitutions`. |

---

### 2. Procurement (Order Management)

**Purpose**: Order placement, tracking, and history management.
**Actors**: Business Client User.
**Key Capabilities**:

- **Order Listing**: Full history of orders placed by the authenticated business client.
- **Client-Side Search**: Debounced filtering by order number or ID.
- **Status Tracking**: Visual badges for Pending, Shipped, Delivered, and Cancelled orders.
- **Order Detail Navigation**: Deep-link into individual order details.
**Screens**: Procurement List, Order Detail (placeholder).
**APIs**: `GET /portal/orders`, `GET /portal/orders/:id`, `POST /portal/orders`.

**Epic**: Order Management
**Feature**: Order History & Tracking

| # | User Story | Acceptance Criteria |
|---|---|---|
| 1 | As a business client, I can view all my orders in a table. | Page fetches `GET /portal/orders` and renders all orders scoped to `businessClientId`. |
| 2 | As a business client, I can search my orders by order number. | Search input filters the order list client-side with debounced matching on `orderNumber` or `id`. |
| 3 | As a business client, I can see the status of each order with a color-coded badge. | Status badges: Yellow=Pending, Blue=Shipped, Green=Delivered, Red=Cancelled. |
| 4 | As a business client, I can navigate to an order's detail page. | "Details" link navigates to `/procurement/:id`. |
| 5 | As a business client, I can refresh the order list manually. | Refresh button re-fetches the API and displays updated data. |
| 6 | As a business client, I see a meaningful error if the API fails. | Error banner displays the API error message with a "Retry" button. |
| 7 | As a business client, I see a loading spinner while data is being fetched. | Spinner animation shown in the table body during API request. |
| 8 | As a business client, I see an empty state when I have no orders. | Italic "No data available" message shown when the order list is empty. |

**Feature**: Order Placement

| # | User Story | Acceptance Criteria |
|---|---|---|
| 1 | As a business client, I can place a new order. | "New Order" button triggers `POST /portal/orders` with the authenticated client context. |
| 2 | As a business client, I cannot place an order on behalf of another client. | Backend rejects requests where `dto.businessClientId !== req.user.businessClientId`. |

---

### 3. Inventory (Product Catalog)

**Purpose**: Real-time product availability search scoped to the tenant's catalog.
**Actors**: Business Client User.
**Key Capabilities**:

- **Catalog Search**: Debounced search by product name, SKU, or brand.
- **Availability Display**: Real-time calculation of available stock (on-hand minus allocated).
- **Price Visibility**: Display of selling price per product.
- **KPI Cards**: Total available SKUs and low-stock item count.
**Screens**: Product Catalog.
**APIs**: `GET /portal/inventory?q=<query>&category=<categoryId>`.

**Epic**: Product Catalog Visibility
**Feature**: Inventory Search & Availability

| # | User Story | Acceptance Criteria |
|---|---|---|
| 1 | As a business client, I can search for products by name, SKU, or brand. | Search input sends `q` query parameter to `GET /portal/inventory` with 500ms debounce. |
| 2 | As a business client, I can see the available stock for each product. | Table column shows the aggregated `available` quantity across branches. |
| 3 | As a business client, I can see the price of each product. | Table column shows the `sellingPrice` from the tenant's inventory. |
| 4 | As a business client, I can see if a product is in stock or out of stock. | Green "In Stock" badge if available > 0; Red "Out of Stock" badge otherwise. |
| 5 | As a business client, I can see KPI cards showing total SKUs and low-stock items. | KPI cards dynamically count from the fetched product list. |

---

### 4. Financials (Account & Finance)

**Purpose**: Account balance visibility and invoice tracking.
**Actors**: Business Client User.
**Key Capabilities**:

- **Balance Overview**: Credit limit, current balance, available credit, and payment terms.
- **Invoice List**: Historical invoice listing with status tracking (Paid, Overdue, Pending).
- **Parallel Fetching**: Balance and invoices are fetched concurrently via `Promise.allSettled`.
**Screens**: Account & Finance.
**APIs**: `GET /portal/financials/balance`, `GET /portal/financials/invoices`.

**Epic**: Financial Account Management
**Feature**: Account Balance & Credit

| # | User Story | Acceptance Criteria |
|---|---|---|
| 1 | As a business client, I can see my credit limit. | Balance card displays `creditLimit` from `GET /portal/financials/balance`. |
| 2 | As a business client, I can see my current outstanding balance. | Balance card displays `currentBalance`. |
| 3 | As a business client, I can see how much credit I have available. | Balance card displays `availableCredit` = `creditLimit - currentBalance`. |
| 4 | As a business client, I can see my payment terms. | Balance card displays `paymentTerms` (e.g., "Net 30"). |

**Feature**: Invoice Tracking

| # | User Story | Acceptance Criteria |
|---|---|---|
| 1 | As a business client, I can view all my invoices. | Table fetches `GET /portal/financials/invoices` and displays invoice list. |
| 2 | As a business client, I can see the status of each invoice. | Color-coded badges: Green=Paid, Red=Overdue, Yellow=Pending. |
| 3 | As a business client, I see an empty state when there are no invoices. | "No invoices found" message displayed in the table body. |

---

### 5. Pricing & Quotes

**Purpose**: View applicable pricing rules and discount tiers.
**Actors**: Business Client User.
**Key Capabilities**:

- **Price Rule Listing**: View client-specific and global price rules with discount types and values.
- **Status Indicators**: Active/Inactive status for price rules.
- **Priority Ranking**: Rules displayed with their priority order.
**Screens**: Price Rules.
**APIs**: Internal tenant pricing engine (read-only for portal users).

**Epic**: Pricing Transparency
**Feature**: Price Rule Visibility

| # | User Story | Acceptance Criteria |
|---|---|---|
| 1 | As a business client, I can see what pricing rules apply to me. | Page lists price rules with name, discount type (Percentage/Fixed), value, and active status. |
| 2 | As a business client, I can see the priority of each pricing rule. | Priority column shows rule evaluation order. |

---

### 6. Substitutions

**Purpose**: Collaborative product substitution workflow between tenant and business client.
**Actors**: Business Client User, Tenant Warehouse Staff (initiator).
**Key Capabilities**:

- **Pending Queue**: List of substitution requests awaiting client decision.
- **Visual Comparison**: Side-by-side display of original product vs. proposed substitute.
- **Approve/Reject Actions**: Atomic approval or rejection with confirmation dialogs.
- **Real-Time Update**: Processed substitutions are removed from the list immediately.
**Screens**: Substitution Requests.
**APIs**: `GET /portal/substitutions/pending`, `PATCH /portal/substitutions/:id/approve`, `PATCH /portal/substitutions/:id/reject`.

**Epic**: Product Substitution Workflow
**Feature**: Substitution Decision Gateway

| # | User Story | Acceptance Criteria |
|---|---|---|
| 1 | As a business client, I can see all pending substitution requests for my orders. | Page fetches `GET /portal/substitutions/pending` filtered by `businessClientId`. |
| 2 | As a business client, I can see the original product and proposed substitute side-by-side. | Card layout shows original (red highlight) and substitute (green highlight) with product names. |
| 3 | As a business client, I can approve a substitution. | "Approve" button calls `PATCH /portal/substitutions/:id/approve` after confirmation dialog. Order item is updated to the substitute product. |
| 4 | As a business client, I can reject a substitution. | "Reject" button calls `PATCH /portal/substitutions/:id/reject` after confirmation dialog. Order item quantity is set to 0 (cancelled). |
| 5 | As a business client, I see the substitution removed from the list after my decision. | UI optimistically removes the card after successful API response. |
| 6 | As a business client, I see an empty state when there are no pending substitutions. | Empty state icon and message displayed when array is empty. |
| 7 | As a business client, I can see how many substitutions are pending in the header. | Counter badge shows `items.length` next to the page title. |

---

### 7. Localization & Experience

**Purpose**: Multi-lingual interface for Arabic and English users.
**Actors**: Business Client User.
**Key Capabilities**:

- **Language Switching**: Toggle between English (LTR) and Arabic (RTL).
- **Dictionary-Driven UI**: All displayed strings resolved from `en.json` / `ar.json` locale files.
- **RTL Mirroring**: Automatic layout adaptation using CSS logical properties.
- **Fallback Chain**: Arabic → English fallback for missing translation keys.
**Screens**: Integrated across all modules via Language Switcher in sidebar.

**Epic**: Localization
**Feature**: Bi-directional Language Support

| # | User Story | Acceptance Criteria |
|---|---|---|
| 1 | As a business client, I can switch the portal to Arabic. | Language switcher updates `dir` attribute to `rtl` and reloads all strings from `ar.json`. |
| 2 | As a business client, I see no hardcoded English strings in Arabic mode. | All visible text is sourced from the locale dictionary via `t()` function. |
| 3 | As a business client, I see the layout flip correctly in RTL mode. | Sidebar appears on the right; icons, margins, and paddings use logical properties (`me-`, `ms-`, `start`, `end`). |
