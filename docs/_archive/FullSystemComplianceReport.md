# Full System Implementation Compliance Report

*Generated: 2026-02-19 | Antigravity Commerce Platform*

---

## TABLE 1 — Use Case Coverage

| ID | Module | Use Case | Flow Type | Status | Gap |
|:---|:---|:---|:---|:---|:---|
| UC-PR-01 | Purchase Returns | Create RTV Request | Positive | ✅ Implemented | — |
| UC-PR-02 | Purchase Returns | Return qty > received | Negative | ✅ Validated | — |
| UC-PR-03 | Purchase Returns | Return from non-received PO | Edge | ✅ Validated | — |
| UC-PR-04 | Purchase Returns | Approve RTV (Supplier Ack) | Positive | ❌ MISSING | No APPROVE transition |
| UC-PR-05 | Purchase Returns | Complete RTV (Shipped) | Positive | ❌ MISSING | No COMPLETE transition |
| UC-PR-06 | Purchase Returns | Reject RTV | Negative | ❌ MISSING | No REJECT transition |
| UC-PR-07 | Purchase Returns | Create return on DRAFT PO | Deny | ✅ Validated | — |
| UC-PR-08 | Purchase Returns | Unauthorized role creates return | Role | ✅ Validated | Guards enforced |
| UC-PR-09 | Purchase Returns | Negative inventory after return | Invariant | ✅ Validated | Stock check enforced |
| UC-TA-01 | Tenant Admin | Suspend active tenant | Positive | ✅ Implemented | — |
| UC-TA-02 | Tenant Admin | Reactivate suspended tenant | Positive | ✅ Implemented | — |
| UC-TA-03 | Tenant Admin | Suspend already-suspended tenant | Negative | ✅ Validated | — |
| UC-TA-04 | Tenant Admin | Suspended tenant calls any API | Deny | ❌ MISSING | TenantMiddleware not blocking |
| UC-TA-05 | Tenant Admin | Non-Platform-Admin suspends tenant | Role | ✅ Validated | — |
| UC-TA-06 | Tenant Admin | Reactivate active tenant | Deny | ✅ Validated | — |
| UC-SE-01 | Sale Extensions | Void COMPLETED sale | Positive | ✅ Implemented | — |
| UC-SE-02 | Sale Extensions | Void in closed accounting period | Deny | ✅ Validated | Period check enforced |
| UC-SE-03 | Sale Extensions | Void VOIDED sale | Negative | ✅ Validated | — |
| UC-SE-04 | Sale Extensions | Void cross-tenant sale | Security | ✅ Validated | TenantId check |
| UC-SE-05 | Sale Extensions | Create Quote for B2B client | Positive | ✅ Implemented | — |
| UC-SE-06 | Sale Extensions | Convert Quote to Order | Positive | ❌ MISSING | No quote→order flow |
| UC-SE-07 | Sale Extensions | Reject / Expire Quote | Lifecycle | ❌ MISSING | No lifecycle transitions |
| UC-SE-08 | Sale Extensions | Quote with expired validUntil | Deny | ❌ MISSING | No expiry validation |
| UC-LG-01 | Logistics | Create delivery trip (internal fleet) | Positive | ✅ Implemented | — |
| UC-LG-02 | Logistics | Create trip (external courier) | Positive | ✅ Implemented | — |
| UC-LG-03 | Logistics | Add stop to PLANNED trip | Positive | ✅ Implemented | — |
| UC-LG-04 | Logistics | Add pack to LOADING trip | Positive | ✅ Implemented | — |
| UC-LG-05 | Logistics | Start loading phase | Positive | ✅ Implemented | — |
| UC-LG-06 | Logistics | Start trip (dispatch) | Positive | ✅ Implemented | — |
| UC-LG-07 | Logistics | Arrive at stop | Positive | ✅ Implemented | — |
| UC-LG-08 | Logistics | Complete stop (DELIVERED) | Positive | ✅ Implemented | — |
| UC-LG-09 | Logistics | Complete stop (FAILED) | Negative | ✅ Implemented | — |
| UC-LG-10 | Logistics | Complete trip | Positive | ✅ Implemented | — |
| UC-LG-11 | Logistics | Fail trip | Negative | ✅ Implemented | — |
| UC-LG-12 | Logistics | Driver busy — create trip | Deny | ✅ Validated | currentTripId check |
| UC-LG-13 | Logistics | Add stop to IN_TRANSIT trip | Deny | ✅ Validated | Status check |
| UC-LG-14 | Logistics | No packs when starting trip | Deny | ✅ Validated | — |
| UC-LG-15 | Logistics | No @UseGuards on controllers | Security | ❌ MISSING | RBAC not applied |
| UC-LG-16 | Logistics | Inventory not committed on FAILED stop | Rollback | ✅ Validated | Only DELIVERED commits |
| UC-WH-01 | Warehouse | List pick lists | Positive | ✅ Implemented | — |
| UC-WH-02 | Warehouse | Start picking | Positive | ✅ Implemented | — |
| UC-WH-03 | Warehouse | Pick item (correct barcode) | Positive | ✅ Implemented | — |
| UC-WH-04 | Warehouse | Cancel pick list | Negative | ✅ Implemented | — |
| UC-WH-05 | Warehouse | Pick without Trip DISPATCHED | Deny | ❌ MISSING | No trip status check |
| UC-WH-06 | Warehouse | Pack sealed items | Positive | ✅ Implemented | — |
| UC-WH-07 | Warehouse | Pack unsealable items | Deny | ✅ Validated | — |
| UC-WH-08 | Warehouse | No @UseGuards on controllers | Security | ❌ MISSING | RBAC not applied |

