# Tenant Admin Portal — User Manual

## Login
1. Navigate to the Tenant Admin URL.
2. Enter your email and password.
3. Click **Login**.
4. You are redirected to the Tenant Dashboard.

**Error States**:
- Invalid credentials: *"Invalid email or password."*
- Account deactivated: *"Your account has been deactivated. Contact your administrator."*
- Tenant suspended: *"Your organization's subscription is suspended. Contact support."*

---

## Screen: Dashboard (`/tenant/`)
**Purpose**: Overview of the tenant's business operations.

### KPI Cards
| Card | Description |
|---|---|
| Inventory Value | Total cost value of all stock across branches |
| Today's Sales | Sum of completed sales for the current day |
| Pending Orders | Count of orders in PENDING/CONFIRMED status |
| Active Trips | Count of delivery trips in-transit |

### Charts
- **Revenue Over Time**: Line chart showing sales revenue by day/week/month.
- **Top Products**: Bar chart of best-selling products.

### Quick Action Buttons
| Button | Action |
|---|---|
| **New Sale** | Opens POS sale creation flow |
| **New Order** | Opens order creation form |
| **Stock Check** | Navigates to inventory search |

### Role-Based Visibility
- **Owner/Manager**: Full dashboard with all KPIs and charts.
- **Clerk**: Limited to Today's Sales and Quick Actions.

---

## Screen: Inventory (`/tenant/inventory/`)
**Purpose**: Manage product stock across all branches.

### Inventory Table
| Column | Type | Description |
|---|---|---|
| Product | Text | Product name with brand |
| Branch | Text | Branch location |
| Quantity | Number | Current stock level |
| Allocated | Number | Reserved for confirmed orders |
| Available | Number | Quantity − Allocated |
| Selling Price | Currency | Customer-facing price |
| Cost Price | Currency | Acquisition cost |
| Barcode | Text | Scannable barcode |
| Bin Location | Text | Warehouse shelf location |

### Actions
| Button | Action | Effect |
|---|---|---|
| **Edit** | Opens inline price editor | Updates selling/cost price |
| **Adjust** | Opens adjustment modal | Creates stock correction with reason |
| **View Ledger** | Opens ledger panel | Shows immutable history of all changes |

### Stock Adjustment Modal
| Field | Type | Validation |
|---|---|---|
| Quantity Change | Number | Required; positive (add) or negative (remove) |
| Reason | Dropdown | DAMAGE, COUNT_CORRECTION, VENDOR_RETURN, OTHER |
| Notes | Text | Optional |

### Empty State
*"No inventory records found. Add products through the global catalog and set stock levels."*

---

## Screen: Sales (`/tenant/sales/`)
**Purpose**: View all point-of-sale transactions.

### Sales Table
| Column | Type | Description |
|---|---|---|
| Sale # | Text | Auto-generated sale identifier |
| Date | DateTime | Transaction timestamp |
| Branch | Text | Originating branch |
| Customer | Text | Customer name (if recorded) |
| Total | Currency | Sale total amount |
| Status | Badge | COMPLETED, REFUNDED, VOIDED |
| Payment | Badge | CASH, CARD, TRANSFER, STRIPE |

### Filters
- **Date Range**: Start and end date pickers.
- **Branch**: Dropdown (all branches for Owner/Manager; own branch for Clerk).
- **Status**: Multi-select.

### Sale Detail View
Displays: Line items (product, qty, price), payments, linked invoice, and any returns/refunds.

| Button | Action | Condition |
|---|---|---|
| **Void Sale** | Voids the sale, reverses inventory | Sale must be COMPLETED |
| **Print Invoice** | Generates printable invoice | Always available |

### Void Sale Modal
| Field | Type | Validation |
|---|---|---|
| Void Reason | Text | Required |

**Confirmation Dialog**: *"Are you sure you want to void this sale? This action cannot be undone."*

---

## Screen: Customers (`/tenant/customers/`)
**Purpose**: Manage B2C customer records.

### Customer Table
| Column | Description |
|---|---|
| Name | Customer full name |
| Phone | Phone number |
| Email | Email address |
| Balance | Outstanding balance |

### Customer Form
| Field | Type | Validation |
|---|---|---|
| Name | Text | Required |
| Name (Arabic) | Text | Optional |
| Phone | Phone | Optional |
| Email | Email | Optional, unique within tenant |

---

## Screen: Purchase Orders (`/tenant/purchase-orders/`)
**Purpose**: Manage procurement from suppliers.

### Purchase Order Table
| Column | Description |
|---|---|
| PO # | Auto-generated identifier |
| Supplier | Supplier name |
| Branch | Destination branch |
| Status | DRAFT, ORDERED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED |
| Total Cost | Sum of line items |
| Created | Creation date |

### Create PO Form
| Field | Type | Validation |
|---|---|---|
| Supplier | Dropdown | Required |
| Branch | Dropdown | Required |
| Currency | Dropdown | Default: tenant base currency |
| Line Items | Table | At least one item required |

