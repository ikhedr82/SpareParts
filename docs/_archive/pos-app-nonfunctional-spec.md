# POS App — Non-Functional Specification

## Security

| Requirement | Implementation |
|---|---|
| Token Storage | JWT via `expo-secure-store` / `localStorage` fallback |
| API Auth | Auto-attached via centralized Axios interceptor |
| Session Expiry | 401 → automatic logout callback |
| Role Enforcement | Server-side RBAC; client checks role from JWT payload |
| Safe Logging | No tokens in console output |

## Offline Support

| Requirement | Implementation |
|---|---|
| Offline Sales | Cart state maintained in local component state |
| Transaction Queue | Pending checkouts stored locally until connectivity returns |
| Sync Resolution | Sequential POST on reconnect with conflict detection |
| Offline Banner | Visual indicator when device is offline |

## Performance

| Requirement | Implementation |
|---|---|
| Product Search | Debounced API calls, lazy-loaded results |
| Cart Operations | Direct local state manipulation (no API per action) |
| Checkout | Single POST with complete order payload |
| List Rendering | FlatList with keyExtractor for efficient recycling |

## Localization

| Requirement | Implementation |
|---|---|
| Languages | English, Arabic |
| RTL | I18nManager integration, row-reverse styles |
| Key Parity | 1:1 EN/AR key coverage for all POS strings |
| Interpolation | `{{param}}` template syntax |

## Error Handling

| Scenario | Behavior |
|---|---|
| Search No Results | Empty state with illustration |
| Checkout Failure | Alert with error message, retry option |
| Network Error | Offline banner, queue transactions |
| Token Expired | Auto-logout with session expired message |