---

## TABLE 2 — State Machines

### 2A — PurchaseReturn States

| From State | To State | Trigger | Required Role | Forbidden If |
|:---|:---|:---|:---|:---|
| — | DRAFT | Create RTV API | Inventory Manager, Admin | — |
| DRAFT | REQUESTED | Submit RTV API | Inventory Manager, Admin | — |
| REQUESTED | APPROVED | Approve RTV API | Manager, Admin | Status ≠ REQUESTED |
| REQUESTED | REJECTED | Reject RTV API | Manager, Admin | Status ≠ REQUESTED |
| APPROVED | SHIPPED | Mark Shipped API | Inventory Manager, Admin | Status ≠ APPROVED |
| SHIPPED | COMPLETED | Confirm Receipt by Supplier | Admin | Status ≠ SHIPPED |
| REJECTED | — | Terminal | — | Cannot transition |
| COMPLETED | — | Terminal | — | Cannot transition |
| **FORBIDDEN** | Any → DRAFT | — | — | Once submitted, no rollback |
| **FORBIDDEN** | COMPLETED → Any | — | — | Terminal state |
| **FORBIDDEN** | REJECTED → Any | — | — | Terminal state |

### 2B — Sale States

| From State | To State | Trigger | Required Role | Forbidden If |
|:---|:---|:---|:---|:---|
| — | COMPLETED | Create sale (POS) | Cashier | — |
| COMPLETED | VOIDED | Void Sale API | Manager, Admin | Closed accounting period |
| COMPLETED | REFUNDED | Refund flow | Cashier, Manager | No prior receipt |
| VOIDED | — | Terminal | — | Cannot transition |
| REFUNDED | — | Terminal | — | Cannot transition |
| **FORBIDDEN** | VOIDED → Any | — | — | Terminal |
| **FORBIDDEN** | Void without reason | — | — | Reason required |

### 2C — DeliveryTrip States

