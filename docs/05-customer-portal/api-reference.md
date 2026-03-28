# Customer Portal — API Reference

## Authentication
Public endpoints (catalog browsing, signup) do not require authentication. Authenticated endpoints (cart, orders, account) require:
```
Authorization: Bearer <access_token>
```

## Error Structure
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## Endpoint Groups

### Public / Catalog
- `GET /public-inventory/:tenantId/products` — Browse tenant's available products.
- `GET /public-inventory/:tenantId/products/:id` — Product detail.
- `GET /public-info/:subdomain` — Tenant public information.
- `GET /catalog/vehicle-makes` — List vehicle makes.
- `GET /catalog/vehicle-models?makeId=` — List vehicle models.
- `GET /catalog/fitments?vehicleModelId=` — Find compatible products.

### Authentication
- `POST /auth/login` — Login.
- `POST /customer-portal/register` — Self-serve registration.

### Cart
- `GET /cart` — Get current cart.
- `POST /cart/items` — Add item to cart.
- `PATCH /cart/items/:id` — Update item quantity.
- `DELETE /cart/items/:id` — Remove item from cart.

### Orders
- `GET /customer-portal/orders` — List client's orders.
- `POST /customer-portal/orders` — Place new order from cart.
- `GET /customer-portal/orders/:id` — Order detail with status.

### Account
- `GET /customer-portal/profile` — Get business client profile.
- `PATCH /customer-portal/profile` — Update profile.
- `GET /customer-portal/addresses` — List addresses.
- `POST /customer-portal/addresses` — Add address.

> **Note**: For full request/response schemas, refer to the Swagger UI at `/api/docs`.
