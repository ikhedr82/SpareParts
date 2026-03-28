# Test Scenarios

## 1. Authentication & Authorization

### Happy Paths
| # | Scenario | Expected |
|---|---|---|
| 1.1 | Platform admin login with valid credentials | JWT returned with `isPlatformUser: true` |
| 1.2 | Tenant user login with valid credentials | JWT returned with `tenantId` set |
| 1.3 | Access protected endpoint with valid JWT | 200 OK |

### Edge Cases
| # | Scenario | Expected |
|---|---|---|
| 1.4 | Login with incorrect password | 401 Unauthorized |
| 1.5 | Login with non-existent email | 401 Unauthorized |
| 1.6 | Access protected endpoint without token | 401 Unauthorized |
| 1.7 | Access endpoint with expired token | 401 Unauthorized |
| 1.8 | Tenant user accessing platform admin endpoint | 403 Forbidden |
| 1.9 | User accessing another tenant's data | 404 Not Found (tenant filter hides data) |

## 2. POS Sales

### Happy Paths
| # | Scenario | Expected |
|---|---|---|
| 2.1 | Complete cash sale with single item | Sale created, inventory deducted, payment recorded |
| 2.2 | Complete card sale with multiple items | Sale created, inventory deducted for all items |
| 2.3 | Split payment (cash + card) | Multiple payment records, sale total matches sum |
| 2.4 | Sale with customer linked | Sale has `customerId` set |

### Edge Cases
| # | Scenario | Expected |
|---|---|---|
| 2.5 | Sale without open cash session | 400 "Please open a cash session" |
| 2.6 | Sale for product with 0 stock | Sale succeeds (backorder allowed) |
| 2.7 | Void a completed sale | Sale status VOIDED, inventory restored |
| 2.8 | Void an already voided sale | 400 "Sale is already voided" |

### Failure Scenarios
| # | Scenario | Expected |
|---|---|---|
| 2.9 | Database connection lost during sale | Transaction rolled back, no partial data |
| 2.10 | Concurrent sales for last item in stock | Optimistic concurrency error for second sale |

## 3. Offline Sync

### Happy Paths
| # | Scenario | Expected |
|---|---|---|
| 3.1 | Offline sale synced to server | Sale persisted with `offlineSyncId` |
| 3.2 | Batch of 10 offline events synced | All 10 events processed in order |
| 3.3 | Duplicate sync event (same `offlineSyncId`) | Server returns 200, no duplicate created |

### Edge Cases
| # | Scenario | Expected |
|---|---|---|
| 3.4 | Sync event with stale version | 409 Conflict, client must re-fetch |
| 3.5 | Network drop mid-batch | Partially synced; remaining events retry |
| 3.6 | Device sends events out of chronological order | Server reorders by timestamp |

## 4. B2B Orders

### Happy Paths
| # | Scenario | Expected |
|---|---|---|
| 4.1 | Create order from cart | Order created with PENDING status |
| 4.2 | Confirm order | Status → CONFIRMED, pick list created |
| 4.3 | Complete pick → pack → ship → deliver | Full lifecycle completed |
| 4.4 | Convert quote to order | Quote status CONVERTED, order created |

### Edge Cases
| # | Scenario | Expected |
|---|---|---|
| 4.5 | Order exceeds client credit limit | 422 "Credit limit exceeded" |
| 4.6 | Cancel a shipped order | 400 "Cannot cancel shipped orders" |
| 4.7 | Pick list with stock shortage | PickListItem status SHORTAGE, substitution offered |

## 5. Delivery & Logistics

### Happy Paths
| # | Scenario | Expected |
|---|---|---|
| 5.1 | Create trip with 3 stops | Trip PLANNED with 3 TripStops |
| 5.2 | Driver completes all stops | Trip status COMPLETED |
| 5.3 | Proof of delivery captured | ProofOfDelivery record with signature, photo, GPS |

### Failure Scenarios
| # | Scenario | Expected |
|---|---|---|
| 5.4 | Delivery failed — customer unavailable | Exception created, stop FAILED |
| 5.5 | Delivery failed — damaged in transit | Exception + chargeback created |
| 5.6 | All stops failed | Trip status FAILED |

## 6. Billing & Subscriptions

### Happy Paths
| # | Scenario | Expected |
|---|---|---|
| 6.1 | New tenant starts trial | Subscription TRIAL, trial end date set |
| 6.2 | Trial converts to paid | Subscription ACTIVE, invoice created |
| 6.3 | Monthly renewal | New invoice generated, period updated |

### Edge Cases
| # | Scenario | Expected |
|---|---|---|
| 6.4 | Payment fails | Subscription PAST_DUE, dunning initiated |
| 6.5 | Max dunning attempts reached | Subscription SUSPENDED, tenant access restricted |
| 6.6 | Duplicate webhook event | Idempotent processing, no double charge |

## 7. Multi-Tenancy Isolation

### Critical Tests
| # | Scenario | Expected |
|---|---|---|
| 7.1 | Tenant A queries inventory | Only Tenant A's inventory returned |
| 7.2 | Tenant A tries to access Tenant B's order | 404 Not Found |
| 7.3 | Platform admin views all tenants | All tenants visible |
| 7.4 | Branch-scoped user queries | Only branch-specific data returned |
