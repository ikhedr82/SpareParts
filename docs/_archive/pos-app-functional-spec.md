# POS App — Functional Specification

## EP-P01: POS Authentication

### FT-P01.1: Cashier Login
**US-P01.1.1**: As a cashier, I want to log in with my credentials to access the POS system.
- **AC1**: Login form with email and password fields
- **AC2**: JWT stored in secure storage
- **AC3**: Error handling with localized messages
- **AC4**: Brand-themed interface (Partivo secondary blue)

---

## EP-P02: POS Dashboard

### FT-P02.1: Sales Summary
**US-P02.1.1**: As a cashier, I want to see today's sales metrics at a glance.
- **AC1**: Dashboard shows transaction count and revenue
- **AC2**: Data fetched from `GET /mobile/pos/summary`
- **AC3**: Loading state during data fetch

### FT-P02.2: Quick Actions
**US-P02.2.1**: As a cashier, I want quick access to Product Search, Cart, and Sales History.
- **AC1**: Three large action cards navigate to respective screens
- **AC2**: Cards use Partivo brand colors

### FT-P02.3: Recent Sales
**US-P02.3.1**: As a cashier, I want to see recent transactions on my dashboard.
- **AC1**: List shows order ID, total, payment method, and time
- **AC2**: Empty state when no sales today

---

## EP-P03: Product Catalog

### FT-P03.1: Product Search
**US-P03.1.1**: As a cashier, I want to search products by name, SKU, or barcode.
- **AC1**: Text search with API integration (`GET /mobile/pos/products`)
- **AC2**: Results show name, SKU, price, and stock quantity
- **AC3**: "Add to Cart" button on each product

### FT-P03.2: Barcode Scanner
**US-P03.2.1**: As a cashier, I want to scan barcodes to quickly find products.
- **AC1**: Camera-based barcode scanning via `expo-camera`
- **AC2**: Supports QR, EAN-13, EAN-8, UPC-E, Code128, Code39
- **AC3**: Scanned data auto-populates search and triggers lookup

---

## EP-P04: Cart Management

### FT-P04.1: Cart Operations
**US-P04.1.1**: As a cashier, I want to manage products in the cart.
- **AC1**: Add product from search (auto-increment if duplicate)
- **AC2**: Adjust quantity with +/− buttons
- **AC3**: Remove item with confirmation dialog
- **AC4**: Clear entire cart with confirmation

### FT-P04.2: Cart Totals
**US-P04.2.1**: As a cashier, I want to see subtotal, tax, and total calculated in real-time.
- **AC1**: Subtotal = sum of (price × quantity)
- **AC2**: Tax = 15% of subtotal
- **AC3**: Total = subtotal + tax − discount
- **AC4**: Checkout button passes totals to Checkout screen

---

## EP-P05: Checkout & Payment

### FT-P05.1: Payment Processing
**US-P05.1.1**: As a cashier, I want to select a payment method and process the sale.
- **AC1**: Payment methods: Cash, Card, Bank Transfer
- **AC2**: Visual card selection with emoji icons
- **AC3**: Process button sends `POST /mobile/pos/checkout`
- **AC4**: Loading state during API call

### FT-P05.2: Success & Receipt
**US-P05.2.1**: As a cashier, I want confirmation after a successful sale.
- **AC1**: Success view shows order ID and total
- **AC2**: "New Sale" button returns to POS Home

---

## EP-P06: Sales History

### FT-P06.1: Transaction History
**US-P06.1.1**: As a cashier, I want to view past sales.
- **AC1**: List fetched from `GET /mobile/pos/sales`
- **AC2**: Each record shows order ID, date, total, payment method, and item count
- **AC3**: Loading and empty states handled
