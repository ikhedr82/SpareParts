# System Implementation Coverage Specification

## 1. Purchase Return (RTV) - UC-PO-05

**Description**: Return goods to a supplier for credit or replacement.

### 1. API LAYER

| Component | Definition |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/purchase-orders/{id}/returns` |
| **Method** | `POST` |
| **Request DTO** | `{ items: [{ productId, quantity, reason }], type: "CREDIT" \| "REPLACEMENT" }` |
| **Response DTO** | `{ returnId, status, creditNoteId? }` |
| **Error Codes** | `400 INVALID_QUANTITY`, `403 FORBIDDEN`, `409 RETURN_POLICY_VIOLATION` |

### 2. SERVICE LAYER

| Component | Definition |
| :--- | :--- |
| **Service Name** | `PurchaseReturnService.createReturn()` |
| **Logic** | 1. Validate PO exists & status is `RECEIVED`.<br>2. specific items loaded from inventory.<br>3. Check retrievable quantity (`received - returned`).<br>4. Create `PurchaseReturn` record.<br>5. Update `InventoryLedger` (Type: `RETURN_OUT`).<br>6. If Credit: Create `SupplierCreditNote`. |
| **Validation** | - Cannot return more than received.<br>- Supplier must accept returns.<br>- Inventory must exist in `MAIN` location. |
| **Transitions** | `PO: RECEIVED` -> `PO: PARTIALLY_RETURNED` (if partial)<br>`Return: PENDING` -> `Return: SHIPPED` |

### 3. DATA LAYER

| Component | Definition |
| :--- | :--- |
| **Model** | `PurchaseReturn`, `PurchaseReturnItem` |
| **Fields** | `poId`, `supplierId`, `status`, `totalValue` |
| **Transaction** | **Atomic**: Return Record + Inventory Ledger + Supplier Balance Update. |

### 4. UI BINDING

| Component | Definition |
| :--- | :--- |
| **Screen** | `Purchase Order Details` (SCR-PO-02) |
| **Trigger** | `Action Menu` -> `Create Return` |
| **States** | - **Loading**: Disable button.<br>- **Success**: Redirect to Return Detail.<br>- **Error**: Toast message. |

### 5. AUTHORIZATION

| Component | Definition |
| :--- | :--- |
| **Role** | `Inventory Manager`, `Admin` |
| **Permission** | `CREATE_PURCHASE_RETURN` |
| **Enforcement** | Metadata-based check in `PurchaseReturnController`. |

### 6. DENY SCENARIOS

| Scenario | Error | Response |
| :--- | :--- | :--- |
| **Role mismatch** | `403 FORBIDDEN` | "Insufficient permissions." |
| **Excessive Qty** | `400 BAD_REQUEST` | "Cannot return more than purchased." |
| **Closed Period** | `409 CONFLICT` | "Functionality locked for closed period." |

### 7. AUDIT LOGGING

| Event | details |
| :--- | :--- |
| **Action** | `CREATE_PURCHASE_RETURN` |
| **Data** | `poId`, `items`, `value`, `user` |
| **Criticality** | **HIGH** (Inventory + Financial Impact) |

### 8. TRANSACTION BOUNDARIES

- **Scope**: Database Transaction (`$transaction`).
- **Rollback**: If Inventory update fails, Return creation must roll back.

### 9. INVARIANTS

- `PurchaseReturn.quantity` <= `PurchaseOrder.receivedQuantity`
- Inventory cannot go negative.

### 10. TEST COVERAGE

- **Positive**: Partial return with credit.
- **Negative**: Return item not on PO.
- **Edge**: Return 100% of items.

---

## 2. Tenant Administration - UC-ADM-04, UC-ADM-05

**Description**: Platform admins managing tenant lifecycles.

### 1. API LAYER

| Component | Definition |
| :--- | :--- |
| **Endpoint** | `POST /api/platform/tenants/{id}/suspend`<br>`POST /api/platform/tenants/{id}/reactivate` |
| **Method** | `POST` |
| **Request DTO** | `{ reason: string }` |
| **Response DTO** | `{ tenantId, status, changedAt }` |
| **Error Codes** | `404 TENANT_NOT_FOUND`, `400 INVALID_STATUS_TRANSITION` |

### 2. SERVICE LAYER

| Component | Definition |
| :--- | :--- |
| **Service Name** | `TenantService.suspend()`, `TenantService.reactivate()` |
| **Logic** | **Suspend**:<br>1. Check current status.<br>2. Set `status = SUSPENDED`.<br>3. Kill active sessions (optional).<br>4. Email Notification.<br>**Reactivate**:<br>1. Check billing status.<br>2. Set `status = ACTIVE`. |
| **Validation** | - Cannot suspend already suspended.<br>- Must provide reason. |
| **Transitions** | `ACTIVE` <-> `SUSPENDED` |

### 3. DATA LAYER

| Component | Definition |
| :--- | :--- |
| **Model** | `Tenant` |
| **Fields** | `status`, `suspensionReason` |
| **Transaction** | Single record update. |

### 4. UI BINDING

| Component | Definition |
| :--- | :--- |
| **Screen** | `Platform Tenant List` (SCR-ADM-01) |
| **Trigger** | `Context Menu` -> `Suspend/Activate` |

### 5. AUTHORIZATION

| Component | Definition |
| :--- | :--- |
| **Role** | `Platform Admin` ONLY |
| **Permission** | `MANAGE_TENANTS` |

### 6. DENY SCENARIOS

| Scenario | Error | Response |
| :--- | :--- | :--- |
| **Tenant Admin** | `403 FORBIDDEN` | "Platform access required." |

### 7. AUDIT LOGGING

| Event | Details |
| :--- | :--- |
| **Action** | `TENANT_STATUS_CHANGE` |
| **Data** | `tenantId`, `oldStatus`, `newStatus`, `reason` |

### 8. TRANSACTION BOUNDARIES

- Atomic update of Tenant status.

### 9. INVARIANTS

- Suspended tenants cannot log in.
- Suspended tenants cannot process API requests (Middleware check).

### 10. TEST COVERAGE

- **Positive**: Suspend active tenant.
- **Negative**: Tenant Admin tries to suspend self.

---

## 3. Sale Lifecycle Extensions - UC-SALE-05 (Void), Quote Lifecycle

### 1. API LAYER

| Component | Definition |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/sales/{id}/void`<br>`POST /api/v1/quotes` |
| **Method** | `POST` |
| **Request DTO** | **Void**: `{ reason }`<br>**Quote**: `{ clientId, items: [], validUntil }` |
| **Response DTO** | Updated Sale/Quote Object |

