Car Spare Parts Retail SaaS Platform

1. Data Architecture Philosophy

The system has two worlds:

🌍 Global World (shared by all tenants)

This is your catalog and intelligence layer
You own it. Retailers cannot change it.

🏪 Tenant World (isolated per retailer)

This is their business data
Inventory, prices, customers, sales.

They reference your global data.

This separation is your moat.

1. Global Data Model (Shared Catalog)

These tables exist once for the entire platform.

2.1 Vehicle & Fitment
vehicle_makes

- id
- name

vehicle_models

- id
- make_id
- name
- generation
- year_from
- year_to

engines

- id
- model_id
- code
- fuel_type
- capacity

2.2 Product Taxonomy
brands

- id
- name
- country
- is_oem

product_categories

- id
- name
- parent_id

2.3 Parts Master
products

- id
- brand_id
- category_id
- name
- description
- weight
- dimensions
- status

2.4 Part Numbers
product_numbers

- id
- product_id
- type (OEM, aftermarket, internal)
- number

2.5 Fitment
product_fitment

- id
- product_id
- engine_id
- position (front, rear, left, right)

This answers:

“Does this part fit this car?”

2.6 Media
product_images

- id
- product_id
- url
- is_primary

1. SaaS & Tenant Model
3.1 SaaS Core
tenants

- id
- name
- subdomain
- status
- plan

users

- id
- tenant_id
- email
- password_hash
- status

roles

- id
- tenant_id
- name

user_roles

- user_id
- role_id

3.2 Branches
branches

- id
- tenant_id
- name
- address
- phone

1. Retail Operations (Stage 1)
4.1 Inventory
inventory

- id
- tenant_id
- branch_id
- product_id   (global)
- quantity
- selling_price
- barcode

Retailers don’t create products — they attach stock to global products.

4.2 Sales
sales

- id
- tenant_id
- branch_id
- customer_name
- total
- status
- created_at

sale_items

- id
- sale_id
- product_id
- quantity
- price

4.3 Returns
returns

- id
- sale_id
- reason
- created_at

return_items

- return_id
- product_id
- quantity

1. Supply Chain (Stage 2)
5.1 Suppliers
suppliers

- id
- tenant_id
- name
- contact

5.2 Purchase Orders
purchase_orders

- id
- tenant_id
- supplier_id
- status
- total_cost

purchase_items

- id
- purchase_order_id
- product_id
- quantity
- unit_cost

5.3 Goods Receipt
goods_receipts

- id
- purchase_order_id
- received_at

5.4 Transfers
stock_transfers

- id
- tenant_id
- from_branch_id
- to_branch_id
- status

1. Warranty & Batches (Stage 2)
batches

- id
- product_id
- expiry_date

serial_numbers

- id
- batch_id
- serial

1. SaaS Monetization (Stage 3)
subscriptions

- tenant_id
- stripe_customer_id
- plan
- status

usage_metrics

- tenant_id
- metric
- value
- period