#### Line Item Fields
| Field | Type | Validation |
|---|---|---|
| Product | Search/Dropdown | Required |
| Quantity | Number | Required, ≥ 1 |
| Unit Cost | Currency | Required, ≥ 0 |

### Goods Receiving
When a PO has status ORDERED:
1. Click **Receive Items**.
2. Enter quantities received per line item.
3. Accepted unit cost can differ from PO cost.
4. System creates inventory ledger entries and updates stock.

### Purchase Returns
When received goods are defective:
1. Click **Create Return** on the PO detail.
2. Select items and quantities to return.
3. Provide reason.
4. Return follows: DRAFT → REQUESTED → APPROVED → SHIPPED → COMPLETED.

---

## Screen: Logistics (`/tenant/logistics/`)
**Purpose**: Manage delivery operations.

### Delivery Trip Table
| Column | Description |
|---|---|
| Trip # | Auto-generated |
| Branch | Origin branch |
| Driver | Assigned driver |
| Vehicle | Assigned vehicle |
| Status | PLANNED, LOADING, IN_TRANSIT, COMPLETED, FAILED, CANCELLED, RETURNED |
| Stops | Number of delivery stops |
| Created | Creation date |

### Create Trip Form
| Field | Type | Validation |
|---|---|---|
| Branch | Dropdown | Required |
| Driver | Dropdown | Optional |
| Vehicle | Dropdown | Optional |
| Fulfillment Mode | Dropdown | INTERNAL_FLEET, EXTERNAL_COURIER, CUSTOMER_PICKUP, THIRD_PARTY_DRIVER |
| Stops | List | At least one stop required |

#### Stop Fields
| Field | Type | Description |
|---|---|---|
| Type | Dropdown | CUSTOMER, SUPPLIER, BRANCH |
| Order | Search | Link to order |
| Sequence | Number | Delivery order |

### Trip Lifecycle
```
PLANNED → LOADING → IN_TRANSIT → COMPLETED
                                 → FAILED / RETURNED
```

### Delivery Exceptions
When a stop fails, the driver reports an exception:
| Exception Type | Description |
|---|---|
| CUSTOMER_UNAVAILABLE | No one at delivery address |
| ADDRESS_INCORRECT | Wrong address |
| REFUSED_DELIVERY | Customer refused |
| DAMAGED_IN_TRANSIT | Package damaged |
| LOST_IN_TRANSIT | Package lost |
| ACCESS_DENIED | Cannot access location |
| WEATHER_DELAY | Weather-related delay |
| OTHER | Custom reason |

### Resolution Options
| Action | Effect |
|---|---|
| **Create Replacement Order** | New order generated |
| **Issue Refund** | Refund processed |
| **Create Return** | Return request initiated |

---

## Screen: Finance (`/tenant/finance/`)
**Purpose**: Accounting and financial management.

### Chart of Accounts
Hierarchical list of general ledger accounts.
| Column | Description |
|---|---|
| Code | Account code (e.g., 1000) |
| Name | Account name |
| Type | ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE |
| Is System | Whether it's a system-generated account |

### Journal Entries
| Column | Description |
|---|---|
| Reference | Unique entry reference |
| Date | Entry date |
| Description | Entry description |
| Total | Sum of debits (must equal credits) |
| Status | DRAFT, POSTED |

### Create Journal Entry
| Field | Type | Validation |
|---|---|---|
| Date | Date Picker | Required |
| Description | Text | Optional |
| Lines (Account, Description, Debit, Credit) | Table | Must have ≥ 2 lines; Total debits = total credits |

### Buttons
| Button | Action | Condition |
|---|---|---|
| **Post** | Posts the entry to the ledger | Entry must be in DRAFT |
| **Reverse** | Creates a reversing entry | Entry must be POSTED |

---

## Screen: Branch Management (`/tenant/branches/`)
**Purpose**: Manage retail locations.

### Branch List
| Column | Description |
|---|---|
| Name | Branch name |
| Name (AR) | Arabic name |
| Address | Physical address |
| Phone | Contact phone |

### Branch Form
| Field | Type | Validation |
|---|---|---|
| Name | Text | Required, unique within tenant |
| Name (Arabic) | Text | Optional |
| Address | Text | Optional |
| Address (Arabic) | Text | Optional |
| Phone | Phone | Optional |

---

## Screen: User Management (`/tenant/users/`)
**Purpose**: Manage staff accounts and permissions.

### User List
| Column | Description |
|---|---|
| Email | User email |
| Status | ACTIVE, INACTIVE |
| Roles | Assigned roles |

### Create User Form
| Field | Type | Validation |
|---|---|---|
| Email | Email | Required, unique |
| Password | Password | Required, min 8 characters |
| Role | Multi-select | At least one role required |
| Branch | Dropdown | Optional (for branch-scoped roles) |

### Role-Based Visibility
- **Owner**: Can manage all users.
- **Manager**: Can manage users within their branch only.
- **Clerk**: Cannot access user management.