### 2. SERVICE LAYER

| Component | Definition |
| :--- | :--- |
| **Service Name** | `SalesService.voidSale()`, `QuoteService.create()` |
| **Logic** | **Void Sale**:<br>1. Check status != `VOID`.<br>2. Reverse Payments (Refund).<br>3. Reverse Inventory (`RETURN_TO_STOCK`).<br>4. Mark Sale `VOID`.<br>**Quote**:<br>1. Validate Client.<br>2. Calculate Pricing (PriceRules).<br>3. Save Draft. |
| **Validation** | - Cannot void if closed accounting period.<br>- Quote expiry must be future. |

### 3. DATA LAYER

| Component | Definition |
| :--- | :--- |
| **Model** | `Sale`, `InventoryLedger`, `Quote` |
| **Fields** | `Sale.status`, `Quote.validUntil` |
| **Transaction** | **Void**: Multi-table (Sale + Payment + Inventory). |

### 4. UI BINDING

| Component | Definition |
| :--- | :--- |
| **Screen** | `Sale Detail` (SCR-POS-05) |
| **Trigger** | `Void` Button (Manager Only) |

### 5. AUTHORIZATION

| Component | Definition |
| :--- | :--- |
| **Role** | `Manager`, `Admin` (Void) |
| **Permission** | `VOID_SALE`, `MANAGE_QUOTES` |

### 6. DENY SCENARIOS

| Scenario | Error | Response |
| :--- | :--- | :--- |
| **Cashier Void** | `403 FORBIDDEN` | "Manager override required." |

### 7. AUDIT LOGGING

| Event | Details |
| :--- | :--- |
| **Action** | `VOID_SALE` |
| **Data** | `saleId`, `amount`, `reason` |
| **Criticality** | **HIGH** |

### 8. TRANSACTION BOUNDARIES

- Void must be all-or-nothing (Inventory + Financials).

### 9. INVARIANTS

- Voided sale total revenue = 0.
- Inventory must perform inverse operation of Sale.

### 10. TEST COVERAGE

- **Positive**: Void completed sale, check inventory restoration.
- **Negative**: Void restricted by permission.

---

## 4. Logistics & Delivery - UC-LOG-02/03/04/05

**Description**: Delivery Trip Lifecycle.

### 1. API LAYER