| From State | To State | Trigger | Required Role | Forbidden If |
|:---|:---|:---|:---|:---|
| — | PLANNED | Create Trip API | Logistics Manager | — |
| PLANNED | LOADING | Start Loading API | Logistics Manager | Mode ≠ INTERNAL_FLEET |
| PLANNED | IN_TRANSIT | Start Trip API (external) | Logistics Manager | No packs/stops |
| LOADING | IN_TRANSIT | Start Trip API | Logistics Manager | No packs/stops |
| IN_TRANSIT | COMPLETED | Complete Trip API | Logistics Manager | Status ≠ IN_TRANSIT |
| IN_TRANSIT | FAILED | Fail Trip API | Logistics Manager | Status ≠ IN_TRANSIT |
| COMPLETED | — | Terminal | — | — |
| FAILED | — | Terminal | — | — |
| **FORBIDDEN** | COMPLETED → Any | — | — | Terminal |
| **FORBIDDEN** | Start without stops | — | — | Minimum 1 stop |
| **FORBIDDEN** | Start without packs | — | — | Minimum 1 pack |

### 2D — PickList States

| From State | To State | Trigger | Required Role | Forbidden If |
|:---|:---|:---|:---|:---|
| — | PENDING | Order fulfillment trigger | System | — |
| PENDING | PICKING | Start Picking API | Warehouse Staff | — |
| PICKING | PICKED | All items `PICKED` (auto) | System | Items still pending |
| PICKED | PACKED | Pack sealed | System | — |
| PICKING | CANCELLED | Cancel API | Warehouse Manager | Status = PACKED |
| PENDING | CANCELLED | Cancel API | Warehouse Manager | — |
| **FORBIDDEN** | PACKED → PENDING | — | — | Cannot unpack |
| **FORBIDDEN** | CANCELLED → Any | — | — | Terminal |

### 2E — Tenant States

| From State | To State | Trigger | Required Role | Forbidden If |
|:---|:---|:---|:---|:---|
| — | ACTIVE | Tenant provisioning | Platform Admin | — |
| ACTIVE | SUSPENDED | Suspend API | Platform Admin | Already SUSPENDED |
| SUSPENDED | ACTIVE | Reactivate API | Platform Admin | Already ACTIVE |
| **FORBIDDEN** | Any API access when SUSPENDED | Middleware | — | Returns 403 |
| **FORBIDDEN** | Suspend without reason | — | — | Reason required |

---

## TABLE 3 — API Layer

