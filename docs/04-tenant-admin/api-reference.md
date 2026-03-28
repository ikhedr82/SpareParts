# Tenant Admin Portal — API Reference

## Authentication
```
Authorization: Bearer <access_token>
```
The token must contain a valid `tenantId`. All data returned is automatically filtered to the authenticated tenant.

## Error Structure
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## Endpoint Groups

### Inventory
- `GET /inventory?branchId=` — List inventory by branch.
- `PATCH /inventory/:id` — Update selling/cost price.
- `POST /inventory/adjust` — Manual stock adjustment.
- `GET /inventory/ledger` — View inventory ledger.

### Sales
- `GET /sales` — List sales (paginated, filterable).
- `GET /sales/:id` — Sale detail with items and payments.
- `POST /sales/:id/void` — Void a sale.

### Customers
- `GET /customers` — List customers.
- `POST /customers` — Create customer.
- `PATCH /customers/:id` — Update customer.

### Business Clients
- `GET /business-clients` — List B2B clients.
- `POST /business-clients` — Create client.
- `GET /business-clients/:id` — Client detail with addresses, contacts.
- `PATCH /business-clients/:id` — Update client.

### Orders
- `GET /orders` — List orders.
- `POST /orders` — Create order.
- `PATCH /orders/:id/status` — Update order status.
- `GET /orders/:id` — Order detail.

### Quotes
- `GET /quotes` — List quotes.
- `POST /quotes` — Create quote.
- `POST /quotes/:id/send` — Send to client.
- `POST /quotes/:id/convert` — Convert to order.

### Purchase Orders
- `GET /purchase-orders` — List POs.
- `POST /purchase-orders` — Create PO.
- `POST /purchase-orders/:id/receive` — Record goods receipt.

### Logistics
- `GET /logistics/trips` — List delivery trips.
- `POST /logistics/trips` — Create trip.
- `GET /logistics/drivers` — List drivers.
- `GET /logistics/vehicles` — List vehicles.

### Finance
- `GET /accounting/chart-of-accounts` — List accounts.
- `GET /accounting/journal-entries` — List journal entries.
- `POST /accounting/journal-entries` — Create journal entry.
- `POST /accounting/journal-entries/:id/post` — Post entry.

### CRM
- `GET /crm/leads` — List leads.
- `POST /crm/leads` — Create lead.
- `GET /crm/opportunities` — List opportunities.
- `POST /crm/activities` — Log activity.

### Users & Branches
- `GET /users` — List tenant users.
- `POST /users` — Create user.
- `GET /branches` — List branches.
- `POST /branches` — Create branch.

> **Note**: For complete request/response schemas, refer to the Swagger UI at `/api/docs`.
