# Customer Portal — Functional Specification

## Overview
The Customer Portal is a tenant-branded B2B/B2C commerce storefront. Business clients (workshops, retailers) and end customers can browse the tenant's catalog, check stock availability, and place orders directly.

## User Roles
- **Business Client Contact**: Authenticated user linked to a `BusinessClient` record. Can browse catalog, view their specific pricing, and place orders.
- **Guest / Public Visitor**: Can view the tenant's public landing page and sign up.

## Functional Modules

### 1. Public Landing (`/(public)/`)
- Tenant-branded landing page.
- Displays: Business name, contact information, call-to-action.
- Links to: Sign Up, Login, Legal pages (Terms, Privacy).

### 2. Sign Up (`/(public)/signup/`)
- Self-serve registration for new business clients.
- Collected Fields: Business name, type (Workshop/Retailer), email, phone, password.
- On successful registration, a `BusinessClient` record is created for the tenant.

### 3. Legal Pages
- **Terms & Conditions** (`/(public)/terms/`): Publicly accessible legal terms.
- **Privacy Policy** (`/(public)/privacy/`): Publicly accessible privacy information.
- These pages do not require authentication.

### 4. Catalog Browsing
- Search products by name, part number, brand, category.
- Vehicle fitment search: Select Make → Model → Year to find compatible parts.
- View product details: Name, brand, images, description, availability, price.
- Prices reflect client-specific price rules when authenticated.

### 5. Cart & Checkout
- Add products to a persistent cart (stored server-side per `BusinessClient`).
- Adjust quantities, remove items.
- Select delivery address from saved addresses.
- Select contact person for the order.
- Place order → Creates an `Order` with status `PENDING`.

### 6. Order History
- View past orders with status tracking.
- Order Statuses: PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED.
- View order details: Line items, totals, delivery address, status timeline.

### 7. Account Management
- Update business profile.
- Manage addresses (add, edit, delete).
- Manage contacts (additional authorized users).
- View credit account balance and limit.
