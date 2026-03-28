# Database Design

## Overview
Partivo uses a single **PostgreSQL** database accessed via **Prisma ORM**. The schema is designed around domain-driven entity boundaries with strict tenant isolation.

## Schema Statistics
- **Total Models**: 70+ Prisma models.
- **Total Enums**: 30+ enums covering statuses, types, and modes.
- **ORM**: Prisma Client with auto-generated TypeScript types.

## Core Domain Groups

### 1. Platform & SaaS Management
| Model | Purpose |
|---|---|
| `Plan` | SaaS subscription plans (Free, Business, Enterprise) |
| `Subscription` | Tenant-to-plan binding with billing cycle, trial, and grace periods |
| `BillingInvoice` | SaaS invoices with Stripe/Paymob integration |
| `BillingEvent` | Audit trail for billing lifecycle events |
| `WebhookEvent` | Idempotent webhook processing from payment providers |
| `UsageMetric` | Tracks tenant usage for metered billing |
| `SubscriptionChangeHistory` | Records upgrades, downgrades, cancellations |

### 2. Identity & Access
| Model | Purpose |
|---|---|
| `Tenant` | Root entity for multi-tenancy |
| `User` | All system users (platform admins + tenant users) |
| `Role` | Named role with scope (PLATFORM / TENANT) |
| `Permission` | Granular permission codes |
| `RolePermission` | Many-to-many role-permission mapping |
| `UserRole` | Assigns roles to users within tenant/branch context |

### 3. Global Catalog
| Model | Purpose |
|---|---|
| `Brand` | Part manufacturers (OEM and aftermarket) |
| `ProductCategory` | Hierarchical category tree |
| `Product` | Master part records with i18n support |
| `VehicleMake` / `VehicleModel` | Vehicle hierarchy for fitment |
| `ProductFitment` | Maps products to compatible vehicle models |
| `AlternatePartNumber` | Cross-reference and superseded part numbers |
| `DataSource` / `ProductSource` | External catalog data provenance |
| `Substitution` | Product interchangeability records |

### 4. Inventory & Warehouse
| Model | Purpose |
|---|---|
| `Inventory` | Per-branch, per-product stock with cost/selling price |
| `InventoryLedger` | Immutable ledger of all quantity changes |
| `BranchTransfer` / `BranchTransferItem` | Inter-branch stock movements |

### 5. Sales & Commerce
| Model | Purpose |
|---|---|
| `Sale` / `SaleItem` | POS counter sales |
| `Payment` | Multi-method payment records |
| `CashSession` | POS shift management (open/close with cash reconciliation) |
| `Invoice` / `InvoiceLine` | Tax invoices linked to sales |
| `Receipt` | Payment receipts |
| `ZReport` | End-of-day financial summaries per branch |

### 6. B2B Orders & Fulfillment
| Model | Purpose |
|---|---|
| `BusinessClient` | B2B customers (Workshops, Retailers) |
| `Order` / `OrderItem` | Client purchase orders |
| `Quote` / `QuoteItem` | Sales quotations with lifecycle |
| `Cart` / `CartItem` | Persistent shopping carts |
| `PickList` / `PickListItem` | Warehouse pick assignments |
| `Pack` / `PackItem` | Packing operations for shipment |
| `PriceRule` | Dynamic, rule-based pricing engine |

### 7. Procurement
| Model | Purpose |
|---|---|
| `Supplier` | Vendor records |
| `PurchaseOrder` / `PurchaseOrderItem` | Procurement orders |
| `PurchaseOrderReceipt` / `PurchaseOrderReceiptItem` | Goods receiving |
| `PurchaseReturn` / `PurchaseReturnItem` | Returns to suppliers |
| `ProductSupplier` | Product-supplier cost mapping |
| `SupplierInvoice` / `SupplierInvoiceItem` | AP invoice matching |

### 8. Logistics & Delivery
| Model | Purpose |
|---|---|
| `Driver` | Delivery personnel records |
| `Vehicle` | Fleet vehicles with capacity |
| `DeliveryTrip` | Planned delivery routes |
| `TripStop` | Individual delivery stops |
| `TripPack` | Packs loaded onto a trip |
| `ProofOfDelivery` | Signature, photo, GPS capture |
| `DeliveryException` | Exception reporting |
| `FulfillmentProvider` | Internal fleet vs. external courier |
| `ShipmentManifest` / `ManifestOrder` | Shipment manifests |
| `ReturnToWarehouse` | Failed delivery return handling |

### 9. Returns & Refunds
| Model | Purpose |
|---|---|
| `Return` / `ReturnItem` | Customer return requests with inspection |
| `Refund` / `RefundItem` | Financial refund processing |
| `Chargeback` / `ChargebackResolution` | Dispute management |

### 10. Finance & Accounting
| Model | Purpose |
|---|---|
| `ChartOfAccount` | General ledger accounts |
| `JournalEntry` / `JournalLine` | Double-entry bookkeeping |
| `AccountingEvent` | Links business events to journal entries |
| `AccountingPeriod` | Period close management |
| `RevenueLedger` | Revenue recognition per order |
| `TaxRate` | Tenant-specific tax configuration |
| `TaxFiling` | VAT filing records |
| `Currency` / `ExchangeRate` | Multi-currency support |

### 11. CRM
| Model | Purpose |
|---|---|
| `Lead` | Sales leads |
| `Opportunity` | Sales pipeline stages |
| `Deal` | Closed/won deal records |
| `Activity` | CRM activity timeline |
| `Note` | Free-form notes on clients |
| `CreditAccount` | B2B credit management |

### 12. System & Audit
| Model | Purpose |
|---|---|
| `AuditLog` | Full change audit trail with old/new values |
| `OutboxEvent` | Transactional outbox pattern for async events |
| `IdempotencyRecord` | Request deduplication |
| `FeatureFlag` | Per-tenant feature toggles |
| `ApiKey` | Machine-to-machine authentication |
| `SupportTicket` | Tenant support requests |

## Key Design Patterns

### Optimistic Concurrency
Models with concurrent mutation risk carry a `version: Int @default(0)` field. Updates must include the current version; stale updates are rejected.

### Offline Sync IDs
Models created on offline devices include an `offlineSyncId: String? @unique` field. This prevents duplicate creation during sync replay.

### Tenant Isolation
Every tenant-scoped model has a `tenantId` foreign key with an index. Prisma middleware automatically injects `tenantId` filters on all queries.

### Soft Deletes
The `Tenant` model supports soft deletion via `deletedAt`. Active queries filter on `deletedAt IS NULL`.
