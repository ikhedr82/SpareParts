# Tenant Admin Portal — Technical Specification

## Technology Stack
- **Framework**: Next.js (App Directory) at `/frontend/`.
- **Styling**: Tailwind CSS with custom design tokens.
- **Language**: TypeScript.
- **Auth**: JWT-based; user must have a valid `tenantId` in JWT claims.
- **API Communication**: Axios with JWT interceptor for auto-refresh.

## Project Structure
```
frontend/
├── app/
│   ├── tenant/                 # Tenant admin routes
│   │   ├── page.tsx           # Dashboard
│   │   ├── inventory/         # Inventory management
│   │   ├── sales/             # Sales management
│   │   ├── customers/         # Customer management
│   │   ├── billing/           # B2B client & price management
│   │   ├── quotes/            # Quotes & orders
│   │   ├── purchase-orders/   # Procurement
│   │   ├── warehouse/         # Pick/Pack operations
│   │   ├── logistics/         # Delivery management
│   │   ├── returns/           # Returns & refunds
│   │   ├── finance/           # Accounting module
│   │   ├── analytics/         # Business intelligence
│   │   ├── users/             # User management
│   │   ├── branches/          # Branch management
│   │   └── suppliers/         # Supplier management
│   ├── layout.tsx             # Root layout
│   └── login/                 # Login page
├── components/                # Shared UI components
├── hooks/                     # Custom React hooks
├── lib/                       # API clients, utilities
├── locales/                   # i18n (en.json, ar.json)
├── middleware.ts              # Auth & routing middleware
└── types/                     # TypeScript type definitions
```

## Routing & Navigation
- File-system based routing via Next.js App Directory.
- Sidebar navigation component with collapsible sections.
- Breadcrumb navigation for deep pages.

## Data Fetching Patterns
- **Client-side**: Used for interactive data tables with filtering, sorting, and pagination.
- **Server Components**: Used for initial page rendering where SEO is not critical but initial load speed matters.
- **Optimistic Updates**: Applied to cart operations and quick actions.

## Key Components
- **DataTable**: Reusable data grid with sorting, filtering, and pagination.
- **FormModal**: Standardized modal for create/edit operations.
- **StatusBadge**: Consistent status display across all modules.
- **ConfirmDialog**: Destructive action confirmation.

## Middleware
`middleware.ts` handles:
1. JWT validation on every request.
2. Redirect unauthenticated users to `/login`.
3. Route access control based on user type (platform vs. tenant).
4. Language detection and cookie management.