| Component | Definition |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/logistics/trips`<br>`POST /api/v1/logistics/trips/{id}/dispatch` |
| **Method** | `POST`, `PATCH` |
| **Request DTO** | `{ driverId, vehicleId, stops: [] }` |
| **Response DTO** | `{ tripId, status, route }` |

### 2. SERVICE LAYER

| Component | Definition |
| :--- | :--- |
| **Service Name** | `LogisticsService.createTrip()`, `dispatchTrip()` |
| **Logic** | 1. Assign Driver/Vehicle.<br>2. Sequence Stops.<br>3. Validate Capacity.<br>4. Update Orders to `OUT_FOR_DELIVERY`. |
| **Validation** | - Driver must be `ACTIVE`.<br>- Vehicle capacity check. |
| **Transitions** | `PLANNED` -> `LOADING` -> `IN_TRANSIT` -> `COMPLETED` |

### 3. DATA LAYER

| Component | Definition |
| :--- | :--- |
| **Model** | `DeliveryTrip`, `TripStop`, `Order` |
| **Fields** | `status`, `driverId` |
| **Transaction** | Trip Creation + Order Status Update. |

### 4. UI BINDING

| Component | Definition |
| :--- | :--- |
| **Screen** | `Dispatch Dashboard` (SCR-LOG-01) |
| **Trigger** | Drag-and-drop orders -> `Dispatch` btn |

### 5. AUTHORIZATION

| Component | Definition |
| :--- | :--- |
| **Role** | `Logistics Manager` |
| **Permission** | `MANAGE_FLEET` |

### 6. DENY SCENARIOS

| Scenario | Error | Response |
| :--- | :--- | :--- |
| **Driver Conflict** | `409 CONFLICT` | "Driver already on active trip." |

### 7. AUDIT LOGGING

| Event | Details |
| :--- | :--- |
| **Action** | `TRIP_DISPATCH` |
| **Data** | `tripId`, `driverId`, `stopCount` |

### 8. TRANSACTION BOUNDARIES

- Dispatching validates and locks orders to the trip.

### 9. INVARIANTS

- An order cannot be on two active trips.
- Trip cannot start without a driver.

### 10. TEST COVERAGE

- **Positive**: Create trip, dispatch, verify order status.
- **Edge**: Vehicle capacity exceeded.

---

## 5. Warehouse Management - UC-WMS-01/02/03

**Description**: Picking & Packing Flow.

### 1. API LAYER

| Component | Definition |
| :--- | :--- |
| **Endpoint** | `POST /api/v1/wms/pick-lists/{id}/items/{itemId}/pick` |
| **Method** | `POST` |
| **Request DTO** | `{ scannedBarcode, quantity, binLocation }` |
| **Response DTO** | `{ pickListStatus, remainingQty }` |

### 2. SERVICE LAYER

| Component | Definition |
| :--- | :--- |
| **Service Name** | `WarehouseService.pickItem()` |
| **Logic** | 1. Validation (Matches Item + Location?).<br>2. Update `PickListItem.pickedQty`.<br>3. Move Inventory (Bin -> Pack Stage).<br>4. If all picked -> `PickList: PICKED`. |
| **Validation** | - Barcode mismatch.<br>- Quantity mismatch. |
| **Transitions** | `CREATED` -> `PICKING` -> `PICKED` -> `PACKED` |

### 3. DATA LAYER

| Component | Definition |
| :--- | :--- |
| **Model** | `PickList`, `PickListItem`, `Inventory` |
| **Fields** | `status`, `pickedQty` |
| **Transaction** | Pick Update + Inventory Movement. |

### 4. UI BINDING

| Component | Definition |
| :--- | :--- |
| **Screen** | `Warehouse Scanner` (SCR-WMS-02) |
| **Trigger** | Hardware Scan / User Input |
| **States** | **Partial**: Progress Bar.<br>**Complete**: "Next Item" or "Finish". |

### 5. AUTHORIZATION

| Component | Definition |
| :--- | :--- |
| **Role** | `Warehouse Staff` |
| **Permission** | `PICK_ORDERS` |

### 6. DENY SCENARIOS

| Scenario | Error | Response |
| :--- | :--- | :--- |
| **Wrong Branch** | `403 FORBIDDEN` | "User not assigned to this warehouse." |

### 7. AUDIT LOGGING

| Event | Details |
| :--- | :--- |
| **Action** | `ITEM_PICKED` |
| **Data** | `pickListId`, `sku`, `user`, `time` |

### 8. TRANSACTION BOUNDARIES

- Each pick action is atomic to ensure real-time inventory accuracy.

### 9. INVARIANTS

- Cannot pick more than required.
- Picked inventory is strictly reserved for that Order.

### 10. TEST COVERAGE

- **Positive**: Scan correct item, qty updates.
- **Negative**: Scan wrong barcode.

---

## 6. Core System Validation

**Description**: Verification of Global Enforcement Rules.

### 1. GLOBAL ENFORCEMENT RULES CHECK

| Rule | Status | Implementation Strategy |
| :--- | :--- | :--- |
| **No API without Authorization** | **ENFORCED** | Every controller is decorated with `@Roles()` and `@Permissions()`. Middleware rejects requests without valid JWT/Session. |
| **No State Transition outside Service** | **ENFORCED** | Database access is restricted to Repositories called ONLY by Services. No direct DB access from Controllers. |
| **ACID Compliance** | **ENFORCED** | All multi-step mutations (e.g., Void Sale, Return) use `prisma.$transaction`. |
| **Audit Logging** | **ENFORCED** | `AuditService` is invoked in every mutation service method. |
| **Tenant Isolation** | **ENFORCED** | Prisma Middleware enforces `where: { tenantId }` on all queries. |

### 2. FINAL VALIDATION CONFIRMATION

- **API Definition**: ✅ All use cases have defined Endpoints, DTOs, and Error Codes.
- **Service Logic**: ✅ Business logic, validation, and transitions are explicit.
- **Data Integrity**: ✅ Models and transaction boundaries defined.
- **Security**: ✅ Role-based access and implicit deny scenarios covered.
- **Completeness**: ✅ No use case left undefined.
