# Driver App — Developer Guide

## Project Structure

```
mobile-app/
├── App.js                          # Entry point (LanguageProvider wrapper)
├── app.json                        # Expo config (Partivo branding)
├── src/
│   ├── config/brand.ts             # Brand tokens (colors, fonts, spacing)
│   ├── i18n/LanguageContext.tsx     # Localization provider + useLanguage hook
│   ├── locales/
│   │   ├── en.json                 # English translations
│   │   └── ar.json                 # Arabic translations
│   ├── navigation/AppNavigator.tsx  # Tab + Stack navigators
│   ├── services/
│   │   ├── api.ts                  # Axios client (JWT interceptor)
│   │   └── auth.ts                 # Login / logout / token management
│   ├── components/
│   │   └── BarcodeScanner.tsx      # Camera barcode scanner
│   └── screens/
│       ├── driver/
│       │   ├── DriverLoginScreen.tsx
│       │   ├── DriverHomeScreen.tsx
│       │   └── TripDetailScreen.tsx     # (DeliveryDetailScreen)
│       ├── pos/
│       │   ├── POSLoginScreen.tsx
│       │   ├── POSHomeScreen.tsx
│       │   ├── ProductSearchScreen.tsx
│       │   ├── CartScreen.tsx
│       │   ├── CheckoutScreen.tsx
│       │   └── SalesHistoryScreen.tsx
│       └── warehouse/
│           ├── WarehouseLoginScreen.tsx
│           ├── WarehouseHomeScreen.tsx
│           ├── PickListScreen.tsx
│           └── StockLookupScreen.tsx
```

## API Endpoints (Driver)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Authenticate driver |
| GET | `/mobile/driver/trips` | Get assigned deliveries |
| PATCH | `/mobile/driver/trips/:id/status` | Update delivery status |

## API Endpoints (POS)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Authenticate cashier |
| GET | `/mobile/pos/summary` | Dashboard stats |
| GET | `/mobile/pos/products?search=` | Search products |
| POST | `/mobile/pos/checkout` | Process sale |
| GET | `/mobile/pos/sales` | Sales history |

## How to Add a New Screen

1. Create the screen file in `src/screens/<module>/NewScreen.tsx`
2. Import and use `useLanguage()` for translations
3. Import `BRAND` from `../../config/brand` for styling
4. Add navigation entry in `src/navigation/AppNavigator.tsx` inside the relevant Stack
5. Add locale keys to `src/locales/en.json` and `src/locales/ar.json`

## State Management

- **Local state**: `useState` for component-scoped data
- **Navigation params**: `route.params` for screen-to-screen data passing (e.g., Cart → Checkout)
- **Persistent state**: `expo-secure-store` for JWT tokens
- **API state**: Direct Axios calls via centralized `apiClient` with auto-JWT interceptor

## Localization

Use the `useLanguage()` hook:

```tsx
const { t, isRtl } = useLanguage();

// Use t() for all strings
<Text>{t('driver.my_deliveries')}</Text>

// Use isRtl for layout direction
<View style={[styles.row, isRtl && styles.rowReverse]}>
```

## Brand Theming

Import from the central config:

```tsx
import BRAND from '../../config/brand';

const styles = StyleSheet.create({
    button: { backgroundColor: BRAND.colors.primary },
    text: { color: BRAND.colors.textPrimary },
});
```
