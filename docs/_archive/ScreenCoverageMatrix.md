# Screen Coverage Matrix - Governance Domains

## 1. Product & Pricing Management

| Use Case | Screen Name (ID) | Platform | Entities Covered | Commercial Law |
| :--- | :--- | :--- | :--- | :--- |
| PPM-01 Create Global Product | Product Master List (SCR-PPM-01) <br> Product Detail View (SCR-PPM-02) | Admin Console | Product, ProductFitment | - |
| PPM-02 Define Price Rule | Price Rule Manager (SCR-PPM-03) | Admin Console | PriceRule | Audit |
| PPM-03 Manage Product Substitution | Substitution Matrix (SCR-PPM-06) | Admin Console | Substitution | - |
| PPM-04 Generate B2B Quote | Quote Dashboard (SCR-PPM-04) <br> Quote Builder (SCR-PPM-05) | Web Portal | Quote, QuoteItem | Revenue Integrity |
| PPM-05 Convert Quote to Order | Quote Dashboard (SCR-PPM-04) | Web Portal | Quote, Order | Revenue Integrity |
| PPM-06 Manage Price Tiers | Price Rule Manager (SCR-PPM-03) | Admin Console | PriceRule | - |

## 2. Chart of Accounts & Tax Configuration

| Use Case | Screen Name (ID) | Platform | Entities Covered | Commercial Law |
| :--- | :--- | :--- | :--- | :--- |
| FIN-01 Maintain Chart of Accounts | Chart of Accounts Master (SCR-FIN-01) | Finance Dashboard | ChartOfAccount | - |
| FIN-02 Configure Tax Rates | Tax Configuration (SCR-FIN-02) | Admin Console | TaxRate | Tax Compliance |
| FIN-03 Close Accounting Period | Period Manager (SCR-FIN-03) | Finance Dashboard | AccountingPeriod | Immutable History |
| FIN-04 Audit Tax Configuration | Tax Configuration (SCR-FIN-02) | Admin Console | AuditLog | - |

## 3. Branch & Warehouse Setup

| Use Case | Screen Name (ID) | Platform | Entities Covered | Commercial Law |
| :--- | :--- | :--- | :--- | :--- |
| OPS-01 Create Branch Location | Branch List (SCR-OPS-01) <br> Branch Details (SCR-OPS-02) | Admin Console | Branch | - |
| OPS-02 Manage Warehouse Layout | Warehouse Layout (SCR-OPS-03) | Warehouse App | Branch (Bin Config) | Inventory Integrity |
| OPS-03 Assign Users to Branch | Branch Details (SCR-OPS-02) | Admin Console | UserRole | - |

## 4. Payment Gateway & Webhook Monitoring

| Use Case | Screen Name (ID) | Platform | Entities Covered | Commercial Law |
| :--- | :--- | :--- | :--- | :--- |
| PAY-01 Configure Gateway Keys | Gateway Settings (SCR-PAY-01) | Admin Console | Tenant (Settings) | PCI Compliance |
| PAY-02 Monitor Payment Logs | Payment Event Log (SCR-PAY-02) | Admin Console | StripePayment | - |
| PAY-03 Reconcile Cash Sessions | Cash Session History (SCR-PAY-03) | POS/Dashboard | CashSession | Revenue Integrity |

## 5. Centralized Approval Inbox

| Use Case | Screen Name (ID) | Platform | Entities Covered | Commercial Law |
| :--- | :--- | :--- | :--- | :--- |
| APR-01 Approve High-Value Quote | Approval Inbox (SCR-APR-01) <br> Request Detail (SCR-APR-02) | Admin/Dashboard | Quote | Segregation of Duties |
| APR-02 Approve Purchase Order | Approval Inbox (SCR-APR-01) <br> Request Detail (SCR-APR-02) | Admin/Dashboard | PurchaseOrder | Segregation of Duties |
| APR-03 Approve Refund | Approval Inbox (SCR-APR-01) <br> Request Detail (SCR-APR-02) | Admin/Dashboard | Refund | Segregation of Duties |

## 6. Multi-Currency & FX Management

| Use Case | Screen Name (ID) | Platform | Entities Covered | Commercial Law |
| :--- | :--- | :--- | :--- | :--- |
| FX-01 Manage Currencies | Currency Master (SCR-FX-01) | Admin Console | SystemConfig (Virtual) | - |
| FX-02 Set Exchange Rates | Exchange Rate History (SCR-FX-02) | Admin Console | ExchangeRate (Virtual) | Historical Accuracy |
| FX-03 View FX Impact | Exchange Rate History (SCR-FX-02) | Finance Admin | PurchaseOrder (Analysis) | - |

## 7. Carrier Claims & Insurance Recovery

| Use Case | Screen Name (ID) | Platform | Entities Covered | Commercial Law |
| :--- | :--- | :--- | :--- | :--- |
| CLM-01 File Carrier Claim | Claims Dashboard (SCR-CLM-01) <br> Claim Detail (SCR-CLM-02) | Admin/Logistics | DeliveryException | Revenue Reversal |
| CLM-02 Track Claim Status | Claims Dashboard (SCR-CLM-01) | Admin/Logistics | DeliveryException | - |
| CLM-03 Record Insurance Payout | Claim Detail (SCR-CLM-02) | Finance Admin | Chargeback/Refund | - |

## Coverage Verification

**Uncovered Entities Check:**

- All core entities defined in `GovernanceMasterData.md` are mapped to screens.
- `Product`, `PriceRule`, `Quote`, `Substitution` -> [x] Covered
- `ChartOfAccount`, `TaxRate`, `AccountingPeriod` -> [x] Covered
- `Branch`, `Inventory` (via Warehouse Layout) -> [x] Covered
- `StripePayment`, `CashSession` -> [x] Covered
- `PurchaseOrder`, `Refund` (via Approval Inbox) -> [x] Covered
- `DeliveryException` (via Claims) -> [x] Covered
- **Result**: Zero uncovered entities found for defined domains.