| Endpoint | Method | DTO | Response | Error Codes | Guard |
|:---|:---|:---|:---|:---|:---|
| `/api/v1/purchase-returns` | POST | `CreatePurchaseReturnDto` | `PurchaseReturn` | 400, 404, 409 | `@Roles(Admin, Inventory Manager)` |
| `/api/v1/purchase-returns/:id/approve` | POST | — | `PurchaseReturn` | 400, 404 | `@Roles(Admin, Manager)` |
| `/api/v1/purchase-returns/:id/reject` | POST | `RejectReturnDto` | `PurchaseReturn` | 400, 404 | `@Roles(Admin, Manager)` |
| `/api/v1/purchase-returns/:id/ship` | POST | — | `PurchaseReturn` | 400, 404 | `@Roles(Admin, Inventory Manager)` |
| `/api/v1/purchase-returns/:id/complete` | POST | — | `PurchaseReturn` | 400, 404 | `@Roles(Admin)` |
| `/api/platform/tenants/:id/suspend` | POST | `SuspendTenantDto` | `Tenant` | 400, 404, 409 | `@Roles(Platform Admin)` |
| `/api/platform/tenants/:id/reactivate` | POST | — | `Tenant` | 400, 404, 409 | `@Roles(Platform Admin)` |
| `/api/v1/sales-extensions/sales/:id/void` | POST | `VoidSaleDto` | `Sale` | 400, 404, 409 | `@Roles(Manager, Admin)` |
| `/api/v1/sales-extensions/quotes` | POST | `CreateQuoteDto` | `Quote` | 400, 404 | `@Roles(Sales, Admin)` |
| `/api/v1/sales-extensions/quotes/:id/convert` | POST | — | `Order` | 400, 404, 409 | `@Roles(Sales, Admin)` |
| `/api/v1/sales-extensions/quotes/:id/reject` | POST | `RejectQuoteDto` | `Quote` | 400, 404 | `@Roles(Admin, Manager)` |
| `/logistics/trips` | POST | `CreateTripDto` | `DeliveryTrip` | 400, 404, 409 | ❌ MISSING `@UseGuards` |
| `/logistics/trips/:id/add-stop` | POST | `AddTripStopDto` | `TripStop` | 400, 404 | ❌ MISSING `@UseGuards` |
| `/logistics/trips/:id/add-pack` | POST | `AddTripPackDto` | `TripPack` | 400, 404, 409 | ❌ MISSING `@UseGuards` |
| `/logistics/trips/:id/start-loading` | POST | — | `DeliveryTrip` | 400, 404 | ❌ MISSING `@UseGuards` |
| `/logistics/trips/:id/start` | POST | — | `DeliveryTrip` | 400, 404 | ❌ MISSING `@UseGuards` |
| `/logistics/stops/:id/arrive` | POST | — | `TripStop` | 400, 404 | ❌ MISSING `@UseGuards` |
| `/logistics/stops/:id/complete` | POST | `CompleteStopDto` | `TripStop` | 400, 404 | ❌ MISSING `@UseGuards` |
| `/logistics/trips/:id/complete` | POST | — | `DeliveryTrip` | 400, 404 | ❌ MISSING `@UseGuards` |
| `/logistics/trips/:id/fail` | POST | `FailTripDto` | `DeliveryTrip` | 400, 404 | ❌ MISSING `@UseGuards` |
| `/logistics/trips` | GET | — | `DeliveryTrip[]` | 400 | ❌ MISSING `@UseGuards` |
| `/warehouse/picklists` | GET | — | `PickList[]` | — | ❌ MISSING `@UseGuards` |
| `/warehouse/picklists/:id` | GET | — | `PickList` | 404 | ❌ MISSING `@UseGuards` |
| `/warehouse/picklists/:id/start` | POST | — | `PickList` | 400, 404 | ❌ MISSING `@UseGuards` |
| `/warehouse/picklists/:id/pick-item` | POST | `PickItemDto` | `PickListItem` | 400, 404 | ❌ MISSING `@UseGuards` |
| `/warehouse/picklists/:id/cancel` | POST | — | `PickList` | 400, 404 | ❌ MISSING `@UseGuards` |

---

## TABLE 4 — Service Layer

