# Governance & Master Data Definitions

## 1. Product & Pricing Management

**Goal**: Manage the global catalog, define pricing strategies (B2B/B2C), and handle quotes/substitutions.

### 1.1 Use Cases

| ID | Use Case | Actor | Description |
| :--- | :--- | :--- | :--- |
| PPM-01 | Create Global Product | Platform Admin | Define a new product in the global catalog (Master Data). |
| PPM-02 | Define Price Rule | Tenant Admin | Create rules for markups, margins, or discounts based on Brand/Category/Client. |
| PPM-03 | Manage Product Substitution | Tenant User | Link interchangeable products (Original <-> Substitute) with confidence scores. |
| PPM-04 | Generate B2B Quote | Sales Rep | Create a custom price quote for a business client. |
| PPM-05 | Convert Quote to Order | Sales Rep | Finalize a quote and generate a sales order. |
| PPM-06 | Manage Price Tiers | Tenant Admin | Define specific price lists assignable to Business Clients. |

### 1.2 UI Screens

| Screen ID | Screen Name | Platform | Description |
| :--- | :--- | :--- | :--- |
| SCR-PPM-01 | Product Master List | Admin Console | List all global products with filters (Brand, Category). |
| SCR-PPM-02 | Product Detail View | Admin Console | View/Edit product specs, images, and fitment. |
| SCR-PPM-03 | Price Rule Manager | Admin Console | List and create pricing logic (e.g., "Bosch +20%"). |
| SCR-PPM-04 | Quote Dashboard | Web Portal | List active/expired quotes. |
| SCR-PPM-05 | Quote Builder | Web Portal | Add items to a quote, apply discretionary discounts. |
| SCR-PPM-06 | Substitution Matrix | Admin Console | UI to manage product interchangeability links. |

### 1.3 Required Fields (Key Entities)

**Entity: Product** (`products`)

- `name` (String, Unique): Official product name.
- `brandId` (UUID): Reference to Brand.
- `categoryId` (UUID): Reference to Category.
- `unitOfMeasure` (Enum): EA, SET, etc.
- `status` (Enum): ACTIVE, DISCONTINUED.

**Entity: PriceRule** (`price_rules`)

- `name` (String): Rule name (e.g., "Silver Tier Markup").
- `type` (Enum): MARKUP, MARGIN, FIXED, DISCOUNT.
- `value` (Decimal): The amount/percentage.
- `priority` (Int): Execution order (0 = Highest).
- `scope`: `brandId` OR `categoryId` OR `productId`.

**Entity: Quote** (`quotes`)

- `quoteNumber` (String, Unique): Q-2024-XXXX.
- `businessClientId` (UUID): Who the quote is for.
- `validUntil` (Date): Expiry.
- `status` (Enum): DRAFT, SENT, ACCEPTED.

### 1.4 State Transitions

**Quote Lifecycle**
`DRAFT` -> `SENT` (Email Trigger) -> `ACCEPTED` (Customer Action) -> `CONVERTED` (Order Created).
`SENT` -> `REJECTED`.
`SENT` -> `EXPIRED` (Time elapsed).

### 1.5 Permissions

| Permission Code | Description | Role |
| :--- | :--- | :--- |
| `MANAGE_CATALOG` | Create/Edit Global Products | Platform Admin |
| `MANAGE_PRICING` | Create/Edit Price Rules | Tenant Admin |
| `VIEW_COST_PRICE` | See product cost vs selling price | Manager, Admin |
| `CREATE_QUOTE` | Generate quotes for clients | Sales Rep |
| `APPROVE_QUOTE` | Approve discounts > X% | Sales Manager |

### 1.6 Entity Mapping

- **Product**: `Product` (Global), `ProductFitment`, `AlternatePartNumber`.
- **Pricing**: `PriceRule`, `TaxRate` (Linked via Product).
- **Quote**: `Quote`, `QuoteItem`.
- **Substitution**: `Substitution`.

### 1.7 Commercial Laws

- **Revenue Integrity**: Prices on Quotes must be respected upon conversion, even if global prices change. (Snapshot pricing).
- **Audit**: All Price Rule changes must be logged in `AuditLog`.

---

## 2. Chart of Accounts & Tax Configuration

