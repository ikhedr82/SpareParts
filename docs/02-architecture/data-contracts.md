# Data Contracts

## Overview
This document defines the data exchange contracts between Partivo's different system layers: Backend API ↔ Frontend Portals ↔ Mobile Apps.

## API Response Envelope
All API responses follow a consistent structure:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { ... }
}
```

Error responses:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    { "field": "email", "message": "Email is required" }
  ]
}
```

## Authentication Contract
- **Login**: `POST /auth/login` → Returns `{ access_token: string }`.
- **JWT Claims**: `{ sub: userId, email, tenantId?, isPlatformUser, roles: string[] }`.
- **Header**: `Authorization: Bearer <token>`.

## Key Entity Contracts

### Tenant
```typescript
interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  defaultLanguage: 'EN' | 'AR';
  supportedLanguages: ('EN' | 'AR')[];
  baseCurrency: string;
  vatPercentage: number;
}
```

### Product (Global Catalog)
```typescript
interface Product {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  brandId: string;
  categoryId: string;
  status: 'ACTIVE' | 'INACTIVE';
  images: string[];
  unitOfMeasure: string;
}
```

### Inventory (Tenant-Scoped)
```typescript
interface Inventory {
  id: string;
  tenantId: string;
  branchId: string;
  productId: string;
  quantity: number;
  allocated: number;
  sellingPrice: number;
  costPrice: number;
  barcode?: string;
  binLocation?: string;
}
```

### Sale (POS)
```typescript
interface Sale {
  id: string;
  tenantId: string;
  branchId: string;
  total: number;
  status: 'COMPLETED' | 'REFUNDED' | 'VOIDED';
  currency: string;
  items: SaleItem[];
  payments: Payment[];
  offlineSyncId?: string;
}
```

### Order (B2B)
```typescript
interface Order {
  id: string;
  tenantId: string;
  businessClientId: string;
  branchId: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'OUT_FOR_DELIVERY' | 'DELIVERY_FAILED' | 'READY_FOR_PICKUP' | 'PARTIALLY_FULFILLED';
  subtotal: number;
  tax: number;
  total: number;
  items: OrderItem[];
}
```

## Sync Contract (Mobile → Backend)
```typescript
interface SyncBatchRequest {
  deviceId: string;
  events: SyncEvent[];
}

interface SyncEvent {
  offlineSyncId: string;
  entityType: 'SALE' | 'PAYMENT' | 'INVENTORY' | 'CASH_SESSION';
  action: 'CREATE' | 'UPDATE';
  payload: Record<string, any>;
  timestamp: string; // ISO 8601
  version: number;
}
```

## Pagination Contract
List endpoints return paginated responses:
```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

## Payment Methods Enum
```typescript
type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'STRIPE';
```