| Service | Method | Steps | Validations | Events Emitted | Transaction |
|:---|:---|:---|:---|:---|:---|
| PurchaseReturnsService | `createReturn` | 1.Validate PO, 2.Check received qty, 3.Check inventory, 4.Create PurchaseReturn, 5.Update inventory, 6.Ledger entry, 7.Audit | PO exists, status=RECEIVED/PARTIALLY_RECEIVED, qty≤received, inventory≥qty | `purchase-return.created` | ✅ `$transaction` |
| PurchaseReturnsService | `approveReturn` | 1.Fetch return, 2.Check REQUESTED status, 3.Update to APPROVED, 4.Audit | Status=REQUESTED | `purchase-return.approved` | ✅ |
| PurchaseReturnsService | `rejectReturn` | 1.Fetch return, 2.Check REQUESTED status, 3.Reverse inventory, 4.Update to REJECTED, 5.Audit | Status=REQUESTED | `purchase-return.rejected` | ✅ |
| PurchaseReturnsService | `shipReturn` | 1.Fetch return, 2.Check APPROVED status, 3.Update to SHIPPED, 4.Audit | Status=APPROVED | `purchase-return.shipped` | ✅ |
| TenantAdminService | `suspendTenant` | 1.Fetch tenant, 2.Check ACTIVE, 3.Update to SUSPENDED+reason, 4.Audit, 5.Event | Tenant exists, status=ACTIVE | `tenant.suspended` | ❌ no transaction |
| TenantAdminService | `reactivateTenant` | 1.Fetch tenant, 2.Check SUSPENDED, 3.Clear reason, 4.Update to ACTIVE, 5.Audit, 6.Event | Tenant exists, status=SUSPENDED | `tenant.reactivated` | ❌ no transaction |
| SalesExtensionsService | `voidSale` | 1.Fetch sale, 2.Check COMPLETED, 3.Check accounting period, 4.Void sale, 5.Restore inventory, 6.Cancel invoice, 7.Audit, 8.Event | Sale exists, status=COMPLETED, period=OPEN | `sale.voided` | ✅ `$transaction` |
| QuoteService | `createQuote` | 1.Generate quoteNumber, 2.Calculate totals, 3.Create quote+items, 4.Audit | BusinessClient exists (if provided) | — | ✅ `$transaction` |
| QuoteService | `convertToOrder` | 1.Fetch quote, 2.Check ACCEPTED status, 3.Check validUntil, 4.Create Order+OrderItems, 5.Update Quote status, 6.Audit | Quote=ACCEPTED, not expired | `quote.converted` | ✅ (MISSING) |
| DeliveryTripsService | `createTrip` | 1.Validate mode, 2.Validate driver/vehicle, 3.Create trip, 4.Assign driver+vehicle | Mode-specific validations, driver/vehicle available | — | ✅ |
| DeliveryTripsService | `startTrip` | 1.Check status, 2.Validate packs/stops, 3.Update orders to OUT_FOR_DELIVERY, 4.Update trip | Has packs, has stops | — | ✅ |
| DeliveryTripsService | `completeTrip` | 1.Release driver+vehicle, 2.Commit inventory for delivered stops, 3.Update trip to COMPLETED | Status=IN_TRANSIT | — | ✅ `$transaction` |
| PickListsService | `startPicking` | 1.Fetch list, 2.Check PENDING, 3.Update to PICKING | Status=PENDING | — | ✅ |
| PickListsService | `pickItem` | 1.Fetch item, 2.Validate barcode, 3.Update qty, 4.Check all-picked | ItemId valid, qty≤required | `item.picked` | ✅ |

---

## TABLE 5 — Data Layer

| Entity | Prisma Model | Key Fields | Constraints | Relations | Transactions |
|:---|:---|:---|:---|:---|:---|
| PurchaseReturn | `PurchaseReturn` | id, tenantId, purchaseOrderId, status, totalValue | status=ENUM, totalValue≥0 | Tenant, PurchaseOrder, User(createdBy), PurchaseReturnItems | CREATE needs `$transaction` |
| PurchaseReturnItem | `PurchaseReturnItem` | id, purchaseReturnId, productId, quantity, reason | quantity≥1 | PurchaseReturn, Product | — |
| Tenant | `Tenant` | id, status, suspensionReason | status IN (ACTIVE, SUSPENDED) | Users, Branches, etc. | UPDATE uses direct `prisma.tenant.update` |
| Sale | `Sale` | id, tenantId, status, voidReason | status IN (COMPLETED, VOIDED, REFUNDED) | Items, Payments, Invoice, Branch | VOID uses `$transaction` |
| DeliveryTrip | `DeliveryTrip` | id, tenantId, branchId, status, mode | status=ENUM, mode=ENUM | Driver, Vehicle, TripStops, TripPacks | COMPLETE uses `$transaction` |
| TripStop | `TripStop` | id, tripId, sequence, status | sequence≥1, status=ENUM | DeliveryTrip, Order | — |
| PickList | `PickList` | id, tenantId, branchId, status | status=ENUM | PickListItems, Pack | — |
| PickListItem | `PickListItem` | id, pickListId, productId, requiredQty, pickedQty | pickedQty≤requiredQty | PickList, Product | — |
| Quote | `Quote` | id, tenantId, quoteNumber, status, validUntil | validUntil enforced | Tenant, BusinessClient, QuoteItems | CREATE uses `$transaction` |
| AuditLog | `AuditLog` | id, tenantId, userId, action, entityType | Required: tenantId, userId | Tenant, User | — |

