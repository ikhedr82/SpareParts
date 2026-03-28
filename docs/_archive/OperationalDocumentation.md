# Antigravity Operational Manual

> **Business Operations & User Guide**
> Version: 2.0.0 · Operational Excellence Standard
> Perspective: Senior Operations Consultant / ERP Partner
> Last Updated: February 2026

---

## Table of Contents

- [1. Governance & Onboarding](#1-governance--onboarding)
- [2. Daily Operations — Sales](#2-daily-operations--sales)
- [3. Daily Operations — Warehouse](#3-daily-operations--warehouse)
- [4. Daily Operations — Delivery & Logistics](#4-daily-operations--delivery--logistics)
- [5. Daily Operations — Procurement](#5-daily-operations--procurement)
- [6. Branch Operations & Coordination](#6-branch-operations--coordination)
- [7. Exception Handling Playbook](#7-exception-handling-playbook)
- [8. Periodic Tasks & Financial Closing](#8-periodic-tasks--financial-closing)
- [9. User Lifecycle & Security Governance](#9-user-lifecycle--security-governance)
- [10. Support, Monitoring & Troubleshooting](#10-support-monitoring--troubleshooting)

---

## 1. Governance & Onboarding

Onboarding is the most critical phase for data integrity. A clean setup prevents months of reconciliation pain later. Every tenant activation follows a strict, repeatable sequence designed to get a business operational within minutes — but properly.

### 1.1 Tenant Activation Flow

The complete tenant activation follows this sequence:

```
Platform Admin creates Tenant
    → Subdomain assigned (e.g., alpha.antigravity.io)
    → Subscription plan selected (Standard / Professional / Enterprise)
        → Tenant Admin user created (Business Owner or IT Director)
            → First Branch configured (name, address, phone, tax settings)
                → Chart of Accounts initialized
                    → Tax rates configured
                        → Initial products subscribed from Global Catalog
                            → Test transaction performed
                                → Tenant goes ACTIVE
```

#### Step-by-Step Activation

1. **Create Tenant Record**: The Platform Admin creates the tenant in the Platform Owner Control Portal. The system assigns a unique `tenantId` (UUID) and provisions the subdomain. All subsequent data for this tenant is automatically isolated at the database level.

2. **Create Tenant Admin User**: The first user must be the Business Owner or IT Director. This user receives the `TENANT_ADMIN` role, which grants full authority over the business's data, users, and configuration. This user cannot be deleted — only deactivated.

3. **Define Branch Locations**:
   > [!TIP]
   > Separate your physical warehouse from your retail branch in the system, even if they share an address. This allows for precise "Stock Picking" vs. "Counter Sales" reporting and independent inventory counts.

   For each branch, configure:
   - **Name**: Clear, recognizable name (e.g., "Downtown Showroom", "Central Warehouse")
   - **Address**: Full physical address (used for delivery routing and customer-facing display)
   - **Phone**: Contact number (displayed on the Buyer Portal)
   - **Tax Jurisdiction**: If branches operate in different tax zones, configure per-branch tax rates

4. **Initialize Chart of Accounts**: The system provides a default chart of accounts following standard accounting conventions:

   | Code | Account Name | Type |
   |:---|:---|:---|
   | 1000 | Cash on Hand | Asset |
   | 1010 | Bank Account | Asset |
   | 1100 | Accounts Receivable | Asset |
   | 1200 | Inventory Asset | Asset |
   | 2000 | Accounts Payable | Liability |
   | 2100 | VAT Payable | Liability |
   | 2200 | Customer Deposits | Liability |
   | 3000 | Owner's Equity | Equity |
   | 3100 | Retained Earnings | Equity |
   | 4000 | Sales Revenue | Revenue |
   | 4100 | Service Revenue | Revenue |
   | 5000 | Cost of Goods Sold | Expense |
   | 5100 | Rent Expense | Expense |
   | 5200 | Salaries Expense | Expense |
   | 5300 | Utilities Expense | Expense |
   | 5400 | General Expense | Expense |

   Review these accounts with your accountant. Add additional accounts as needed for your specific reporting requirements (e.g., separate revenue accounts for different product categories, or additional expense accounts for logistics costs).

5. **Configure Tax Rates**: Set up VAT or sales tax rates applicable to your jurisdiction. The system supports multiple tax rates assignable by product category.
   > [!TIP]
   > **The Consultant's First Step**: Before processing any real transactions, create a test sale for $1.00 to verify that tax rounding is calculated correctly. This 30-second test prevents months of reconciliation issues.

6. **Subscribe to Global Catalog**: Browse the global product catalog and subscribe to the brands and categories relevant to your business. Subscribed products appear in your local catalog with vehicle fitment data, OEM cross-references, and brand associations already populated.

7. **Perform Test Transaction**: Process a complete end-to-end test: create a sale, verify inventory movement, check invoice generation, confirm journal entry posting, and close a test cash session. Verify all numbers match before going live.

### 1.2 Financial Guardrails

Before the first real transaction, verify these financial safeguards are properly configured:

| Guardrail | What to Check | Why It Matters |
|:---|:---|:---|
| **VAT Liability Mapping** | GL Code 2100 (VAT Payable) is correctly mapped to all tax-generating transactions | Ensures tax obligations are accurately tracked for filing |
| **COGS Automation** | Every sale automatically posts a DR Cost of Goods Sold / CR Inventory Asset journal entry | Prevents manual accounting errors and ensures margins are tracked |
| **Cash Account Balance** | GL Code 1000 (Cash on Hand) starts at zero, incremented only by recorded cash transactions | Creates a clean baseline for daily reconciliation |
| **Period Configuration** | First accounting period is open with correct start/end dates | Ensures all transactions post to the correct period |

---

## 2. Daily Operations — Sales

The daily sales rhythm follows a structured cycle: Open → Transact → Reconcile → Close. Every step is designed to maximize speed at the counter while maintaining 100% financial accuracy.

### 2.1 Morning Opening Procedure

1. **Open Cash Session**: The first action of every shift is opening a cash session. The cashier counts the physical cash in the drawer and records the **opening balance**. The system timestamps this moment and associates all subsequent transactions with this session.

2. **Verify Opening Balance**: Compare the recorded opening balance against the previous day's closing balance. Any discrepancy must be investigated and documented before processing begins.

3. **Check Pending Orders**: Review the dashboard for any overnight orders from the Buyer Portal that need processing. These orders have already allocated inventory and are waiting for fulfillment.

4. **Review Expiring Quotes**: Check the Quote Dashboard for any quotes expiring today or this week. Use this as a morning follow-up list to convert pending opportunities.

### 2.2 POS Transaction Workflow

The Point of Sale is optimized for speed. A typical multi-item transaction should take under 30 seconds:

```
Scan/Search Product → Add to Cart → Adjust Quantity
    → Apply Discount (if authorized) → Select Payment Method
        → Process Payment → Print Receipt → Invoice Auto-Generated
```

**Key POS Best Practices:**

- **Barcode First**: Always try barcode scanning before manual search. Scanning is 10x faster and eliminates part number errors.
- **Quick-Select Brands**: Configure "Quick-Select" categories for your top 20 sellers (filters, oil, brake pads). This reduces customer wait time by 40%.
- **Split Tender**: The POS supports multi-method payments in a single transaction (e.g., $200 cash + $150 card). No need to create separate transactions.
- **Discount Authorization**: The system enforces discount limits per role. A Cashier may apply up to 5% discount; anything higher automatically requires a Manager override code. This prevents unauthorized discounting while keeping the line moving.

### 2.3 B2B Quoting Workflow

For business-to-business clients (workshops, fleet managers), the quoting process replaces informal WhatsApp price lists with a professional, trackable system:

1. **Create Draft Quote**: Select the business client (or create a new one). The system automatically applies their assigned price tier (Retail, Wholesale, Silver, Gold).

2. **Add Line Items**: Search for products by part number, vehicle fitment, or keyword. The system shows the client-specific price (based on their tier) alongside the standard retail price, so the rep can see the discount being offered.

3. **Apply Discretionary Discounts**: If needed, the rep can apply an additional per-line or overall discount within their authorized limits. Discounts exceeding the rep's limit trigger an approval request to the Sales Manager.

4. **Set Validity Period**: Choose 7, 14, or 30 days. The system automatically tracks expiry and flags quotes nearing their deadline.

5. **Send to Client**: The quote is emailed as a professional PDF with the tenant's branding, itemized pricing, tax breakdown, and terms.

6. **Track in Pipeline**: All active quotes appear on the Quote Dashboard with status indicators:

   | Status | Meaning | Action Required |
   |:---|:---|:---|
   | `DRAFT` | Not yet sent | Finalize and send |
   | `SENT` | Awaiting client response | Follow up before expiry |
   | `ACCEPTED` | Client agreed | Convert to order |
   | `REJECTED` | Client declined | Analyze and learn |
   | `EXPIRED` | Validity period elapsed | Re-quote if still interested |
   | `CONVERTED` | Turned into a sales order | Proceed to fulfillment |

> [!TIP]
> **Consultant Insight**: Stop using paper quotes. Every draft quote in Antigravity is a searchable sales lead. Schedule a standing meeting every Tuesday morning to review all open quotes and follow up on those nearing expiry. Businesses that implement this discipline see 15–25% higher quote conversion rates.

### 2.4 Returns & Refunds Processing

Returns are treated as a high-security operation to prevent fraud. The system enforces a strict sequence:

1. **Locate Original Sale**: The customer presents their receipt or invoice number. The staff member looks up the original sale in the system. **No blind returns are permitted** — every return must be linked to a specific original transaction.

2. **Verify Item Match**: Confirm that the returned item matches the product on the original sale (correct part number, correct quantity, within return policy window).

3. **Process Return Record**: Create a return record linked to the original sale. The system validates that the return quantity does not exceed the original sale quantity.

4. **Restock Item**: The returned item is added back to available inventory with an immutable ledger entry recording the return, the reason, and the staff member who processed it.

5. **Issue Refund**: Only after the item is digitally received back into stock does the system allow the refund to be processed. This prevents "Ghost Refunds" — where money leaves the business but inventory never returns.

   > [!IMPORTANT]
   > **Safety Law — Refund Blocking**: The system will NOT allow a cash/card refund to be processed until the inventory has been digitally received back into stock. This is a deliberate safety mechanism, not a bug.

6. **Automated Bookkeeping**: A Credit Note is issued to the customer, and a reversing journal entry is posted: DR Sales Revenue / CR Cash (reducing both revenue and cash to reflect the return).

### 2.5 End-of-Day Reconciliation

The end-of-day process is the most important daily discipline. It catches errors, discrepancies, and potential issues before they compound:

1. **Close Cash Session**: The cashier counts all physical cash in the drawer and records the **closing balance**.

2. **System Calculates Expected Balance**: The system adds up every cash transaction during the session (sales, refunds, adjustments) and calculates what the closing balance *should* be.

3. **Variance Analysis**: The system compares expected vs. actual:
   - **Zero variance**: Clean close — proceed to sign-off
   - **Minor variance** (< $5): Flag for investigation but allow close with manager acknowledgment
   - **Significant variance** (> $5): Requires manager investigation before the session can be closed

4. **Generate Z-Report**: The system produces a comprehensive Z-Report summarizing:
   - Total number of transactions
   - Total revenue by payment method (cash, card, split)
   - Total refunds processed
   - Total discounts applied
   - Expected vs. actual cash balance
   - Variance amount and direction

5. **Manager Review & Sign-Off**: The branch manager reviews the Z-Report, investigates any variances, and approves the close. Once approved, the period is locked — no retroactive changes are possible.

---

## 3. Daily Operations — Warehouse

The warehouse is where digital accuracy meets physical reality. Every procedure is designed to eliminate human error through barcode verification and systematic workflows.

### 3.1 Goods Receipt (Receiving Supplier Deliveries)

When a supplier delivery arrives, the warehouse team processes it against the corresponding Purchase Order:

1. **Open the Purchase Order**: Locate the PO that matches the delivery. The system shows all expected items, quantities, and negotiated unit costs.

2. **Physical Count**: Count each item type in the delivery and compare against the PO:
   - **Exact Match**: Record the received quantity (matches PO)
   - **Shortfall**: Record actual received quantity; system flags the shortage for follow-up with the supplier
   - **Overage**: System blocks receiving more than the PO quantity without explicit manager override

3. **Barcode Verification**: Scan each product's barcode to verify it matches the expected item on the PO. This prevents accepting the wrong products.

4. **Inventory Update**: Upon confirming receipt, the system:
   - Increases the branch's inventory quantity for each received product
   - Updates the Weighted Average Cost (Purchase Price + existing cost, averaged across total quantity)
   - Creates an immutable ledger entry recording the receipt with quantity, cost, PO reference, and timestamp

5. **Bin Assignment**: Assign each received item to a warehouse bin location (e.g., Zone A, Shelf 3, Bin 12). Proper bin assignment is critical for picking speed.

### 3.2 Pick List Processing (Order Fulfillment)

When orders need fulfillment, the system generates pick lists that guide warehouse staff through the collection process:

1. **Receive Pick List**: The picker receives a digital pick list showing all items needed, their quantities, and their bin locations. Items are sequenced by zone for minimal walking.

2. **Navigate by Bin Location**: Follow the system's suggested route through the warehouse. The system groups items by zone to minimize travel distance.
   > [!TIP]
   > **The Golden Rule**: Never pick from memory. Always follow the bin location guidance. A trained operator should fulfill 30+ picks per hour using the digital bin guide.

3. **Scan to Verify**: At each bin, scan the item's barcode:
   - **Green beep**: Correct item — enter the quantity picked and move on
   - **Red beep**: Wrong item — the system blocks the pick. Do NOT override without manager approval. This prevents the #1 cause of customer returns: wrong items shipped

4. **Record Partial Picks**: If the bin has fewer items than needed (e.g., pick list says 10 but bin has only 7), record the actual quantity picked. The system adjusts and flags the remaining items for investigation.

5. **Complete Pick**: Once all items on the list are scanned and verified, the pick list status automatically transitions from `PICKING` to `PICKED`.

### 3.3 Pack Management & Sealing

After picking, items are grouped into sealed packs — the atomic unit of delivery:

1. **Group by Order**: Collected items are grouped by the customer order they belong to. One order may have one or more packs depending on size and weight.

2. **Create Pack Record**: Each pack receives a unique system identifier and a printed label with a barcode.

3. **Verify Pack Contents**: Before sealing, verify that all items in the pack match the order. Scan each item's barcode against the expected pack manifest.

4. **Seal Pack**: Mark the pack as `SEALED` in the system. Once sealed, the pack cannot be modified without manager authorization and a documented reason.

5. **Assign to Delivery Trip**: Sealed packs are assigned to a specific delivery trip. The system links: Order → Pick List → Picked Items → Pack → Delivery Trip → Stop → Customer.

### 3.4 Stock Adjustment Procedures

Real-world inventory doesn't always match system records. The stock adjustment process maintains accuracy while preserving traceability:

| Reason Code | When to Use | Typical Cause |
|:---|:---|:---|
| `DAMAGE` | Item is physically damaged and unsellable | Warehouse handling, shipping damage |
| `LOSS` | Item cannot be located in the warehouse | Theft, misplacement, counting error |
| `COUNT_CORRECTION` | Physical count differs from system count | Accumulation of minor errors over time |
| `SHRINKAGE` | Systematic reduction identified during audit | Ongoing pilferage or process failures |
| `FOUND` | Item was previously written off but has been located | Misplaced items discovered during reorganization |

**Procedure:**

1. Identify the discrepancy (during cycle count, pick attempt, or visual inspection)
2. Select the product and branch
3. Enter the quantity change (positive for additions, negative for reductions)
4. Select the mandatory reason code
5. Add descriptive notes (e.g., "3 units water-damaged during roof leak on Feb 15")
6. Submit — the system creates an immutable ledger entry with the user's ID, timestamp, reason, and quantity change

> [!IMPORTANT]
> Every adjustment is permanently recorded in the inventory ledger with the staff member's identity. There is no way to make an "invisible" adjustment. Managers should review the adjustment log weekly to identify patterns (e.g., recurring damage to fragile items may indicate a shelving problem).

### 3.5 Bin Location Management

Warehouse efficiency depends on logical organization:

- **Zone System**: Divide the warehouse into zones (A, B, C...) based on logical groupings (e.g., Zone A = Filters, Zone B = Brake Components, Zone C = Engine Parts)
- **Shelf & Bin Numbering**: Within each zone, number shelves and bins sequentially (A-01-01 through A-01-20)
- **Fast-Movers Near the Front**: Place high-velocity items (top 20% by sales volume) in the most accessible locations near the packing area
- **Heavy Items Low**: Store heavy items (rotors, batteries, compressors) on lower shelves for safety and ergonomics

---

## 4. Daily Operations — Delivery & Logistics

Delivery is the moment of truth — it's when the customer receives their goods and the platform triggers its most important safety mechanism: inventory commitment and revenue recognition.

### 4.1 Trip Creation & Planning

Delivery trips are the organizational unit for last-mile logistics:

1. **Select Fulfillment Mode**:
   - **Internal Fleet**: Company driver + company vehicle. Full control with loading verification, stop-by-stop tracking, and delivery confirmation.
   - **External Courier**: Third-party delivery provider. Simplified handoff with tracking callbacks.

2. **Assign Resources** (Internal Fleet):
   - Select an available **Driver** (the system blocks drivers who are already assigned to an active trip)
   - Select an available **Vehicle** (the system blocks vehicles flagged as "In Service" or already assigned)

3. **Add Stops**: Each stop represents a customer delivery location. For each stop, the system links:
   - Customer name and address
   - Order details (items and quantities)
   - Associated packs (sealed units to deliver)
   - Contact phone number and delivery instructions

4. **Sequence Stops**: Arrange stops in the optimal delivery order to minimize driving time. The system allows manual reordering based on local knowledge of traffic patterns and geography.

### 4.2 The "Lock & Load" Principle

> [!IMPORTANT]
> **Manager's Tip**: The "Loading Verification" step is your primary defense against customer complaints and the "forgotten box" problem.

Before a trip can be dispatched, the system enforces a mandatory loading verification:

1. **Transition to LOADING**: The trip moves from `PLANNED` to `LOADING` status
2. **Physical Verification**: The warehouse team scans each pack's barcode as it is placed on the vehicle
3. **Manifest Comparison**: The system compares loaded packs against the trip manifest
4. **Completion Gate**: A trip **cannot** transition to `IN_TRANSIT` until 100% of the manifest's packs are confirmed as loaded
5. **No-Pack Safeguard**: The system blocks trip start if no packs are loaded, preventing empty dispatches

**The Rule**: A driver cannot depart until every pack on the manifest is scanned onto the vehicle. This eliminates the "forgotten part" scenario that costs businesses an average of $50–100 per re-delivery trip.

### 4.3 Driver Dispatch & Execution

Once loading is verified, the trip is dispatched:

```
PLANNED → LOADING → IN_TRANSIT → COMPLETED
                                → FAILED → RETURNED
```

1. **Trip Start**: The driver confirms the vehicle assignment and begins the route. The first stop address is available for navigation.

2. **At Each Stop**:
   - **Arrive**: Driver marks arrival at the stop
   - **Verify Items**: Check packs and quantities against the order
   - **Successful Delivery**: Hand items to customer → Collect digital signature and/or take delivery photo → Mark as `DELIVERED`
   - **Failed Delivery**: Select reason code → Document with photo → Mark as `FAILED`

3. **Delivery Failure Reason Codes**:

   | Code | Situation | System Response |
   |:---|:---|:---|
   | `REFUSED` | Customer rejects the delivery | Inventory stays allocated, not committed |
   | `NOT_HOME` | No one available to receive | Items flagged for re-delivery attempt |
   | `WRONG_ADDRESS` | Address is incorrect | Sales team notified to verify customer info |
   | `DAMAGED` | Items damaged in transit | Triggers quality investigation |
   | `OTHER` | Any other situation (text explanation required) | Logged for manager review |

### 4.4 The "Signature is Revenue" Law

> [!IMPORTANT]
> Drivers must understand that their digital confirmation is what triggers the financial recognition of the sale. **No signature = Unearned Revenue.**

The platform's Commercial Safety Mode enforces:

- **At delivery confirmation**: Inventory is permanently committed (decremented from stock). Revenue is recognized (journal entry posted). Order status updates to `DELIVERED`. The buyer sees "Delivered" on their portal.
- **At delivery failure**: Inventory remains allocated but is NOT committed. Revenue is NOT recognized. When the driver returns to base, failed items automatically return to available stock.

This ensures that the P&L statement reflects physical reality — not hopeful pending orders.

### 4.5 Trip Completion

After all stops are attempted:

1. **Review Trip Summary**: The system shows X stops delivered, Y stops failed
2. **Undelivered Packs**: Record any undelivered packs for warehouse return
3. **Finalize Trip**: The system performs automatic actions:
   - Commits inventory for all delivered items (permanent decrement)
   - Releases allocated inventory for all failed items (returns to available stock)
   - Marks the driver and vehicle as "Available" for the next trip
   - Updates all affected orders with their final delivery status
   - Posts revenue journal entries for delivered items

---

## 5. Daily Operations — Procurement

The procurement cycle ensures the business buys the right parts, at the right price, from the right suppliers — with full financial governance.

### 5.1 Identifying Restock Needs

Three methods for identifying what to order:

1. **Low-Stock Alerts**: The system automatically flags products where available quantity falls below a configurable threshold
2. **Inventory Reports**: The "Inventory Aging" report highlights products with low turnover (potential dead stock) and products with high turnover (may need reordering)
3. **Manual Review**: Experienced buyers review seasonal demand patterns and upcoming promotions to anticipate needs

### 5.2 Purchase Order Creation

1. **Select Supplier**: Choose from the supplier registry. The system shows each supplier's performance metrics: average lead time, historical fulfillment rate (% of orders delivered complete), and pricing history.

2. **Add Line Items**: Select products to order, specifying quantities and negotiated unit costs. The system auto-calculates line totals and the PO grand total.

3. **Cost Comparison**: The system alerts the buyer if the unit cost has changed significantly from the last order (e.g., > 5% increase), enabling negotiation awareness.

4. **Set Expected Delivery Date**: Record when the supplier is expected to deliver, enabling planning and follow-up.

5. **Submit for Approval** (if required): POs exceeding a configurable dollar threshold are automatically routed to a senior manager's approval inbox. The PO remains in `DRAFT` until approved, preventing unauthorized spending.

### 5.3 Purchase Order Lifecycle

```
DRAFT → SENT → RECEIVED → COMPLETED
  ↓                          
CANCELLED                   
```

| Status | Meaning | Action Available |
|:---|:---|:---|
| `DRAFT` | Being prepared, not yet committed | Edit, submit for approval, cancel |
| `SENT` | Committed to supplier | Receive goods, cancel |
| `RECEIVED` | Goods received at warehouse | Mark complete, create purchase return (RTV) |
| `COMPLETED` | Fully processed | View only |
| `CANCELLED` | Voided before fulfillment | View only |

### 5.4 Goods Receipt Procedure

See [Section 3.1 — Goods Receipt](#31-goods-receipt-receiving-supplier-deliveries) for the detailed warehouse procedure.

After goods receipt, verify:

- Inventory quantities updated correctly
- Weighted Average Cost recalculated
- Ledger entries created with PO reference
- PO status updated to `RECEIVED`

### 5.5 Three-Way Matching (Verification)

The Gold Standard for audit-compliant procurement:

1. **Purchase Order**: What was ordered (items, quantities, agreed prices)
2. **Goods Receipt**: What was physically received (actual quantities, condition)
3. **Supplier Invoice**: What the supplier is billing (amounts, tax, terms)

All three must align before payment is authorized. Discrepancies trigger investigation:

- Quantity mismatch → Contact supplier or re-count
- Price mismatch → Verify negotiated terms
- Item mismatch → Investigate potential substitution

### 5.6 Return to Vendor (RTV) Procedures

For defective, incorrect, or damaged goods from suppliers:

1. **Identify Defective Stock**: During goods receipt or later inspection, move defective items to a quarantine bin.

2. **Create RTV Request**: Create a return record linked to the original Purchase Order. Specify items, quantities, and the reason for return.

3. **RTV Lifecycle**:

   ```
   DRAFT → REQUESTED → APPROVED → SHIPPED → COMPLETED
                     → REJECTED
   ```

4. **Inventory Impact**: Upon RTV creation, the system decrements inventory for the returned items and creates a ledger entry with the `PURCHASE_RETURN` reference type.

5. **Financial Settlement**: When the supplier acknowledges the return, a Supplier Credit Note is recorded, reducing the amount owed to that supplier on future invoices.

---

## 6. Branch Operations & Coordination

For businesses operating across multiple physical locations, branch coordination is critical to maximizing stock utilization and providing consistent service.

### 6.1 Inter-Branch Stock Transfers

When one branch has excess stock that another branch needs, use the Transfer Request system:

```
REQUESTED → APPROVED → SHIPPED → RECEIVED
          → CANCELLED
```

1. **Request**: Branch B identifies a need and creates a transfer request from Branch A. The system shows Branch A's available quantity (excluding already-allocated stock).

2. **Approval**: Branch A's manager reviews and approves the request. Upon approval, the system **locks** the requested quantity in Branch A — preventing it from being sold to a walk-in customer while the transfer is being prepared.

3. **Ship**: The items are physically picked, packed, and sent to Branch B. The transfer status updates to `SHIPPED`. The stock is "in transit" — it's no longer available at Branch A but not yet available at Branch B.

4. **Receive**: When Branch B receives the items, they scan and verify. The transfer completes: stock is added to Branch B's ledger and fully removed from Branch A's ledger.

> [!IMPORTANT]
> **Security**: Do not use phone calls for stock transfers. The system ensures that Branch A cannot accidentally sell a part that is promised to Branch B. Every transfer has a complete audit trail: who requested, who approved, who shipped, who received, and when.

### 6.2 Cycle Counting (Inventory Reconciliation)

Don't wait for the year-end audit. Systematic cycle counting maintains "Ground Truth" accuracy:

**The Category Count Method** (Recommended):

| Week | Category to Count | Expected Duration |
|:---|:---|:---|
| Week 1 | Brake Components | 2–3 hours |
| Week 2 | Filters (Oil, Air, Fuel) | 2–3 hours |
| Week 3 | Engine Components | 3–4 hours |
| Week 4 | Electrical Parts | 2–3 hours |

By rotating through categories weekly, you cover the entire inventory every month without the disruption of a full count.

**Procedure:**

1. Print the current system inventory for the target category
2. Physically count every item in the assigned zone/bins
3. Compare physical count vs. system count
4. For discrepancies:
   - Recount to verify the physical number
   - If confirmed, create a Stock Adjustment with reason code `COUNT_CORRECTION`
   - Document any suspected causes (e.g., "3 filters found behind shelf — improper stocking")
5. Review adjustment patterns monthly to identify systemic issues

### 6.3 Branch-Level Reporting

Each branch maintains independent reporting while contributing to consolidated business views:

- **Daily Z-Report**: Summarizes all POS transactions, payment methods, and cash variance for the branch
- **Stock Position Report**: Current inventory levels for the branch with quantity on hand, allocated, and available
- **Sales Performance**: Revenue by product, brand, and category for the branch
- **Transfer Activity**: Incoming and outgoing transfer history for the branch

The Tenant Admin can view consolidated reports across all branches from the Tenant Web Portal.

---

## 7. Exception Handling Playbook

Every business encounters exceptions. This playbook provides structured responses to the most common scenarios, preventing ad-hoc decisions that create data integrity problems.

### 7.1 Out-of-Stock Scenarios

| Situation | Pitfall to Avoid | Recommended Solution |
|:---|:---|:---|
| Customer requests a product that is out of stock at this branch | Promising a backorder without a PO, or manually "holding" items informally | **Step 1:** Use the **Alternative Part Lookup** to suggest a compatible substitute from the global catalog (e.g., different brand, same fitment). **Step 2:** If no substitute, check other branches for available stock and initiate an inter-branch transfer. **Step 3:** If no stock exists in the network, create a Purchase Order to the supplier. |
| Product shows "Available" in system but can't be found on shelf | Adjusting stock to zero without investigation | **Step 1:** Recheck the bin location listed in the system. **Step 2:** Check adjacent bins (common misplacement). **Step 3:** If truly missing, create a Stock Adjustment with reason `LOSS` and notes documenting the investigation. **Step 4:** Flag for security review if high-value. |

### 7.2 Delivery Failure Scenarios

| Scenario | Pitfall to Avoid | Recommended Solution |
|:---|:---|:---|
| Customer refuses delivery | Driver leaving items at the door unsigned | Mark as `FAILED - REFUSED`. Items return to warehouse. Sales rep contacts customer to understand the reason and resolve. Inventory is NOT committed. |
| Customer not home | Driver attempting to "leave with neighbor" without authorization | Mark as `FAILED - NOT_HOME`. Schedule re-delivery for the next business day. Do NOT leave items without a digital signature. |
| Wrong address | Driver delivering to the wrong location | Mark as `FAILED - WRONG_ADDRESS`. Sales rep contacts customer to verify correct address. Update the customer record before reattempting. |
| Items damaged in transit | Ignoring damage and completing delivery | Mark as `FAILED - DAMAGED`. Take photos documenting the damage. Trigger a quality investigation. Do NOT deliver damaged goods — this creates return processing costs and customer dissatisfaction. |

### 7.3 Payment & Credit Scenarios

| Scenario | Pitfall to Avoid | Recommended Solution |
|:---|:---|:---|
| B2B customer hits credit limit | Manual overrides at the counter | Direct the customer to the **Buyer Portal** to settle their outstanding balance via card payment before placing new orders. Alternatively, the Finance team can adjust the credit limit after reviewing the account. |
| Cash drawer variance at close | Ignoring small variances day after day | Investigate every variance the same day. Small daily variances compound into significant discrepancies over time. Flag branches with recurring variances for process review or staff retraining. |
| Customer disputes a charge | Issuing ad-hoc refunds without investigation | Look up the original transaction in the system. Review the delivery confirmation (signature/photo). If the dispute is valid, process through the formal Returns & Refunds flow. Never issue a "goodwill" refund outside the system. |

### 7.4 Chargeback Resolution

When a payment provider notifies of a chargeback:

1. **Capture the chargeback**: Create a chargeback record linked to the original payment and order
2. **Gather evidence**: Pull the delivery confirmation (digital signature, photo proof), invoice, and order timeline
3. **Respond to provider**: Submit the evidence to the payment provider within their deadline
4. **Resolution tracking**: The chargeback follows a lifecycle: `PENDING` → `RESOLVED` or `REJECTED`
5. **Financial impact**: If the chargeback is upheld (lost), a reversing journal entry is posted to adjust revenue

---

## 8. Periodic Tasks & Financial Closing

### 8.1 Monthly Financial Closing

The period close is a critical governance event. Once a period is closed, financial statements for that period are immutable — they cannot be altered retroactively.

**Closing Procedure:**

1. **Pre-Close Checklist**:
   - [ ] All sales for the month are recorded and invoiced
   - [ ] All goods receipts for the month are processed
   - [ ] All returns (customer and supplier) are finalized
   - [ ] All stock adjustments are recorded with reason codes
   - [ ] All cash sessions for the month are closed and Z-Reports approved
   - [ ] Bank reconciliation is complete (if applicable)

2. **Review Financial Statements**: Generate and review the month's:
   - **Profit & Loss Statement**: Verify revenue, COGS, and expenses look reasonable
   - **Balance Sheet**: Confirm assets, liabilities, and equity are balanced
   - **Trial Balance**: Sum of debits must equal sum of credits

3. **Close the Period**: Execute the period close in the Accounting module. The system:
   - Locks all journal entries with dates in the closed period
   - Blocks any new transactions from posting to the closed period
   - Records who closed the period and when (audit trail)

4. **Post-Close**: Any transactions that should have been in the closed period but were missed must be recorded in the current open period with a note referencing the correct period.

> [!IMPORTANT]
> **The "Period Lock" is your legal safe.** Once closed, your financial statements are immutable. This is essential for external auditors, tax authorities, and investors. Never allow periods to remain open indefinitely — close each month within 5 business days of month-end.

### 8.2 Monthly Margin Review

The **Margin Analysis** report is your early warning system for profitability erosion:

1. **Review by Category**: Sort products by margin percentage. Identify categories where margins have declined.
2. **Cost vs. Price Check**: If your Landed Cost (Purchase Price + Freight) has increased but your selling prices haven't been adjusted, your margins are silently eroding.
3. **Action**: Adjust retail prices immediately for affected products. Use the Pricing Rules engine to update pricing across all branches simultaneously.

> [!TIP]
> **The "Margin Trap"**: Distributors frequently lose 2–5% of net margin annually because they don't review cost changes monthly. A $0.50 increase in supplier cost on a high-volume item (e.g., oil filters) can cost $5,000–10,000 per year in unrealized margin if prices aren't adjusted.

### 8.3 Quarterly Dead Stock Review

The **Inventory Aging** report identifies capital trapped in non-moving inventory:

| Aging Bucket | Action |
|:---|:---|
| 0–30 days | Normal — no action needed |
| 31–90 days | Monitor — check if seasonal or demand decline |
| 91–180 days | Warning — consider promotions, price reductions, or supplier returns |
| 180+ days | Critical — run clearance sales, negotiate RTV with supplier, or write off |

### 8.4 Tax Filing Preparation

The system generates consolidated tax reports to streamline filing:

1. **VAT Output Report**: Consolidated across all branches, showing total VAT collected on sales
2. **VAT Input Report**: Total VAT paid on purchases (available for offset where applicable)
3. **Net VAT Liability**: The difference between output and input VAT — the amount due to the tax authority

Tax filing follows a managed lifecycle: `DRAFT` → `FILED` (or `CANCELLED`).

### 8.5 Supplier Performance Review

Quarterly, review the Supplier Registry for performance trends:

| Metric | Target | Action if Below Target |
|:---|:---|:---|
| On-Time Delivery Rate | > 90% | Escalate to supplier. Consider backup suppliers. |
| Order Fulfillment Rate | > 95% | Investigate partial shipments. Adjust safety stock. |
| Quality Rate | > 98% | Increase incoming inspection. Document for RTV patterns. |
| Price Stability | < 5% variance | Negotiate fixed pricing periods. Seek alternative sources. |

---

## 9. User Lifecycle & Security Governance

### 9.1 User Creation & Role Assignment

When onboarding a new team member:

1. **Create User Account**: Enter email, name, and generate temporary credentials
2. **Assign Role**: Select the appropriate role based on their job function:

   | Role | Scope | Primary Access |
   |:---|:---|:---|
   | `TENANT_ADMIN` | Tenant | Full business management, configuration, users |
   | `MANAGER` | Branch | Sales oversight, approvals, reporting, inventory adjustments |
   | `CASHIER` | Branch | POS transactions, returns (with receipt), cash sessions |
   | `SALES_USER` | Branch/Tenant | Quotes, customer management, order tracking |
   | `INVENTORY_MANAGER` | Branch | Stock management, goods receipt, transfers, adjustments |
   | `WAREHOUSE_USER` | Branch | Pick lists, pack management, barcode scanning |
   | `DRIVER_USER` | Tenant | Delivery trips, stop management, delivery confirmation |
   | `LOGISTICS_MANAGER` | Branch/Tenant | Trip creation, fleet management, dispatch |
   | `FINANCE_USER` | Tenant | Chart of accounts, journal entries, period management |

3. **Assign Branch**: For branch-scoped roles, assign the user to their specific branch(es). A user can only access data within their assigned branches.

### 9.2 Role Segregation Best Practices

> [!IMPORTANT]
> **Critical Segregation Rules:**
>
> - Never give a Cashier the permission to `VOID_SALE`. Voiding requires a Manager code.
> - The person who creates a Purchase Order should NOT be the same person who approves it.
> - Warehouse staff should not have access to financial reports or pricing configuration.
> - Drivers should only see their assigned trips — not other drivers' routes or business financials.

### 9.3 Offboarding Procedures

When a staff member leaves the organization:

1. **Deactivate account immediately** — do this *before* the final exit interview, not after
2. **Reassign active items**: Transfer any open quotes, pending approvals, or active trips to another team member
3. **Review audit trail**: Check the departing employee's recent activity for any anomalies (unusual adjustments, voids, or discount patterns)
4. **Document**: Record the deactivation date and reason in the system

> [!TIP]
> A deactivated account is NOT deleted — the user's historical activity (audit trail, transaction records, delivery confirmations) is preserved permanently for compliance purposes. Only the ability to log in is removed.

### 9.4 Audit Trail Reviews

The Audit Dashboard provides forensic capability for investigating suspicious activity:

- **Every action has a name and a face**: Who created, modified, approved, voided, or adjusted every record
- **Before/After snapshots**: The system records the state of any record before and after each change
- **Correlation tracking**: Actions are linked via Correlation ID, allowing you to trace a single user action through every system component it touched
- **IP Address logging**: Records where actions originated for additional investigation context

**What to Monitor:**

- High volume of voids at specific branches (staff training issue or internal shrinkage?)
- Stock adjustments made during non-business hours (late-night adjustments are a red flag)
- Repeated discount overrides by the same staff member
- Access attempts from deactivated accounts

---

## 10. Support, Monitoring & Troubleshooting

### 10.1 Outbox Event Monitoring

The platform uses a Transactional Outbox pattern to ensure reliable event processing. Events (email notifications, inventory updates, financial postings) are written to a database table and processed asynchronously.

**Daily Check:**

- Review the **Outbox Status** dashboard once per day
- All events should show status `PROCESSED`
- Events stuck in `PENDING` for more than 1 hour indicate a processing issue

**If events are stuck:**

1. Check internet connectivity (events that trigger external services require connectivity)
2. Check the dead-letter store for events that failed more than 5 times
3. Contact support if dead-letter events accumulate

### 10.2 Dead Letter Handling

Events that fail processing more than 5 times are moved to a Dead Letter Store:

- **Symptoms**: Missing email notifications, delayed inventory updates, incomplete financial postings
- **Investigation**: Each dead letter shows the failure reason, the original event payload, and the number of retry attempts
- **Resolution**: Most dead letters are caused by temporary third-party API outages. Once the external service recovers, dead letters can be manually replayed.

### 10.3 Fraud Detection Patterns

Monitor these patterns weekly to detect potential internal fraud:

| Pattern | What It Indicates | Investigation Action |
|:---|:---|:---|
| High void volume at one branch | Possible "void after cash collection" fraud | Compare void timestamps with cash session data |
| Repeated stock adjustments (LOSS) | Potential inventory theft | Review CCTV footage; cross-reference with staff schedules |
| Discounts applied above authorized limits | Unauthorized pricing or kickback arrangements | Audit the discount approvals and verify manager override logs |
| Returns processed without original sale reference | Return fraud (returning items not purchased from this business) | This should be blocked by the system; if occurring, check for process workarounds |
| Cash variance patterns correlated with specific cashiers | Cash skimming | Rotate cashiers between shifts and drawers; compare variance patterns |

### 10.4 System Health Indicators

| Indicator | Expected State | Alert Threshold |
|:---|:---|:---|
| Outbox events pending | < 10 at any time | > 50 pending for > 30 minutes |
| Dead letter count (daily) | 0 | > 5 per day |
| Cash session variance (branch) | < $5 average | > $20 on any single session |
| API response time | < 500ms average | > 2000ms sustained |
| Failed deliveries (daily) | < 10% of total stops | > 25% of stops in a single trip |

### 10.5 Common Concurrency & Performance Troubleshooting

#### 409 Conflict (Concurrency Conflict)

- **Cause**: Two users or processes tried to update the same record (e.g., inventory) at the exact same millisecond.
- **Resolution**: Most 409s are handled automatically by internal retries (`withRetry`). If persistent, check for network latency or exceptionally high-frequency automated updates on a single branch.

#### 500 Internal Server Error (Database Pool Exhaustion)

- **Cause**: High peak load exceeding the `connection_limit` in the `.env` configuration.
- **Resolution**: Increase `DATABASE_URL` parameter `connection_limit=20` and restart the service. Ensure DB server `max_connections` is sufficient.

---

## 11. Plan Management & Compliance

### 11.1 Plan Enforcement Logic

Platform administrators define limits (max users, max branches) that the system enforces in real-time.

- **Unlimited Plans**: A limit of `-1` signifies unlimited access.
- **Enforcement Action**: Users attempting to exceed their plan limits will receive a `403 Forbidden (Limit Reached)` error. Existing data is NEVER deleted if a plan is downgraded; only new creations are blocked.

### 11.2 Subscription Hardening

- **Past Due Status**: If a subscription is marked `PAST_DUE` by Stripe, POS sales and order fulfillment are automatically suspended until payment is resolved.
- **Commercial Safety**: All transactions require active tenant status.

---

> **Document Version:** 2.0.0 (Complete Operational Manual)
> **Classification:** Internal Operations Guide
> **Drafted By:** Antigravity Operations Team
> **Confidentiality:** For Authorized Staff Only
