# Platform Admin Portal — API Reference

## Authentication
All API requests require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```
The token must contain `isPlatformUser: true` in its claims.

## Error Structure
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```
Common error codes: `400` (Validation), `401` (Unauthorized), `403` (Forbidden), `404` (Not Found), `409` (Conflict), `500` (Server Error).

## Endpoint Groups

### Tenant Management
- `GET /platform-admin/tenants` — List all tenants (paginated).
- `GET /platform-admin/tenants/:id` — Get tenant details.
- `PATCH /platform-admin/tenants/:id` — Update tenant.
- `POST /platform-admin/tenants/:id/suspend` — Suspend tenant.
- `POST /platform-admin/tenants/:id/activate` — Activate tenant.

### Plans & Subscriptions
- `GET /platform-admin/plans` — List all plans.
- `POST /platform-admin/plans` — Create plan.
- `PATCH /platform-admin/plans/:id` — Update plan.
- `GET /platform-admin/subscriptions` — List subscriptions.
- `PATCH /platform-admin/subscriptions/:id` — Modify subscription.

### Global Catalog
- `GET /catalog/products` — List products (global).
- `POST /catalog/products` — Create product.
- `PATCH /catalog/products/:id` — Update product.
- `GET /catalog/brands` — List brands.
- `GET /catalog/categories` — List categories.
- `GET /catalog/vehicle-makes` — List vehicle makes.
- `GET /catalog/vehicle-models` — List vehicle models.
- `POST /catalog/fitments` — Create product fitment.

### CMS
- `GET /platform-admin/cms/:section` — Get CMS content.
- `PUT /platform-admin/cms/:section` — Update CMS content.

### System
- `GET /platform-admin/audit-logs` — Query audit logs.
- `GET /platform-admin/health` — System health check.
- `GET /platform-admin/currencies` — List currencies.
- `POST /platform-admin/currencies` — Create/update currency.

> **Note**: For full endpoint documentation with request/response schemas, refer to the Swagger UI available at `/api/docs` when the backend is running.