---

## TABLE 6 — UI Binding

| Screen | API Bound | Role Visible | Trigger | Loading State | Error State | Success State |
|:---|:---|:---|:---|:---|:---|:---|
| Purchase Returns List | `GET /api/v1/purchase-returns` | Inventory Manager, Admin | onLoad | Skeleton | "Failed to load returns" | Table of returns |
| Create RTV Form | `POST /api/v1/purchase-returns` | Inventory Manager, Admin | onClick:Submit | Button spinner | Inline field errors | Navigate to return detail |
| RTV Detail | `GET /api/v1/purchase-returns/:id` | All roles | onLoad | Skeleton | "Not found" | Return detail + status |
| Approve RTV Button | `POST /api/v1/purchase-returns/:id/approve` | Manager, Admin | onClick:Approve | Disabled button | Toast error | Status chip → APPROVED |
| Reject RTV Button | `POST /api/v1/purchase-returns/:id/reject` | Manager, Admin | onClick:Reject | Modal + spinner | Toast error | Status chip → REJECTED |
| Tenant Admin Console | `GET /api/platform/tenants` | Platform Admin only | onLoad | Skeleton | "Access denied" | Tenant list |
| Suspend Tenant | `POST /api/platform/tenants/:id/suspend` | Platform Admin | onClick:Suspend | Modal + spinner | Toast error | Status badge → SUSPENDED |
| Reactivate Tenant | `POST /api/platform/tenants/:id/reactivate` | Platform Admin | onClick:Reactivate | Disabled button | Toast error | Status badge → ACTIVE |
| Void Sale (POS) | `POST /api/v1/sales-extensions/sales/:id/void` | Manager, Admin | onClick:Void Sale | Modal + spinner | Error if closed period | Sale marked VOIDED |
| Quote Builder | `POST /api/v1/sales-extensions/quotes` | Sales, Admin | onClick:Create Quote | Button spinner | Validation errors | Quote created, navigate |
| Quote Detail | `GET /api/v1/sales-extensions/quotes/:id` | Sales, Admin | onLoad | Skeleton | "Not found" | Quote detail |
| Convert Quote → Order | `POST /api/v1/sales-extensions/quotes/:id/convert` | Sales, Admin | onClick:Convert | Spinner | "Expired" or errors | Navigate to order |
| Fleet Dispatch Board | `GET /logistics/trips` | Logistics Manager | onLoad | Skeleton | "Failed to load" | Trip list |
| Create Trip | `POST /logistics/trips` | Logistics Manager | onClick:New Trip | Modal + spinner | Validation errors | Trip created |
| Add Stops | `POST /logistics/trips/:id/add-stop` | Logistics Manager | onClick:Add Stop | Inline spinner | Error message | Stop added to list |
| Dispatch Trip | `POST /logistics/trips/:id/start` | Logistics Manager | onClick:Dispatch | Button spinner | "No packs/stops" | Trip status → IN_TRANSIT |
| Complete Stop (Driver App) | `POST /logistics/stops/:id/complete` | Driver | onClick:Delivered / onClick:Failed | Spinner | Error | Stop marked DELIVERED/FAILED |
| Pick List Board | `GET /warehouse/picklists` | Warehouse Staff | onLoad | Skeleton | "Access denied" | Pick list cards |
| Start Picking | `POST /warehouse/picklists/:id/start` | Warehouse Staff | onClick:Start | Spinner | Error | Status → PICKING |
| Scan & Pick Item | `POST /warehouse/picklists/:id/pick-item` | Warehouse Staff | onScan/onClick | Inline spinner | "Wrong barcode" | Item marked PICKED |

---

## TABLE 7 — Authorization

