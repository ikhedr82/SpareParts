# POS App — User Manual

## Login
1. Open the POS App on your tablet/phone.
2. Enter your email and password.
3. Select your **Branch** from the dropdown.
4. Tap **Login**.

**Error States**:
- Invalid credentials: *"Invalid email or password."*
- No POS access: *"You do not have POS access. Contact your manager."*
- Tenant suspended: *"Your organization's subscription is suspended."*

---

## Screen: Home
**Purpose**: POS dashboard and cash session management.

### Cash Session Status
| Element | Description |
|---|---|
| Session Status | 🟢 OPEN or 🔴 CLOSED |
| Opening Cash | Amount entered when session opened |
| Total Sales | Running total of sales in this session |
| Sync Status | ✅ Synced / 🔄 Syncing / ⚠️ Pending / ❌ Error |

### Quick Action Buttons
| Button | Action |
|---|---|
| **New Sale** | Navigates to Product Search screen |
| **Sales History** | Navigates to Sales History screen |
| **Open Session** | Opens cash session modal (if no active session) |
| **Close Session** | Opens close session modal (if session is active) |

### Open Session Modal
| Field | Type | Validation |
|---|---|---|
| Opening Cash | Currency Input | Required, ≥ 0 |

**Button**: Tap **Open Session** → Creates cash session, enables sales.

### Close Session Modal
| Field | Type | Description |
|---|---|---|
| Closing Cash | Currency Input | Actual cash counted in register |
| Expected Cash | Auto-calculated | Opening cash + total cash sales − cash refunds |
| Difference | Auto-calculated | Closing − Expected |

**Button**: Tap **Close Session** → Session closed, Z-Report data generated.

### Error State
If no cash session is open: *"Please open a cash session before making sales."*

---

## Screen: Product Search
**Purpose**: Find products to add to the current sale.

### Search Bar
| Input | Behavior |
|---|---|
| Text Search | Searches product name, part number, barcode |
| Barcode Scan | Tap camera icon to scan barcode |

### Vehicle Fitment Search
| Step | Action |
|---|---|
| 1 | Select Vehicle Make from dropdown |
| 2 | Select Vehicle Model (filtered by make) |
| 3 | Select Year (filtered by model range) |
| 4 | View compatible products |

### Search Results
| Element | Description |
|---|---|
| Product Card | Name, Brand, Part Number |
| Price | Selling price for current branch |
| Stock | Available quantity at current branch |
| **Add** Button | Adds 1 unit to cart |

### Empty State
*"No products found. Try different search terms."*

### Out of Stock Indicator
Products with 0 quantity show a red "Out of Stock" badge. They can still be added to cart (backorder).

---

## Screen: Cart
**Purpose**: Review and modify current sale items.

### Cart Item List
| Column | Description |
|---|---|
| Product | Name and brand |
| Qty | Editable quantity (−/+ buttons) |
| Unit Price | Price per unit |
| Line Total | Qty × Unit Price |

### Cart Summary
| Field | Description |
|---|---|
| Subtotal | Sum of line totals |
| VAT | Calculated from tenant's `vatPercentage` |
| **Total** | Subtotal + VAT |

### Actions
| Action | Effect |
|---|---|
| **+/−** Buttons | Adjust quantity |
| **Swipe Left** | Reveal "Remove" button to delete item |
| **Customer** Button | Opens customer selection modal |
| **Checkout** Button | Proceeds to payment screen |

### Customer Selection Modal
| Field | Description |
|---|---|
| Search | Search customer by name or phone |
| Select | Tap to link customer to this sale |
| Skip | Sale recorded without customer |

### Empty State
*"Cart is empty. Search for products to add."*

---

## Screen: Checkout
**Purpose**: Process payment and complete the sale.

### Payment Section
| Payment Method | Fields |
|---|---|
| **CASH** | Tendered Amount (input) → Change displayed automatically |
| **CARD** | Reference Number (optional) |
| **TRANSFER** | Reference Number (optional) |

### Split Payment
- Tap **Add Payment** to add another payment method.
- Total of all payments must equal or exceed the sale total.
- Overpayment on CASH shows as change due.

### Summary
| Field | Description |
|---|---|
| Items | Count of items |
| Total | Grand total |
| Paid | Sum of all payments |
| Change | Overpayment amount (cash) |

### Buttons
| Button | Action | Condition |
|---|---|---|
| **Complete Sale** | Finalize sale, deduct inventory, print receipt | Payments ≥ Total |
| **Back to Cart** | Return to cart for modifications | Always |

### Success State
*"Sale completed! Receipt #REC-2024-0088."*
- Option to **Print Receipt** or **New Sale**.

### Error States
- Insufficient payment: *"Total payments must cover the sale amount."*
- No active cash session: *"Please open a cash session first."*
- Offline: Sale is saved locally. *"Sale saved offline. It will sync when connection is restored."*

---

## Screen: Sales History
**Purpose**: View completed sales for the branch.

### Sales List
| Column | Description |
|---|---|
| Sale # | Identifier |
| Time | Transaction time |
| Customer | Customer name (or "Walk-in") |
| Total | Sale amount |
| Status | COMPLETED, VOIDED, REFUNDED |
| Payment | CASH, CARD, TRANSFER |

### Filters
| Filter | Options |
|---|---|
| Date | Date picker (default: today) |
| Status | All, Completed, Voided |

### Sale Detail
Tap a sale to view:
- Line items with quantities and prices.
- Payment breakdown.
- Option to **Void Sale** (if COMPLETED).

### Void Sale
1. Tap **Void Sale** on the sale detail.
2. Enter **Void Reason** (required text field).
3. Confirm: *"Are you sure? This reverses the inventory changes and marks the sale as voided."*
4. Inventory is restored. Sale status changes to VOIDED.

### Empty State
*"No sales recorded for this period."*

---

## Workflow: Typical Counter Sale

1. **Open Session** → Enter opening cash amount.
2. **New Sale** → Search for the part the customer needs.
3. **Vehicle Fitment** → Select Make/Model/Year to verify compatibility.
4. **Add to Cart** → Tap "Add" on the correct product.
5. **Adjust Quantities** → Use +/− buttons on the Cart screen.
6. **Checkout** → Select CASH, enter tendered amount.
7. **Complete Sale** → Receipt generated, inventory deducted.
8. **End of Day** → Close Session → Review difference → Z-Report auto-generated.

## Offline Behavior
- When offline, all operations continue normally.
- The sync status indicator shows ⚠️ **Pending**.
- Sales are stored in local SQLite and queued for upload.
- When connectivity returns, events sync automatically.
- Duplicate prevention via `offlineSyncId` ensures no double-processing.