**Goal**: Maintain the financial backbone, ensuring accurate ledger posting and tax compliance.

### 2.1 Use Cases

| ID | Use Case | Actor | Description |
| :--- | :--- | :--- | :--- |
| FIN-01 | Maintain Chart of Accounts | Financial Admin | Add/Edit GL Accounts (Asset, Liability, Equity, Revenue, Expense). |
| FIN-02 | Configure Tax Rates | Admin | Define VAT/Sales Tax percentages and rules. |
| FIN-03 | Close Accounting Period | Financial Controller | Lock a period to prevent further postings. |
| FIN-04 | Audit Tax Configuration | Auditor | Review tax rate changes and application history. |

### 2.2 UI Screens

| Screen ID | Screen Name | Platform | Description |
| :--- | :--- | :--- | :--- |
| SCR-FIN-01 | Chart of Accounts Master | Finance Dashboard | Tree view of all GL accounts. |
| SCR-FIN-02 | Tax Configuration | Admin Console | List active tax rates and rules. |
| SCR-FIN-03 | Period Manager | Finance Dashboard | View open/closed periods and perform closing. |

### 2.3 Required Fields

**Entity: ChartOfAccount** (`chart_of_accounts`)

- `code` (String): GL Code (e.g., 1000).
- `name` (String): Account Name.
- `type` (Enum): ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE.
- `isSystem` (Boolean): Prevent deletion of core accounts.

**Entity: AccountingPeriod** (`accounting_periods`)

- `startDate` (Date): Period start.
- `endDate` (Date): Period end.
- `isClosed` (Boolean): Locked status.

### 2.4 State Transitions

**AccountingPeriod**
`OPEN` -> `CLOSED` (Trigger: Period Close Action).
*Note: Re-opening a period is a restricted action requiring audit.*

### 2.5 Permissions

| Permission Code | Description | Role |
| :--- | :--- | :--- |
| `MANAGE_FINANCE` | Edit CoA and Tax Rates | Financial Admin |
| `CLOSE_PERIOD` | Lock accounting periods | Financial Controller |

### 2.6 Entity Mapping

- **GL**: `ChartOfAccount`, `JournalEntry`, `JournalLine`.
- **Tax**: `TaxRate`, `InvoiceLine` (stores applied tax).
- **Period**: `AccountingPeriod`.

### 2.7 Commercial Laws

- **Immutable History**: Once a period is closed, `isClosed` prevents any new `JournalEntry` with a date in that period.
- **Tax Compliance**: All sales must reference a valid `TaxRate` at time of transaction.

---

## 3. Branch & Warehouse Setup

**Goal**: configure physical locations and inventory storage parameters.

### 3.1 Use Cases

| ID | Use Case | Actor | Description |
| :--- | :--- | :--- | :--- |
| OPS-01 | Create Branch Location | Admin | Define a new physical branch or warehouse. |
| OPS-02 | Manage Warehouse Layout | Warehouse Mgr | Define zones and bin locations. |
| OPS-03 | Assign Users to Branch | Admin | Restrict user access to specific branch data. |

### 3.2 UI Screens

| Screen ID | Screen Name | Platform | Description |
| :--- | :--- | :--- | :--- |
| SCR-OPS-01 | Branch List | Admin Console | List all branches/warehouses. |
| SCR-OPS-02 | Branch Details | Admin Console | Edit address, phone, and type. |
| SCR-OPS-03 | Warehouse Layout | Warehouse App | Manage bin locations (virtual or physical). |

### 3.3 Required Fields

**Entity: Branch** (`branches`)

- `name` (String): Branch name.
- `address` (String): Physical address.
- `phone` (String): Contact number.
- `tenantId` (UUID): Owner.

### 3.4 State Transitions

**Branch Status**
`ACTIVE` -> `INACTIVE` (Soft delete, historical data preserved).

### 3.5 Permissions

| Permission Code | Description | Role |
| :--- | :--- | :--- |
| `MANAGE_BRANCH` | Create/Edit Branches | Admin |
| `VIEW_INVENTORY` | View stock levels | Staff |

### 3.6 Entity Mapping

- **Location**: `Branch`.
- **Storage**: `Inventory.binLocation` (Simple string) -> Planned upgrade to `BinLocation` model in future.
- **Stock**: `Inventory`.