| Endpoint | Required Role | Required Permission | Guard Location | UI Visibility | Deny Scenario |
|:---|:---|:---|:---|:---|:---|
| POST `/purchase-returns` | Admin, Inventory Manager | `CREATE_PURCHASE_RETURN` | Controller `@UseGuards(AuthGuard)` | Hidden from Cashier, Driver | Returns 403 |
| POST `/purchase-returns/:id/approve` | Admin, Manager | `APPROVE_PURCHASE_RETURN` | Controller | Hidden from Cashier | Returns 403 |
| POST `/purchase-returns/:id/reject` | Admin, Manager | `APPROVE_PURCHASE_RETURN` | Controller | Hidden from Cashier | Returns 403 |
| POST `/platform/tenants/:id/suspend` | Platform Admin | `MANAGE_TENANTS` | Controller | Admin Console only | Returns 403 |
| POST `/platform/tenants/:id/reactivate` | Platform Admin | `MANAGE_TENANTS` | Controller | Admin Console only | Returns 403 |
| POST `/sales-extensions/sales/:id/void` | Admin, Manager | `VOID_SALE` | Controller | Hidden from Cashier | Returns 403 |
| POST `/sales-extensions/quotes` | Admin, Sales | `MANAGE_QUOTES` | Controller | Hidden from Warehouse | Returns 403 |
| POST `/sales-extensions/quotes/:id/convert` | Admin, Sales | `MANAGE_QUOTES` | Controller | Hidden from Warehouse | Returns 403 |
| POST `/logistics/trips` | Logistics Manager, Admin | `MANAGE_FLEET` | ❌ MISSING — needs `@UseGuards` | — | No enforcement currently |
| POST `/logistics/trips/:id/start` | Logistics Manager, Admin | `MANAGE_FLEET` | ❌ MISSING | — | No enforcement currently |
| POST `/logistics/stops/:id/complete` | Driver, Logistics Manager | `COMPLETE_DELIVERY` | ❌ MISSING | — | No enforcement currently |
| GET `/warehouse/picklists` | Warehouse Staff | `VIEW_PICKLISTS` | ❌ MISSING | — | No enforcement currently |
| POST `/warehouse/picklists/:id/pick-item` | Warehouse Staff | `PICK_ORDERS` | ❌ MISSING | — | No enforcement currently |
| POST `/warehouse/picklists/:id/cancel` | Warehouse Manager | `CANCEL_PICKLIST` | ❌ MISSING | — | No enforcement currently |

---

## TABLE 8 — Transaction Boundaries

| Operation | Atomic Steps | Rollback Triggers | Compensation |
|:---|:---|:---|:---|
| Create Purchase Return | Create PurchaseReturn + PurchaseReturnItems + Inventory decrement + LedgerEntry | Any DB error | Full rollback via `$transaction` |
| Reject Purchase Return | Reverse inventory (increment) + Create return ledger + Update status to REJECTED | Any DB error | Full rollback |
| Void Sale | Update Sale.status + Restore Inventory (increment) + LedgerEntry + Cancel Invoice | Closed accounting period check (pre-tx) → abort | `$transaction` rollback |
| Complete Trip | Release Driver + Release Vehicle + Commit inventory for each delivered stop + Update Trip | Any item commit failure | `$transaction` rollback releases all or none |
| Convert Quote to Order | Create Order + Create OrderItems + Allocate inventory + Update Quote.status | Stock unavailable | `$transaction` rollback, quote remains ACCEPTED |
| Approve Purchase Return | Update PurchaseReturn.status only | — | Direct DB call (no inventory change at approve) |
| Suspend Tenant | Update Tenant.status + reason | — | Idempotent update, no rollback needed |
| Pick Item | Update PickListItem.pickedQty + Check all-picked auto-transition | Qty exceeds required | Validation before write |

---

## TABLE 9 — Missing UI Screens

