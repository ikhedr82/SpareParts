# Customer Portal — Technical Specification

## Technology Stack
- **Framework**: Next.js (App Directory) — shares the `/frontend/` codebase with Tenant Admin.
- **Styling**: Tailwind CSS.
- **Language**: TypeScript.
- **Auth**: JWT-based; user is authenticated as a `BusinessClientContact`.
- **API Communication**: Axios.

## Project Structure
The Customer Portal is served from the `/frontend/app/branch/` and `/(public)/` routes:

```
frontend/app/
├── (public)/               # Public-facing pages (no auth required)
│   ├── layout.tsx          # Public layout with branding
│   ├── page.tsx            # Public landing page
│   ├── signup/             # Self-serve registration
│   ├── terms/              # Terms & conditions
│   └── privacy/            # Privacy policy
├── branch/                 # Authenticated commerce routes
│   └── [tenant routing]    # Catalog, cart, orders
└── login/                  # Shared login page
```

## Authentication Flow
1. Business client contact logs in or registers via the public signup form.
2. Backend issues JWT with `businessClientId` and `tenantId` in claims.
3. Frontend middleware validates the JWT and routes to the appropriate tenant context.
4. All API calls are scoped to the authenticated tenant and business client.

## SEO
- **Server-Side Rendering**: Product pages and public content are rendered on the server for search engine indexing.
- **Meta Tags**: Dynamic `<title>` and `<meta description>` per page.
- **Semantic HTML**: Proper heading hierarchy (`<h1>` for page title, `<h2>` for sections).

## Localization
- Full Arabic (RTL) and English (LTR) support.
- Language is detected from browser preferences or user selection.
- All UI text is loaded from `locales/en.json` and `locales/ar.json`.
