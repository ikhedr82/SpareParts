# Driver App — Non-Functional Specification

## Security

| Requirement | Implementation |
|---|---|
| Token Storage | JWT stored via `expo-secure-store` (native) / `localStorage` (web fallback) |
| API Authentication | Auto-attached via Axios request interceptor |
| Session Expiry | 401 responses trigger automatic logout callback |
| Safe Logging | API errors logged without token exposure |
| No Hardcoded URLs | Base URL from `EXPO_PUBLIC_API_URL` env variable |

## Offline Support

| Requirement | Implementation |
|---|---|
| Delivery List Cache | Deliveries loaded into local state; pull-to-refresh for updates |
| Status Queue | Status updates queued locally when offline, synced on reconnect |
| Offline Banner | Visual indicator when device has no network connection |

## Performance

| Requirement | Implementation |
|---|---|
| Lazy Loading | Delivery details loaded on navigation, not on list mount |
| Pull-to-Refresh | FlatList RefreshControl for manual data refresh |
| Minimal Re-renders | State updates scoped to individual components |
| Efficient Lists | FlatList with `keyExtractor` for optimized rendering |

## Localization

| Requirement | Implementation |
|---|---|
| Languages | English (en.json), Arabic (ar.json) |
| RTL | `I18nManager.forceRTL()` on language switch |
| Key Parity | 1:1 key parity between locale files |
| Interpolation | Template params via `{{param}}` syntax |
| Layout Mirroring | `flexDirection: 'row-reverse'` for RTL rows |

## Error Handling

| Scenario | Behavior |
|---|---|
| API Failure | Error state with retry button |
| Invalid Credentials | Localized error alert |
| Network Unavailable | Offline banner, graceful degradation |
| Token Expired | Auto-logout with session expired message |