| Screen Name | Component | Actions | Role Visibility | API Bound | Priority |
|:---|:---|:---|:---|:---|:---|
| RTV Lifecycle Screen | Status timeline, Action buttons | Approve, Reject, Mark Shipped, Mark Complete | Manager, Admin | `/purchase-returns/:id/approve`, `/reject`, `/ship`, `/complete` | HIGH |
| Quote Lifecycle Screen | Quote detail + status chip + action bar | Send to Client, Convert to Order, Reject/Expire | Sales, Admin | `/quotes/:id/convert`, `/quotes/:id/reject` | HIGH |
| Vehicle/Driver Board | Card grid with status badges | View active trip, Mark available | Logistics Manager | GET `/logistics/drivers`, GET `/logistics/vehicles` | MEDIUM |
| Failed Delivery Dashboard | Table of FAILED stops | Reassign, Flag for return, Reattempt | Logistics Manager | GET `/logistics/trips?status=FAILED` | HIGH |
| Tenant Admin Console | Tenant list with ACTIVE/SUSPENDED badge | Suspend, Reactivate, View users | Platform Admin | `/platform/tenants`, `/suspend`, `/reactivate` | HIGH |
| Pack Management Screen | Pack list with OPEN/SEALED/LOADED status | Seal Pack, Add to Trip | Warehouse Manager | POST `/warehouse/packs/:id/seal` | MEDIUM |
| Accounting Period Lock | Period list with OPEN/CLOSED badge | Close Period | CFO, Accounting Admin | GET/POST `/accounting/periods` | HIGH |

---

## TABLE 10 — Role Enforcement Matrix

| Role | PurchaseReturn | TenantAdmin | Sale Void | Quotes | Logistics | Warehouse |
|:---|:---|:---|:---|:---|:---|:---|
| **Platform Admin** | CREATE, READ | SUSPEND, REACTIVATE | — | — | — | — |
| **Admin** | CREATE, APPROVE, REJECT, READ | — | VOID | CREATE, CONVERT, REJECT | CREATE_TRIP, DISPATCH | CANCEL_LIST |
| **Manager** | APPROVE, REJECT, READ | — | VOID | READ | DISPATCH | CANCEL_LIST |
| **Inventory Manager** | CREATE, SHIP, READ | — | — | — | — | — |
| **Sales** | — | — | — | CREATE, CONVERT, READ | — | — |
| **Logistics Manager** | — | — | — | — | ALL logistics ops | — |
| **Driver** | — | — | — | — | ARRIVE, COMPLETE_STOP | — |
| **Warehouse Staff** | — | — | — | — | — | START_PICK, PICK_ITEM |
| **Warehouse Manager** | — | — | — | — | — | ALL warehouse ops |
| **Cashier** | — | — | — | — | — | — |
| **SUSPENDED TENANT** | ❌ ALL BLOCKED | — | ❌ ALL BLOCKED | ❌ ALL BLOCKED | ❌ ALL BLOCKED | ❌ ALL BLOCKED |

---

## Enforcement Gaps — Action Required

| # | Gap | Severity | Fix Location |
|:---|:---|:---|:---|
| G-01 | `DeliveryTripsController` missing `@UseGuards(AuthGuard)` | 🔴 CRITICAL | `logistics/delivery-trips.controller.ts` |
| G-02 | `PickListsController` missing `@UseGuards(AuthGuard)` | 🔴 CRITICAL | `warehouse/picklists.controller.ts` |
| G-03 | `PacksController` missing `@UseGuards(AuthGuard)` | 🔴 CRITICAL | `warehouse/packs.controller.ts` |
| G-04 | TenantMiddleware does not block SUSPENDED tenants | 🔴 CRITICAL | `common/middleware/tenant.middleware.ts` |
| G-05 | PurchaseReturn missing APPROVE/REJECT/SHIP/COMPLETE transitions | 🔴 HIGH | `purchase-returns.service.ts` |
| G-06 | No Quote lifecycle transitions (convert, reject, expire) | 🟠 HIGH | `quote.service.ts` |
| G-07 | No validation that PICK requires Trip to be DISPATCHED | 🟠 MEDIUM | `warehouse/picklists.service.ts` |
| G-08 | `TenantAdminService` mutations not wrapped in `$transaction` | 🟡 MEDIUM | `tenant-admin.service.ts` |