### 3.7 Commercial Laws

- **Inventory Integrity**: Stock must physically exist at the assigned Branch. Transfers must explicitly move stock between Branches.

---

## 4. Payment Gateway & Webhook Monitoring

**Goal**: Ensure secure payment processing and reconciliation.

### 4.1 Use Cases

| ID | Use Case | Actor | Description |
| :--- | :--- | :--- | :--- |
| PAY-01 | Configure Gateway Keys | Admin | Set Stripe API keys (Test/Prod). |
| PAY-02 | Monitor Payment Logs | Fin/Tech Support | View success/failure events from Stripe. |
| PAY-03 | Reconcile Cash Sessions | Store Mgr | Verify cash drawer against recorded sales. |

### 4.2 UI Screens

| Screen ID | Screen Name | Platform | Description |
| :--- | :--- | :--- | :--- |
| SCR-PAY-01 | Gateway Settings | Admin Console | Input API keys and Webhook secrets. |
| SCR-PAY-02 | Payment Event Log | Admin Console | Raw view of webhook events for debugging. |
| SCR-PAY-03 | Cash Session History | POS/Dashboard | List of open/closed sessions with variances. |

### 4.3 Required Fields

**Entity: StripePayment** (`stripe_payments`)

- `paymentIntentId`: Stripe reference.
- `status`: PENDING, SUCCEEDED, FAILED.
- `amount`: Transaction value.

**Entity: CashSession** (`cash_sessions`)

- `openingCash`: Count at start.
- `closingCash`: Count at end.
- `difference`: Variance (Expected - Actual).

### 4.4 State Transitions

**Payment**
`PENDING` -> `SUCCEEDED` (Webhook) -> `COMPLETED` (Order Confirmed).
`PENDING` -> `FAILED` (Webhook).

**Cash Session**
`OPEN` -> `CLOSED` (Trigger: End of Day).

### 4.5 Permissions

| Permission Code | Description | Role |
| :--- | :--- | :--- |
| `MANAGE_PAYMENTS` | Configure Gateways | Admin |
| `VIEW_SENSITIVE_DATA` | See partial card info | Financial Admin |

### 4.6 Entity Mapping

- **Gateway**: `StripePayment`.
- **Session**: `CashSession`.
- **Transaction**: `Payment`.

### 4.7 Commercial Laws

- **PCI Compliance**: No raw credit card data stored. Only tokens/references (`paymentIntentId`).
- **Revenue Integrity**: `Payment` total must match `Sale` total for completion.

---

## 5. Centralized Approval Inbox

**Goal**: A unified view for approving sensitive business actions.

### 5.1 Use Cases

| ID | Use Case | Actor | Description |
| :--- | :--- | :--- | :--- |
| APR-01 | Approve High-Value Quote | Sales Manager | Authorize discounts exceeding representative limits. |
| APR-02 | Approve Purchase Order | Finance Mgr | Authorize outgoing POs defined by cost thresholds. |
| APR-03 | Approve Refund | Store Mgr | Authorize refunds, especially without receipts or high value. |

### 5.2 UI Screens

| Screen ID | Screen Name | Platform | Description |
| :--- | :--- | :--- | :--- |
| SCR-APR-01 | Approval Inbox | Admin/Dashboard | Filterable list of pending requests (Quotes, POs, Refunds). |
| SCR-APR-02 | Request Detail | Admin/Dashboard | Context view (e.g., PO details) with Approve/Reject actions. |

### 5.3 Required Fields

*Virtual Aggregate of:*

- `PurchaseOrder.status` = `DRAFT` / `PENDING_APPROVAL`.
- `Quote.status` = `DRAFT` (Internal) -> `APPROVED` -> `SENT`.
- `Refund.status` = `PENDING` -> `APPROVED`.

### 5.4 State Transitions

**Generic Request**
`PENDING` -> `APPROVED` -> `EXECUTED`.
`PENDING` -> `REJECTED`.

### 5.5 Permissions

| Permission Code | Description | Role |
| :--- | :--- | :--- |
| `APPROVE_PURCHASE` | Approve POs | Finance Manager |
| `APPROVE_DISCOUNT` | Approve Quote Discounts | Sales Manager |
| `APPROVE_REFUND` | Approve Refunds | Store Manager |

