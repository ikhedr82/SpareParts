Stage 1 Database Tables

SaaS Core

- tenants
- users
- roles
- user_roles
- branches

Global Catalog (Minimal)

- brands
- product_categories
- products

Retail Operations

- inventory
- sales
- sale_items
- returns
- return_items

Rules:

- Do NOT include vehicles, engines, fitment, OEM numbers, batches, suppliers, or purchasing
- Products MUST reference brands and product_categories
- Products are global (no tenant_id)
- Inventory and sales are tenant-specific
