# POS App — Developer Guide

## Project Structure

POS screens live alongside Driver and Warehouse screens in the shared `mobile-app` project:

```
mobile-app/src/screens/pos/
├── POSLoginScreen.tsx        # Cashier authentication
├── POSHomeScreen.tsx         # Dashboard (stats + quick actions)
├── ProductSearchScreen.tsx   # Text/barcode product search
├── CartScreen.tsx            # Cart management (qty, remove, totals)
├── CheckoutScreen.tsx        # Payment method selection + processing
└── SalesHistoryScreen.tsx    # Past transaction records
```

## Navigation

POS uses a dedicated Stack Navigator registered under the `POSApp` tab:

```
POSLogin → POSHome → ProductSearch → Cart → Checkout
                    └→ SalesHistory
```

## Key Flows

### Sale Flow
1. Cashier searches products via text or barcode
2. Products added to cart (auto-increment duplicates)
3. Cart shows real-time subtotal + tax (15%) + total
4. Checkout screen: select Cash/Card/Transfer
5. `POST /mobile/pos/checkout` processes the sale
6. Success screen shows order ID + amount

### Barcode Scanning
Uses `BarcodeScanner` component with `expo-camera`:
- Supports: QR, EAN-13, EAN-8, UPC-E, Code128, Code39
- Opens in full-screen Modal
- Returns scanned data string to calling screen

## Cart State

Cart uses local `useState` with these operations:
- **Add**: If product exists, increment qty; else push new item
- **Quantity**: +/− buttons; removes item at qty=0
- **Remove**: Confirmation dialog, then filter out
- **Clear**: Confirmation dialog, then reset to empty array
- **Totals**: Computed from items array on every render

## Adding a New POS Feature

1. Create screen in `src/screens/pos/`
2. Add `Stack.Screen` in `POSStack` within `AppNavigator.tsx`
3. Add locale keys to `en.json` and `ar.json` under `pos.*`
4. Use `BRAND` tokens for all colors and spacing
5. Implement loading, error, and empty states
