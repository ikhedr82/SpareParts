# POS App — API Reference

## Authentication
```
Authorization: Bearer <access_token>
```

## Endpoint Groups

### Authentication
- `POST /auth/login` — Login with email/password.

### Products & Search
- `GET /inventory?branchId=` — Branch inventory with products.
- `GET /catalog/products?search=` — Product search.
- `GET /catalog/fitments?vehicleModelId=` — Vehicle fitment lookup.
- `GET /catalog/vehicle-makes` — Vehicle makes.
- `GET /catalog/vehicle-models?makeId=` — Vehicle models.

### Sales
- `POST /sales` — Create sale with items and payments.
- `GET /sales?branchId=&date=` — Sales history.
- `GET /sales/:id` — Sale detail.
- `POST /sales/:id/void` — Void a sale.

### Cash Sessions
- `POST /cash-session/open` — Open cash session.
- `POST /cash-session/:id/close` — Close cash session.
- `GET /cash-session/active?branchId=` — Get active session.

### Sync
- `POST /sync/batch` — Batch upload offline events.
- `GET /sync/status` — Check sync queue status.

### Payments
- `POST /payments` — Record payment against a sale.

> **Note**: For full request/response schemas, refer to the Swagger UI at `/api/docs`.
