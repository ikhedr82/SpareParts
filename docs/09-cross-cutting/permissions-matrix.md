# Permissions Matrix

## Platform Roles

| Permission | Super Admin | Support Agent |
|---|:---:|:---:|
| `tenants.read` | ✅ | ✅ |
| `tenants.write` | ✅ | ❌ |
| `tenants.suspend` | ✅ | ❌ |
| `tenants.delete` | ✅ | ❌ |
| `plans.read` | ✅ | ✅ |
| `plans.write` | ✅ | ❌ |
| `subscriptions.read` | ✅ | ✅ |
| `subscriptions.write` | ✅ | ❌ |
| `catalog.read` | ✅ | ✅ |
| `catalog.write` | ✅ | ❌ |
| `cms.read` | ✅ | ✅ |
| `cms.write` | ✅ | ❌ |
| `audit-logs.read` | ✅ | ✅ |
| `users.manage` | ✅ | ❌ |
| `support.read` | ✅ | ✅ |
| `support.write` | ✅ | ✅ |

## Tenant Roles

| Permission | Owner | Manager | Clerk |
|---|:---:|:---:|:---:|
| `inventory.read` | ✅ | ✅ | ✅ |
| `inventory.write` | ✅ | ✅ | ✅ |
| `inventory.adjust` | ✅ | ✅ | ❌ |
| `sales.read` | ✅ | ✅ | ✅ |
| `sales.create` | ✅ | ✅ | ✅ |
| `sales.void` | ✅ | ✅ | ❌ |
| `orders.read` | ✅ | ✅ | ✅ |
| `orders.write` | ✅ | ✅ | ✅ |
| `orders.cancel` | ✅ | ✅ | ❌ |
| `customers.read` | ✅ | ✅ | ✅ |
| `customers.write` | ✅ | ✅ | ✅ |
| `business-clients.read` | ✅ | ✅ | ✅ |
| `business-clients.write` | ✅ | ✅ | ❌ |
| `quotes.read` | ✅ | ✅ | ✅ |
| `quotes.write` | ✅ | ✅ | ✅ |
| `purchase-orders.read` | ✅ | ✅ | ❌ |
| `purchase-orders.write` | ✅ | ✅ | ❌ |
| `logistics.read` | ✅ | ✅ | ✅ |
| `logistics.write` | ✅ | ✅ | ❌ |
| `returns.read` | ✅ | ✅ | ✅ |
| `returns.write` | ✅ | ✅ | ❌ |
| `finance.read` | ✅ | ✅ | ❌ |
| `finance.write` | ✅ | ❌ | ❌ |
| `analytics.read` | ✅ | ✅ | ❌ |
| `users.read` | ✅ | ✅ | ❌ |
| `users.manage` | ✅ | ❌ | ❌ |
| `branches.read` | ✅ | ✅ | ✅ |
| `branches.write` | ✅ | ❌ | ❌ |
| `crm.read` | ✅ | ✅ | ❌ |
| `crm.write` | ✅ | ✅ | ❌ |
| `settings.read` | ✅ | ✅ | ❌ |
| `settings.write` | ✅ | ❌ | ❌ |

## Notes
- Permissions are additive: a user with both Owner and Manager roles has the union of all permissions.
- Branch-scoped roles restrict access to inventory, sales, and sessions within that specific branch only.
- Custom roles can be created by Owners with any subset of available permissions.
