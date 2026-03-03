# Antigravity Testing Strategy

> **Zero-Gap Quality Enforcement Specification**
> Version: 2.0.0 · Invariant-Based Testing Architecture
> Perspective: Senior QA Architect / Auditor
> Last Updated: February 2026

---

## Table of Contents

- [1. Testing Philosophy](#1-testing-philosophy)
- [2. Risk & Impact Mapping](#2-risk--impact-mapping)
- [3. Unit Test Specifications](#3-unit-test-specifications)
- [4. Integration Test Suites](#4-integration-test-suites)
- [5. End-to-End Workflow Tests](#5-end-to-end-workflow-tests)
- [6. FSM Transition Testing](#6-fsm-transition-testing)
- [7. Security Test Catalog](#7-security-test-catalog)
- [8. Concurrency & Stress Tests](#8-concurrency--stress-tests)
- [9. API Contract Testing](#9-api-contract-testing)
- [10. Failure Injection Scenarios](#10-failure-injection-scenarios)
- [11. Test Data Strategy](#11-test-data-strategy)
- [12. Coverage Requirements](#12-coverage-requirements)
- [13. CI/CD Pipeline Integration](#13-cicd-pipeline-integration)
- [14. Test Environment Management](#14-test-environment-management)

---

## 1. Testing Philosophy

### 1.1 The "Law-Based" Approach

At Antigravity, we move beyond generic code coverage. Our strategy is built on **Invariant Verification**. An invariant is a business law that must *never* be broken, regardless of user input, network failure, or concurrent access.

Traditional testing focuses on "does the button work?". We focus on "can the system sell an item it doesn't have?". By testing for invariants, we ensure that as the codebase grows, the core commercial safety of the business remains unassailable.

### 1.2 The Testing Pyramid

```
              ╱ ╲
             ╱ E2E ╲            ← 10% — Full lifecycle workflows
            ╱───────╲
           ╱  Integ  ╲         ← 30% — Transaction boundaries, multi-service
          ╱───────────╲
         ╱    Unit     ╲       ← 60% — Invariants, FSM guards, calculations
        ╱───────────────╲
```

| Layer | Focus | Count Target | Execution Time |
|:---|:---|:---|:---|
| **Unit (Invariants)** | FSM guards, tax math, cost calculations, permission logic | 500+ tests | < 30 seconds |
| **Integration (Transactions)** | Atomic DB rollbacks, multi-service coordination, ledger consistency | 200+ tests | < 3 minutes |
| **E2E (Lifecycles)** | Shelf-to-signature flows, complete business cycles | 50+ tests | < 10 minutes |
| **Stress (Concurrency)** | OCC under load, idempotency under duplication | 20+ tests | < 5 minutes |

### 1.3 Core Invariants ("The Laws")

These are the non-negotiable business laws that every test suite must validate:

| ID | Invariant | Domain | Catastrophic Failure |
|:---|:---|:---|:---|
| **LAW-01** | Inventory quantity = Sum of all ledger entries | Inventory | Ghost stock; overselling |
| **LAW-02** | Sum(Credits) = Sum(Debits) for every journal entry | Accounting | Unbalanced books; audit failure |
| **LAW-03** | Revenue = $0 until delivery is confirmed | Logistics | Premature revenue recognition |
| **LAW-04** | Tenant A cannot read Tenant B's data | Security | Data breach; legal liability |
| **LAW-05** | Duplicate mutation = same result (idempotent) | Infrastructure | Double charging; inventory leakage |
| **LAW-06** | Terminal FSM states have no outgoing transitions | All Domains | Cancelled orders resurrecting; voided sales reappearing |
| **LAW-07** | No stock adjustment without a ledger entry | Inventory | Unauditable inventory changes |
| **LAW-08** | Cash session balance = Opening + Sales − Refunds | Finance | Cash drawer discrepancies |
| **LAW-09** | Refund cannot exceed original sale amount | Sales | Financial loss through over-refunding |
| **LAW-10** | Sealed pack contents cannot be modified | Warehouse | Delivery content mismatches |

---

## 2. Risk & Impact Mapping

### 2.1 Risk Matrix

| Business Domain | Risk Factor | Likelihood | Impact | Test Priority |
|:---|:---|:---|:---|:---|
| **Inventory** | Ghost stock creation via parallel adjustments | High | Critical | P0 — Every build |
| **Security** | Cross-tenant data leakage (IDOR) | Medium | Catastrophic | P0 — Every build |
| **Finance** | Unbalanced journal entries from VAT rounding | Medium | High | P0 — Every build |
| **Logistics** | Revenue recognized for failed delivery | Medium | High | P0 — Every build |
| **Sales** | Double sale from idempotency bypass | Medium | Critical | P0 — Every build |
| **Warehouse** | Wrong item shipped (barcode mismatch) | High | Medium | P1 — Daily |
| **Procurement** | PO approved without authorization | Low | High | P1 — Daily |
| **Accounting** | Posting to closed accounting period | Low | High | P1 — Daily |
| **Auth** | Privilege escalation via role manipulation | Low | Catastrophic | P0 — Every build |
| **Tenant** | Suspended tenant accessing protected APIs | Low | High | P0 — Every build |

### 2.2 Mandatory Assertions Per Domain

| Domain | Test Scenario | Mandatory Assertion |
|:---|:---|:---|
| **Inventory** | Parallel stock adjustments on same product | Sum of all ledger entries MUST equal final quantity |
| **Security** | IDOR attack simulation | Query for Tenant B's data MUST return `null` or `404` |
| **Finance** | High-volume VAT rounding (10,000 transactions) | Total Credits MUST equal Total Debits |
| **Logistics** | Failed delivery trip completion | Revenue MUST remain at $0 if delivery is not signed |
| **Sales** | Concurrent duplicate requests with same idempotency key | Inventory MUST be deducted exactly ONCE |
| **Warehouse** | Pick item with wrong barcode | System MUST reject with specific error, no qty change |
| **Accounting** | Journal entry in closed period | System MUST reject with 409 Conflict |

---

## 3. Unit Test Specifications

### 3.1 FSM Guard Unit Tests

**File under test**: `src/common/guards/fsm.guard.ts`

The `assertTransition()` function and all 14 transition maps must be exhaustively tested:

```typescript
describe('assertTransition', () => {
    it('should allow PENDING → CONFIRMED for Order', () => {
        expect(() => assertTransition('Order', 'id-1', 'PENDING', 'CONFIRMED', ORDER_TRANSITIONS))
            .not.toThrow();
    });

    it('should reject CANCELLED → SHIPPED for Order (terminal state)', () => {
        expect(() => assertTransition('Order', 'id-1', 'CANCELLED', 'SHIPPED', ORDER_TRANSITIONS))
            .toThrow(ConflictException);
    });

    it('should reject unknown source state', () => {
        expect(() => assertTransition('Order', 'id-1', 'INVALID', 'CONFIRMED', ORDER_TRANSITIONS))
            .toThrow(ConflictException);
    });
});
```

**Required test matrix** (for each of the 14 FSMs):

| FSM | Total States | Valid Transitions | Invalid Transitions (must reject) |
|:---|:---|:---|:---|
| `ORDER_TRANSITIONS` | 10 | 15 valid paths | 85 invalid paths |
| `PICKLIST_TRANSITIONS` | 5 | 6 valid | 19 invalid |
| `DELIVERY_TRIP_TRANSITIONS` | 6 | 8 valid | 28 invalid |
| `PURCHASE_ORDER_TRANSITIONS` | 5 | 5 valid | 20 invalid |
| `QUOTE_TRANSITIONS` | 7 | 7 valid | 42 invalid |
| `SALE_TRANSITIONS` | 4 | 4 valid | 12 invalid |
| `PURCHASE_RETURN_TRANSITIONS` | 6 | 7 valid | 29 invalid |
| `RETURN_TRANSITIONS` | 5 | 5 valid | 20 invalid |
| `REFUND_TRANSITIONS` | 3 | 2 valid | 7 invalid |
| `BRANCH_TRANSFER_TRANSITIONS` | 5 | 5 valid | 20 invalid |
| `CHARGEBACK_TRANSITIONS` | 3 | 2 valid | 7 invalid |
| `TAX_FILING_TRANSITIONS` | 3 | 2 valid | 7 invalid |
| `MANIFEST_TRANSITIONS` | 5 | 5 valid | 20 invalid |
| `SUBSTITUTION_TRANSITIONS` | 3 | 2 valid | 7 invalid |

> [!IMPORTANT]
> **Every terminal state must be tested**: Ensure that transitions OUT of terminal states (`CANCELLED`, `COMPLETED`, `REJECTED`, etc.) always throw `ConflictException`. A terminal state with outgoing transitions is a critical bug.

### 3.2 Weighted Average Cost Calculation

**File under test**: `src/inventory/inventory-ledger.service.ts`

```typescript
describe('Weighted Average Cost', () => {
    it('should calculate WAC on first receipt', () => {
        // Initial: 0 qty, $0 cost
        // Receive: 100 units @ $10.00
        // Expected: WAC = $10.00
    });

    it('should blend WAC on second receipt', () => {
        // Current: 100 qty @ $10.00 (total value = $1,000)
        // Receive: 50 units @ $14.00 (added value = $700)
        // Expected: WAC = $1,700 / 150 = $11.33
    });

    it('should preserve WAC on sale (outgoing)', () => {
        // Current: 150 qty @ $11.33
        // Sell: 30 units
        // Expected: WAC remains $11.33, qty = 120
    });

    it('should handle zero inventory correctly', () => {
        // Current: 0 qty, $0 cost
        // Receive: 10 units @ $25.00
        // Expected: WAC = $25.00 (no division by zero)
    });

    it('should prevent negative stock on SALE type', () => {
        // Current: 5 qty
        // Attempt: Sell 10 units
        // Expected: BadRequestException('Insufficient stock')
    });
});
```

### 3.3 Permission Resolution Logic

**File under test**: `src/auth/permissions.guard.ts`

| Test Case | User Scope | User Tenant | Request Tenant | Request Branch | Expected |
|:---|:---|:---|:---|:---|:---|
| Platform user, any tenant | PLATFORM | — | alpha | — | ✅ Granted |
| Tenant admin, matching tenant | TENANT | alpha | alpha | — | ✅ Granted |
| Tenant admin, different tenant | TENANT | alpha | beta | — | ❌ Denied |
| Branch user, matching tenant + branch | BRANCH | alpha | alpha | branch-1 | ✅ Granted |
| Branch user, matching tenant, wrong branch | BRANCH | alpha | alpha | branch-2 | ❌ Denied |
| Branch user, wrong tenant | BRANCH | alpha | beta | branch-1 | ❌ Denied |
| No permissions required on endpoint | — | — | — | — | ✅ Granted |
| User with no roles | — | alpha | alpha | — | ❌ Denied |

### 3.4 Tax Calculation Tests

| Scenario | Subtotal | Tax Rate | Expected Tax | Expected Total |
|:---|:---|:---|:---|:---|
| Standard sale | $100.00 | 15% | $15.00 | $115.00 |
| Multi-item rounding | $33.33 × 3 | 15% | $15.00 (not $14.99) | $114.99 |
| Zero-tax item | $50.00 | 0% | $0.00 | $50.00 |
| High-precision amount | $0.01 | 15% | $0.00 (rounds down) | $0.01 |
| Bulk order | $99,999.99 | 15% | $15,000.00 | $114,999.99 |

### 3.5 Idempotency Key Validation

**File under test**: `src/common/middleware/idempotency.middleware.ts`

| Test Case | Method | Path | Key Header | Tenant | Expected |
|:---|:---|:---|:---|:---|:---|
| GET request (exempt) | GET | `/api/v1/sales` | — | alpha | Pass through |
| POST without key | POST | `/api/v1/sales` | — | alpha | 400 Bad Request |
| POST with key, first time | POST | `/api/v1/sales` | `key-1` | alpha | Creates record, proceeds |
| POST with key, in-flight | POST | `/api/v1/sales` | `key-1` | alpha | 409 Conflict |
| POST with key, completed | POST | `/api/v1/sales` | `key-1` | alpha | Replay cached response |
| POST with expired key | POST | `/api/v1/sales` | `expired-key` | alpha | Deletes old, proceeds as new |
| Auth path (exempt) | POST | `/auth/login` | — | — | Pass through |
| Same key, different tenant | POST | `/api/v1/sales` | `key-1` | beta | Independent record |

---

## 4. Integration Test Suites

### 4.1 Sale Creation Transaction (Atomic)

**Tests for**: `src/sales/sales.service.ts` → `create()`

This is the most complex transactional test because a single sale atomically performs:

1. Create Sale record
2. Create SaleItem records
3. Deduct inventory via `InventoryLedgerService`
4. Create InventoryLedger entries
5. Generate Invoice
6. Create Payment record
7. Post Revenue journal entry (DR Cash / CR Revenue)
8. Post COGS journal entry (DR COGS / CR Inventory Asset)
9. Schedule Outbox event (`sale.created`)
10. Log Audit entry

**Test Cases:**

| Test ID | Scenario | Setup | Expected Result |
|:---|:---|:---|:---|
| SALE-INT-01 | Happy path: single item sale | 100 units in stock, valid branch, open period | All 10 steps succeed atomically |
| SALE-INT-02 | Insufficient stock | 0 units in stock | BadRequestException; NO Sale record created; NO ledger entry |
| SALE-INT-03 | Missing payment | Valid stock, no payment info | Rejection; full rollback |
| SALE-INT-04 | Closed accounting period | Valid stock, period is CLOSED | Rejection or warning |
| SALE-INT-05 | Journal entry imbalance (injected) | Force journal imbalance | Full rollback; sale NOT created |

**Verification Assertions (SALE-INT-01):**

```typescript
// After successful sale:
expect(sale.status).toBe('COMPLETED');
expect(inventory.quantity).toBe(previousQty - soldQty);
expect(ledgerEntries).toHaveLength(1);
expect(ledgerEntries[0].type).toBe('SALE');
expect(ledgerEntries[0].quantityChange).toBe(-soldQty);
expect(journalEntry.lines).toSatisfy(lines => 
    sumDebits(lines) === sumCredits(lines)
);
expect(auditLog).toContain({ action: 'CREATE', entityType: 'Sale' });
expect(outboxEvent.topic).toBe('sale.created');
```

### 4.2 Sale Voiding Transaction (Inverse)

**Tests for**: `src/sales/sales.service.ts` → `voidSale()`

The void must be the exact mathematical inverse of the create:

| Step | Create | Void (must reverse) |
|:---|:---|:---|
| Inventory | −10 units | +10 units |
| COGS | DR COGS $100, CR Inventory $100 | DR Inventory $100, CR COGS $100 |
| Revenue | DR Cash $150, CR Revenue $150 | DR Revenue $150, CR Cash $150 |
| Invoice | Generated | Cancelled |
| Status | COMPLETED | VOIDED |

**Critical Assertion**: After voiding, the net inventory effect must be ZERO. The net journal entry effect must be ZERO. The system returns to the exact financial state as if the sale never happened.

### 4.3 Delivery Trip Completion Transaction

**Tests for**: `src/logistics/delivery-trips.service.ts` → `completeTrip()`

| Test ID | Scenario | Expected Result |
|:---|:---|:---|
| TRIP-INT-01 | All stops DELIVERED | Inventory committed for all items; driver/vehicle released; revenue posted |
| TRIP-INT-02 | Mixed: 2 DELIVERED, 1 FAILED | Only delivered items committed; failed items return to available; partial revenue |
| CON-001 | Concurrent Inventory Updates | Multiple Sales/Orders hitting the same SKU simultaneously. | OCC version match. |
| RES-001 | Retriable Operations | Database deadlock during high-load transaction. | Auto-retry success via `withRetry`. |
| IDE-001 | Idempotent API Requests | Double-submit on sales or payment capture. | Second request returns cached result, no side effects. |
| TRIP-INT-03 | All stops FAILED | No inventory committed; all items return to available; zero revenue; trip status FAILED |
| TRIP-INT-04 | Trip with no stops | Should not be startable (pre-validation) |

### 4.4 Inventory Ledger Consistency

**Tests for**: `src/inventory/inventory-ledger.service.ts`

After any sequence of operations, verify **LAW-01**:

```typescript
describe('Ledger Consistency Invariant', () => {
    it('should maintain quantity = sum(ledger) after receipt + sale + adjustment', async () => {
        // 1. Receive 100 units
        await ledgerService.recordTransaction({ type: 'RECEIPT', quantityChange: 100, ... });
        // 2. Sell 30 units  
        await ledgerService.recordTransaction({ type: 'SALE', quantityChange: -30, ... });
        // 3. Adjust -5 units (damage)
        await ledgerService.recordTransaction({ type: 'ADJUSTMENT', quantityChange: -5, ... });
        
        const inventory = await getInventory(branchId, productId);
        const ledgerSum = await sumLedgerEntries(branchId, productId);
        
        expect(inventory.quantity).toBe(65);     // 100 - 30 - 5
        expect(inventory.quantity).toBe(ledgerSum); // LAW-01 ✓
    });
});
```

### 4.5 Purchase Return Transaction

**Tests for**: `src/purchase-returns/purchase-returns.service.ts`

| Test ID | Scenario | Assertions |
|:---|:---|:---|
| RTV-INT-01 | Create RTV for received PO | Inventory decremented, ledger entry PURCHASE_RETURN, audit logged |
| RTV-INT-02 | Return quantity > received quantity | BadRequestException, no inventory change |
| RTV-INT-03 | RTV on DRAFT PO | Rejected — PO must be RECEIVED |
| RTV-INT-04 | Reject RTV after approval | Inventory restored (incremented back), ledger reversal entry |

### 4.6 Accounting Period Locking

**Tests for**: `src/accounting/accounting.service.ts`

| Test ID | Scenario | Assertions |
|:---|:---|:---|
| ACCT-INT-01 | Close an open period with no pending entries | Period status → CLOSED, audit logged |
| ACCT-INT-02 | Post journal entry to closed period | Rejected with clear error message |
| ACCT-INT-03 | Create sale that would post to closed period | Sale rejected or posts to current open period |
| ACCT-INT-04 | Reverse a posted journal entry | New reversing entry created; original untouched |
| ACCT-INT-05 | Journal entry with unbalanced lines | Rejected at creation time |

---

## 5. End-to-End Workflow Tests

### 5.1 Scenario A: "Shelf to Signature" (Complete Sale Lifecycle)

**Objective**: Validate the entire flow from inventory receipt to cash reconciliation.

```
Receive goods (PO) → Stock arrives → Customer buys at POS → 
    Pick → Pack → Load → Deliver → Signature → Revenue recognized → 
        Cash session closed → Z-Report generated
```

**Steps & Assertions:**

| Step | Action | Verification |
|:---|:---|:---|
| 1 | Create PO for 50x Brake Pads | PO status = DRAFT |
| 2 | Receive goods | Inventory += 50, WAC calculated, ledger entry |
| 3 | Customer orders 10x at POS | Sale COMPLETED, inventory -= 10, invoice generated |
| 4 | Generate pick list | PickList status = CREATED, 10x Brake Pads listed |
| 5 | Pick all items (barcode scan) | PickList status = PICKED |
| 6 | Seal pack | Pack status = SEALED |
| 7 | Create delivery trip | Trip status = PLANNED |
| 8 | Load pack onto trip | Trip has 1 pack |
| 9 | Start trip | Trip status = IN_TRANSIT, order status = OUT_FOR_DELIVERY |
| 10 | Complete stop (DELIVERED) | Stop = DELIVERED |
| 11 | Complete trip | Inventory committed, revenue journal posted, driver released |
| 12 | Close cash session | Expected balance calculated, Z-Report generated |
| **Final** | **Invariant check** | **Ledger balance = physical qty; Credits = Debits; Revenue matches sale** |

### 5.2 Scenario B: "The Malicious Actor" (Idempotency Replay Attack)

**Objective**: Verify that the idempotency layer is truly hardened against replay attacks.

**Steps:**

1. Submit a Sale request (`POST /api/v1/sales`) with `Idempotency-Key: attack-key-001`
2. While step 1 is processing, submit the *exact same* request again concurrently
3. After step 1 completes, submit the same request a third time

**Expected Results:**

| Request | Expected Response | Reason |
|:---|:---|:---|
| Request 1 | `201 Created` | First execution — creates sale |
| Request 2 | `409 Conflict` | In-flight detection via unique constraint |
| Request 3 | `201 Created` (replayed body) | Completed record — cached response returned |

**Safety Assertion**: Inventory is deducted **exactly once**. Only ONE sale record exists. Only ONE set of journal entries is posted.

### 5.3 Scenario C: "The Last Item" (OCC Race Condition)

**Objective**: Prove Optimistic Concurrency Control under extreme contention.

**Setup**: 1 item in stock at Branch A. 50 parallel API requests attempt to buy it.

**Execution**: Fire 50 concurrent `POST /api/v1/sales` requests with unique idempotency keys.

**Validation:**

- Exactly **1 request** succeeds with `201 Created`
- Exactly **49 requests** fail with `400 Bad Request` (insufficient stock) or `409 Conflict` (OCC retry exhausted)
- Final inventory quantity = **0** (not negative)
- Ledger entries sum to exactly **−1**
- Only **1 sale** record exists in the database

> [!CAUTION]
> If this test passes with more than 1 successful sale, the OCC mechanism has a critical bug. This scenario MUST be run on every CI build.

### 5.4 Scenario D: B2B Quote-to-Order Lifecycle

**Objective**: Validate the full B2B quoting pipeline from creation to revenue.

```
Create Quote (DRAFT) → Send to Client (SENT) → Client Accepts (ACCEPTED) → 
    Convert to Order → Fulfill → Deliver → Revenue recognized
```

**Key Assertions:**

- Quote prices are **snapshotted** at creation — subsequent price rule changes must NOT affect the quote
- Converting an **expired** quote must be rejected
- Converting a **rejected** quote must be rejected
- The order created from the quote must carry the exact quoted prices, not current catalog prices

### 5.5 Scenario E: Multi-Branch Transfer Lifecycle

**Objective**: Validate that inter-branch transfers maintain inventory integrity across locations.

```
Branch A: 100 units → Transfer 30 to Branch B → 
    Branch A: 70 units, Branch B: +30 units
```

**Key Assertions:**

- While transfer is `APPROVED` (before shipping): Branch A's available stock decreases by 30 (locked)
- While transfer is `SHIPPED` (in transit): Stock is neither at A nor B
- After transfer is `RECEIVED`: Branch B has +30, total system inventory unchanged
- **Invariant**: Total inventory across all branches = constant throughout the transfer lifecycle

---

## 6. FSM Transition Testing

### 6.1 Positive Path Coverage

Every **valid** transition in every FSM must have a corresponding test:

```typescript
describe('Order FSM - Valid Transitions', () => {
    it.each([
        ['PENDING', 'CONFIRMED'],
        ['PENDING', 'CANCELLED'],
        ['CONFIRMED', 'PROCESSING'],
        ['CONFIRMED', 'CANCELLED'],
        ['PROCESSING', 'SHIPPED'],
        ['PROCESSING', 'PARTIALLY_FULFILLED'],
        ['PROCESSING', 'CANCELLED'],
        ['SHIPPED', 'DELIVERED'],
        ['SHIPPED', 'DELIVERY_FAILED'],
        ['DELIVERY_FAILED', 'PROCESSING'],
        ['DELIVERY_FAILED', 'CANCELLED'],
    ])('should allow %s → %s', (from, to) => {
        expect(() => assertTransition('Order', 'test-id', from, to, ORDER_TRANSITIONS))
            .not.toThrow();
    });
});
```

### 6.2 Negative Path Coverage (Terminal State Enforcement)

Every **terminal state** must be tested for zero outgoing transitions:

```typescript
describe('Order FSM - Terminal States', () => {
    const terminalStates = ['DELIVERED', 'CANCELLED'];
    const allStates = Object.keys(ORDER_TRANSITIONS);

    terminalStates.forEach(terminal => {
        allStates.forEach(target => {
            it(`should reject ${terminal} → ${target}`, () => {
                expect(() => assertTransition('Order', 'test-id', terminal, target, ORDER_TRANSITIONS))
                    .toThrow(ConflictException);
            });
        });
    });
});
```

### 6.3 Full Transition Matrix Requirement

For each of the 14 FSMs, the test suite must cover:

| What to Test | Why |
|:---|:---|
| Every valid transition (happy path) | Ensures the FSM allows legitimate operations |
| Every invalid transition (from each state) | Ensures the FSM blocks illegal operations |
| Every terminal state → any other state | Ensures terminal states are truly terminal |
| Unknown source state | Ensures graceful handling of corrupted data |
| Same source and target state | Ensures self-transitions are explicitly handled |

---

## 7. Security Test Catalog

### 7.1 Multi-Tenant Isolation (IDOR Prevention)

| Test ID | Attack Vector | Expected Defense |
|:---|:---|:---|
| SEC-01 | Tenant A user GETs Tenant B's sale by UUID | Returns `null` — `TenantAwarePrismaService` filters at query level |
| SEC-02 | Tenant A user GETs Tenant B's inventory record | Returns `null` |
| SEC-03 | Tenant A user attempts to update Tenant B's order | `updateMany` with `tenantId` filter → 0 rows affected |
| SEC-04 | Tenant A user enumerates Tenant B's delivery trips | Returns empty array (filtered at `findMany`) |
| SEC-05 | Platform user queries across all tenants | Returns data from ALL tenants (bypass active) |

**Implementation Pattern:**

```typescript
describe('Tenant Isolation', () => {
    it('SEC-01: Tenant A cannot access Tenant B sale', async () => {
        // Create sale as Tenant B
        const sale = await createSaleAsTenantB();
        
        // Attempt to read as Tenant A
        const result = await salesService.findOne(sale.id, tenantAId);
        
        expect(result).toBeNull();  // MUST NOT return Tenant B's data
    });
});
```

### 7.2 Suspended Tenant Enforcement

| Test ID | Scenario | Expected |
|:---|:---|:---|
| SEC-06 | SUSPENDED tenant calls `GET /api/v1/sales` | 403 Forbidden with suspension reason |
| SEC-07 | SUSPENDED tenant calls `POST /api/v1/sales` | 403 Forbidden |
| SEC-08 | SUSPENDED tenant calls `POST /auth/login` | ✅ Allowed (exempt path) |
| SEC-09 | SUSPENDED tenant calls `POST /api/platform/tenants/:id/reactivate` | ✅ Allowed (platform admin path) |
| SEC-10 | ACTIVE tenant calls any API | ✅ Allowed — no interference |

### 7.3 Permission Escalation Tests

| Test ID | Attack | Expected |
|:---|:---|:---|
| SEC-11 | Cashier attempts `POST /api/v1/sales-extensions/sales/:id/void` | 403 Forbidden (requires Manager) |
| SEC-12 | Driver attempts `GET /api/v1/accounting/accounts` | 403 Forbidden (requires Finance) |
| SEC-13 | Warehouse staff attempts to close accounting period | 403 Forbidden (requires Financial Controller) |
| SEC-14 | Sales rep attempts to suspend a tenant | 403 Forbidden (requires Platform Admin) |
| SEC-15 | Non-platform user access platform admin APIs | 403 Forbidden |

### 7.4 JWT Security Tests

| Test ID | Scenario | Expected |
|:---|:---|:---|
| SEC-16 | Request with no Authorization header | 401 Unauthorized |
| SEC-17 | Request with expired JWT | 401 Unauthorized |
| SEC-18 | Request with tampered JWT (modified payload) | 401 Unauthorized (signature invalid) |
| SEC-19 | Request with JWT from different signing key | 401 Unauthorized |

---

## 8. Concurrency & Stress Tests

### 8.1 Inventory OCC Stress Test

**Setup**: 100 units of Product X at Branch A.

| Test | Concurrent Requests | Action | Expected Final Qty | Expected Successes |
|:---|:---|:---|:---|:---|
| STRESS-01 | 100 parallel sales (1 unit each) | `POST /api/v1/sales` | 0 | 100 (no contention if sequenced) |
| STRESS-02 | 200 parallel sales (1 unit each) on 100 stock | `POST /api/v1/sales` | 0 | Exactly 100 succeed, 100 fail |
| STRESS-03 | 50 sales + 50 receipts simultaneously | Mixed | Starting qty + 50 - successful sales | Varies; ledger integrity maintained |

**Invariant Check After Every Stress Test:**

```typescript
const inventory = await getInventory(branchId, productId);
const ledgerSum = await prisma.inventoryLedger.aggregate({
    where: { branchId, productId },
    _sum: { quantityChange: true },
});
expect(inventory.quantity).toBe(ledgerSum._sum.quantityChange);
```

### 8.2 Idempotency Under Load

**Test**: Send 100 identical `POST /api/v1/sales` requests with the SAME `Idempotency-Key` simultaneously.

**Expected**:

- Exactly 1 sale created
- Exactly 1 inventory deduction
- 99 requests receive either `409 Conflict` or replayed `201 Created`

### 8.3 Cash Session Concurrency

**Test**: Two cashiers attempt to close the same cash session simultaneously.

**Expected**: Only one close succeeds. The other receives a conflict error.

### 8.4 Volume Test: "End-of-Month Burst"

**Objective**: Simulate peak load conditions.

| Metric | Target | Fail Threshold |
|:---|:---|:---|
| 10,000 sale transactions in 5 minutes | < 500ms avg response | > 2000ms avg |
| 1,000 concurrent inventory queries | < 200ms avg response | > 1000ms avg |
| 500 delivery trip completions | All succeed atomically | Any partial commit |

---

## 9. API Contract Testing

### 9.1 Request Validation

Every endpoint must validate its DTO and return structured error responses:

| Test | Input | Expected Status | Expected Body |
|:---|:---|:---|:---|
| Missing required field | `{}` on `POST /api/v1/sales` | 400 | Error referencing missing field |
| Invalid enum value | `status: "INVALID"` | 400 | Error listing valid values |
| Negative quantity | `quantity: -5` on sale item | 400 | Descriptive validation error |
| String where number expected | `amount: "abc"` | 400 | Type validation error |
| Extra unknown fields | `{ name: "x", hackField: true }` | 201 | Extra fields ignored (or stripped) |

### 9.2 Response Format Consistency

Every successful API response must include:

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601",
  // ... domain-specific fields
}
```

Every error response must include:

```json
{
  "statusCode": 400,
  "message": "Descriptive error message",
  "error": "Bad Request"
}
```

### 9.3 Header Contract Tests

| Header | Requirement | Test |
|:---|:---|:---|
| `X-Correlation-ID` | Present on every response | Assert header exists and is a valid UUID |
| `Idempotency-Key` | Required on POST/PATCH/PUT (non-exempt) | Assert 400 when missing |
| `Authorization` | Required on all protected endpoints | Assert 401 when missing |
| `X-Tenant` | Resolves tenant context | Assert correct tenant isolation |

---

## 10. Failure Injection Scenarios

### 10.1 Transactional Rollback ("Crash-Mid-Code")

Inject an error between DB writes to verify atomicity:

| Injection Point | Expected Behavior |
|:---|:---|
| After Sale creation, before Inventory update | Sale MUST NOT be permanently saved |
| After Inventory update, before Journal Entry | Both Sale and Inventory MUST roll back |
| After Journal Entry, before Outbox event | All three MUST roll back |
| After Outbox creation, before commit | All four MUST roll back |

> [!CAUTION]
> If a Sale is created but the Inventory update fails, the Sale MUST NOT be permanently saved. A partial transaction is a financial audit nightmare — it means revenue was recorded without a corresponding inventory movement.

### 10.2 Outbox Partition ("Network Cut")

**Test**: Disable the `OutboxProcessor` (simulate network partition) and create 100 sales.

**Verification:**

1. All 100 sales succeed (Outbox events are written to DB, not sent)
2. OutboxEvent table contains 100 records with status = `PENDING`
3. Re-enable the processor
4. All 100 events are published in creation order
5. After processing: all 100 events have status = `PROCESSED`

**Invariant**: The system "doesn't forget." Outbox events are durable because they share a transaction with the business operation.

### 4. Stress & Performance Testing (Production-Grade)

- **POS High-Concurrency**: Simulating 100 concurrent sales within sub-second intervals.
- **B2B Bulk Processing**: Processing 50+ complex B2B orders with multi-SKU allocations simultaneously.
- **Database Scaling**: Verifying connection pool behavior under saturation (Prisma `connection_limit` optimization).

**Current Benchmarks:**

- **Success Rate**: 100% on B2B Bulk Processing.
- **POS Throughput**: Optimized for high-frequency low-latency updates with jittered retries to handle pool limitations.
- **Resilience**: The system must recover from transient failures (database locks, network blips) without data loss or duplication.
- **Concurrency**: High-volume parallel operations must maintain strict data integrity through Optimistic Concurrency Control (OCC).

### 10.3 Database Connection Failure

**Test**: Simulate a brief database outage during a sale.

**Expected**:

- Request fails with 500 Internal Server Error
- No partial data is written
- Idempotency record (if created) is cleaned up or allows retry
- System recovers automatically when database returns

### 10.4 External Service Timeout (Stripe)

**Test**: Simulate Stripe API timeout during payment processing.

**Expected**:

- Payment record created with status `PENDING`
- Sale is NOT completed until payment is confirmed
- Webhook-based reconciliation eventually completes the payment
- No double charging on retry

---

## 11. Test Data Strategy

### 11.1 The "Golden Image" Seed

We maintain a `prisma/demo-seed.ts` that populates a realistic world:

| Data Category | Volume | Purpose |
|:---|:---|:---|
| Tenants | 3 (Alpha, Beta, Gamma) | Multi-tenant isolation testing |
| Branches per tenant | 3–5 | Branch-scoped testing |
| Products (global) | 5,000 SKUs | Realistic catalog with brands and categories |
| Users per tenant | 10–15 (all roles) | Role-based access testing |
| Inventory records | 15,000+ | Stock across all products and branches |
| Historical sales | 1,000+ | Reporting and analytics verification |
| Historical ledger entries | 5,000+ | Ledger consistency verification |
| Suppliers | 20 | Procurement testing |
| Business clients | 50 | B2B quoting testing |

### 11.2 Test Isolation

Every test suite follows these principles:

1. **Database Reset**: Each test suite starts from the Golden Image state (no test contaminates another)
2. **Deterministic IDs**: Use fixed UUIDs for test entities so assertions can reference them directly
3. **Tenant Isolation**: Tests for different tenants use separate test accounts (Alpha tests never touch Beta data)
4. **Time Control**: Tests that depend on time (quote expiry, idempotency TTL) use injectable clock services

### 11.3 Test Data Anti-Patterns

| ❌ Don't | ✅ Do |
|:---|:---|
| Create test data with `Math.random()` IDs | Use deterministic, fixed UUIDs |
| Share state between test cases | Reset state before each test (or use transactions) |
| Depend on execution order | Each test must be independently runnable |
| Test with 1 item when production has 5,000 | Use realistic volumes for at least some scenarios |
| Hard-code dates that will eventually pass | Use relative dates (e.g., `new Date()`, `addDays(30)`) |

---

## 12. Coverage Requirements

### 12.1 Minimum Coverage Thresholds

| Metric | Minimum | Target | Critical Modules (Must Exceed) |
|:---|:---|:---|:---|
| **Line Coverage** | 80% | 90% | `SalesService`: 95%, `InventoryLedgerService`: 95% |
| **Branch Coverage** | 75% | 85% | `PermissionsGuard`: 90%, `IdempotencyMiddleware`: 90% |
| **Function Coverage** | 85% | 95% | All FSM functions: 100% |
| **Invariant Coverage** | 100% | 100% | All 10 Laws: 100% (non-negotiable) |

### 12.2 Critical Path Coverage (Must Be 100%)

The following code paths must have 100% test coverage — no exceptions:

| Code Path | Reason |
|:---|:---|
| `assertTransition()` + all 14 FSM maps | Core business logic integrity |
| `TenantAwarePrismaService.$allOperations()` | Data isolation guarantee |
| `IdempotencyMiddleware.use()` | Financial safety |
| `InventoryLedgerService.executeInventoryLogic()` | Stock accuracy |
| `PermissionsGuard.canActivate()` | Authorization enforcement |
| `AccountingService.createJournalEntry()` (balance validation) | Financial accuracy |
| `TenantMiddleware.use()` (suspension check) | Tenant governance |
| `AuditService.logAction()` | Compliance traceability |

### 12.3 Coverage Exceptions

The following are acceptable at lower coverage:

| Area | Acceptable Coverage | Reason |
|:---|:---|:---|
| DTOs and type definitions | 0% | No logic to test |
| Module registration (`*.module.ts`) | 0% | NestJS boilerplate |
| Seed scripts (`prisma/demo-seed.ts`) | 0% | Development utility |
| Debug logging statements | Excluded | Console.log has no business logic |

---

## 13. CI/CD Pipeline Integration

### 13.1 Pipeline Stages

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Lint    │───▶│  Unit   │───▶│ Integr.  │───▶│   E2E    │───▶│  Deploy  │
│          │    │  Tests   │    │  Tests   │    │  Tests   │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
  < 30s           < 30s           < 3 min         < 10 min       Conditional
```

### 13.2 Gate Requirements

| Stage | Must Pass | Blocks |
|:---|:---|:---|
| **Lint** | Zero ESLint errors | All subsequent stages |
| **Unit Tests** | 100% pass, coverage ≥ 80% | Integration tests |
| **Integration Tests** | 100% pass, all invariants ✅ | E2E tests |
| **E2E Tests** | 100% pass, all scenarios ✅ | Deployment |
| **Security Tests** | 100% pass (SEC-01 through SEC-19) | Deployment |
| **Stress Tests** | All invariants hold under load | Production deployment |

### 13.3 Test Execution Commands

```bash
# Unit tests only (fast feedback)
npm run test

# Unit tests with coverage report
npm run test -- --coverage

# Integration tests (requires database)
npm run test:integration

# E2E tests (requires full application stack)
npm run test:e2e

# Stress tests (requires database + application)
npm run test:stress

# Full test suite (all layers)
npm run test:all

# Specific domain tests
npm run test -- --testPathPattern=sales
npm run test -- --testPathPattern=inventory
npm run test -- --testPathPattern=fsm
```

### 13.4 Pre-Commit Hooks

Before every commit, these checks run automatically:

1. **Lint**: `eslint --fix` on staged files
2. **Type Check**: `tsc --noEmit` to catch type errors
3. **Affected Unit Tests**: Run unit tests for files modified in the commit
4. **FSM Invariant Check**: Always run FSM transition tests (they're fast and critical)

---

## 14. Test Environment Management

### 14.1 Environment Matrix

| Environment | Database | Purpose | Test Types |
|:---|:---|:---|:---|
| **Local (Dev)** | SQLite or local PostgreSQL | Developer iteration | Unit, selected integration |
| **CI (Pipeline)** | Docker PostgreSQL | Automated verification | All: unit + integration + E2E + stress |
| **Staging** | Managed PostgreSQL (isolated) | Pre-production validation | E2E + manual exploratory |
| **Production** | Production PostgreSQL | Live monitoring | Smoke tests only (read-only) |

### 14.2 Database Management

```bash
# Reset test database to Golden Image state
npx prisma migrate reset --force

# Seed test data
npx prisma db seed

# Generate Prisma client after schema changes
npx prisma generate
```

### 14.3 Test Naming Conventions

```
[Domain].[Layer].[Scenario].[Polarity]

Examples:
  sales.unit.create-sale.happy-path
  inventory.integration.occ-conflict.negative
  logistics.e2e.shelf-to-signature.full-lifecycle
  security.unit.idor-prevention.tenant-isolation
  fsm.unit.order-transitions.terminal-state-enforcement
```

### 14.4 Flaky Test Policy

> [!IMPORTANT]
> Flaky tests are **bugs**, not inconveniences. They indicate either:
>
> 1. Non-deterministic behavior in the code (concurrency issue)
> 2. Test environment instability (shared database state)
> 3. Time-dependent logic without proper mocking
>
> **Policy**: Any test that fails intermittently must be investigated within 24 hours. If the root cause cannot be fixed immediately, the test is quarantined (tagged `@skip` with a tracking ticket) — NOT deleted.

---

> **Document Version:** 2.0.0 (Complete Testing Strategy)
> **Classification:** Internal Engineering & QA Document
> **Drafted By:** Antigravity QA Architecture Team
> **Confidentiality:** For Engineering & QA Staff Only