### 5.6 Entity Mapping

- **Source Entities**: `PurchaseOrder`, `Quote`, `Refund`, `Return`.

### 5.7 Commercial Laws

- **Segregation of Duties**: The user creating a request (e.g., PO) should ideally not be the one approving it, enforced via permissions.

---

## 6. Multi-Currency & FX Management

**Goal**: Manage international procurement and financial reporting.

### 6.1 Use Cases

| ID | Use Case | Actor | Description |
| :--- | :--- | :--- | :--- |
| FX-01 | Manage Currencies | Admin | Enable/Disable trading currencies. |
| FX-02 | Set Exchange Rates | Admin/System | Update conversion rates for POs and Reporting. |
| FX-03 | View FX Impact | Finance Admin | See cost variance due to rate changes. |

### 6.2 UI Screens

| Screen ID | Screen Name | Platform | Description |
| :--- | :--- | :--- | :--- |
| SCR-FX-01 | Currency Master | Admin Console | List enabled currencies and current rates. |
| SCR-FX-02 | Exchange Rate History| Admin Console | Log of rate changes over time. |

### 6.3 Required Fields

**Entity: Used across system**

- `currency` (String): ISO Code (USD, EUR).
- `exchangeRate` (Decimal): Rate at time of transaction (Snapshot).

### 6.4 State Transitions

**Exchange Rate**
`Active Rate` -> `Historical Rate` (Upon update).

### 6.5 Permissions

| Permission Code | Description | Role |
| :--- | :--- | :--- |
| `MANAGE_CURRENCY` | Edit Rates/Currencies | Financial Admin |

### 6.6 Entity Mapping

- **Storage**: Fields in `PurchaseOrder`, `ProductSupplier`, `StripePayment`.
- *Note: Dedicated `Currency` and `ExchangeRate` models recommended for Phase 2, currently handled via fields.*

### 6.7 Commercial Laws

- **Historical Accuracy**: Financial reports must use the exchange rate *at the time of the transaction*, not the current rate.

---

## 7. Carrier Claims & Insurance Recovery

**Goal**: Manage logistics exceptions and recover financial losses.

### 7.1 Use Cases

| ID | Use Case | Actor | Description |
| :--- | :--- | :--- | :--- |
| CLM-01 | File Carrier Claim | Logistics Mgr | Report lost/damaged shipment to carrier. |
| CLM-02 | Track Claim Status | Logistics Mgr | Monitor progress of claim resolution. |
| CLM-03 | Record Insurance Payout| Finance Admin | Log receipt of funds for claim. |

### 7.2 UI Screens

| Screen ID | Screen Name | Platform | Description |
| :--- | :--- | :--- | :--- |
| SCR-CLM-01 | Claims Dashboard | Admin/Logistics | List of open claims and chargebacks. |
| SCR-CLM-02 | Claim Detail | Admin/Logistics | Link to Order, Delivery Exception, and resolution status. |

### 7.3 Required Fields

**Entity: DeliveryException** (`delivery_exceptions`)

- `exceptionType`: LOST_IN_TRANSIT, DAMAGED.
- `resolutionType`: CARRIER_CLAIM, INSURANCE_PAYOUT.
- `resolved`: Boolean.

**Entity: Chargeback** (`chargebacks`)

- `reason`: Dispute reason.
- `status`: PENDING, WON, LOST.

### 7.4 State Transitions

**Claim (Exception Resolution)**
`OPEN` -> `SUBMITTED` (To Carrier) -> `APPROVED` (Payout) / `DENIED`.

### 7.5 Permissions

| Permission Code | Description | Role |
| :--- | :--- | :--- |
| `MANAGE_CLAIMS` | File/Update Claims | Logistics Manager |
| `RESOLVE_EXCEPTION`| Close delivery exceptions | Support/Admin |

### 7.6 Entity Mapping

- **Exception**: `DeliveryException`.
- **Financials**: `Chargeback`, `Refund`.
- **Note**: "Carrier Claim" is currently a workflow state of `DeliveryException`.

### 7.7 Commercial Laws

- **Revenue Reversal**: A lost item Claim typically implies a Refund to customer (Revenue Reversal) and a separate distinct entry for Insurance Payout (Other Income), not a direct net-off.
