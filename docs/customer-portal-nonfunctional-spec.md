# Customer Portal — Non-Functional Requirements

This document outlines the operational and quality standards for the Customer Portal, ensuring the B2B self-service interface is secure, performant, and reliable for business client users.

## Security

- **JWT Authentication**: All API requests include a `Bearer` token extracted from the `auth-token` cookie. The Axios request interceptor attaches the token automatically to every outbound request.
- **Portal Auth Guard**: Backend `PortalAuthGuard` verifies that the authenticated user has a valid `businessClientId`, rejecting requests from non-client users (e.g., internal admins attempting portal endpoints).
- **Business Client Scoping**: Every query is strictly filtered by `businessClientId` extracted from the JWT payload. Clients cannot access orders, invoices, or substitutions belonging to other clients.
- **Tenant Isolation**: All portal endpoints also enforce `tenantId` scoping, preventing cross-tenant data leakage.
- **Destructive Action Confirmation**: Substitution approve/reject actions require explicit user confirmation via `window.confirm()` dialogs before API calls are dispatched.
- **Client ID Hijack Prevention**: The `POST /portal/orders` endpoint validates that `dto.businessClientId` matches the authenticated user's `businessClientId`, throwing `BadRequestException` on mismatch.

## Error Handling

- **Structured API Error Logging**: The Axios response interceptor captures failed requests and logs structured objects containing `path`, `message`, and `status` — avoiding raw stack traces in the browser console.
- **User-Facing Error Messages**: Error states display the server's `message` field when available, falling back to the localized `common.error_occurred` string.
- **401 Auto-Redirect**: Unauthorized responses trigger an automatic redirect to `/login`, preventing users from operating with expired tokens.
- **Graceful Degradation**: The Dashboard uses `Promise.allSettled` to fetch data from three independent endpoints. Failure of one endpoint does not block the others from rendering.

## Performance

- **Debounced Search**: Inventory search uses a 500ms debounce timer to avoid excessive API calls during continuous typing.
- **Client-Side Filtering**: Order search filters the already-fetched list client-side, avoiding redundant API calls for simple text searches.
- **Optimistic UI Updates**: Substitution approve/reject actions remove the item from the list immediately after a successful API response, without a full page refresh.
- **Minimal Re-renders**: Data-fetching callbacks use `useCallback` with proper dependency arrays to prevent unnecessary re-renders and infinite fetch loops.

## Observability

- **Contextual Error Logging**: API errors are logged with the request `path`, response `status`, and `message` for easier debugging and correlation.
- **No Raw Stack Traces**: Frontend error handlers extract human-readable messages from API responses rather than exposing internal error details to clients.
- **Refresh Controls**: Every data-fetching page includes a manual refresh button with a spinning animation to indicate ongoing requests.

## Reliability

- **Loading States**: Every page displays a centered `Loader2` animation spinner during data fetching, preventing user interaction with stale or empty UIs.
- **Empty States**: All tables and lists display a descriptive empty-state message when no data is available, distinguishing between "no data" and "error" conditions.
- **Error Recovery**: Error banners include "Retry" buttons that re-trigger the fetch function, allowing users to recover from transient API failures.
- **Parallel Fetch Resilience**: Dashboard and Financials pages use `Promise.allSettled` to handle partial failures gracefully — one failing endpoint does not break the entire page.

## Localization

- **Bi-directional Support**: Full English (LTR) and Arabic (RTL) support with automatic `dir` attribute management via `LanguageProvider`.
- **Dictionary Parity**: `en.json` and `ar.json` maintain 1:1 key parity across 100+ translation keys covering all 6 portal modules.
- **CSS Logical Properties**: All layout spacing uses logical properties (`me-`, `ms-`, `ps-`, `pe-`, `start`, `end`) instead of physical (`ml-`, `mr-`, `pl-`, `pr-`, `left`, `right`) to ensure correct RTL behavior.
- **Fallback Strategy**: If an Arabic translation key is missing, the system falls back to the English value, preventing empty UI elements.
- **Persistent Preference**: Language selection is stored in `localStorage` and restored on subsequent visits.

## Pagination Strategy

- **Current Implementation**: Order and inventory lists fetch all accessible records in a single API call. Client-side filtering provides search functionality.
- **Backend Readiness**: Portal controllers are structured to accept `skip` and `take` query parameters for server-side pagination when data volumes require it.
- **Growth Path**: For tenants with >500 orders, server-side pagination with cursor-based navigation should be enabled by adding `@Query('page')` and `@Query('limit')` parameters to portal controllers.

## API Error Logging

- **Request Interceptor**: Attaches JWT token and logs outbound request metadata.
- **Response Interceptor**: Captures error responses and creates structured log entries with:
  - `path`: The API endpoint that failed
  - `message`: The server's error message or fallback
  - `status`: HTTP status code
- **Security**: No sensitive data (tokens, passwords) is included in error logs.
