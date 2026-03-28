# Platform Admin Portal — Technical Specification

## Technology Stack
- **Framework**: Next.js (App Directory).
- **Styling**: Tailwind CSS.
- **Language**: TypeScript.
- **Auth**: JWT-based authentication; users must have `isPlatformUser = true`.
- **API Communication**: Fetch/Axios calling the NestJS backend.

## Project Structure
Located at: `/admin-panel/`

```
admin-panel/
├── app/
│   ├── layout.tsx          # Root layout with sidebar navigation
│   ├── page.tsx            # Dashboard page
│   ├── crm/               # CRM views
│   ├── financials/         # Financial management
│   ├── inventory/          # Global catalog inventory views
│   ├── logistics/          # Logistics management
│   ├── pricing/            # Plan pricing configuration
│   ├── procurement/        # Procurement management
│   └── substitutions/      # Product substitution management
├── components/             # Reusable UI components
├── lib/                    # Utility functions and API clients
└── locales/                # i18n translation files (en.json, ar.json)
```

## Authentication Flow
1. Platform admin logs in at the shared `/login` page.
2. Backend verifies credentials and returns JWT with `isPlatformUser: true`.
3. Frontend middleware checks the JWT claim and redirects non-platform users.
4. All API calls include `Authorization: Bearer <token>`.

## State Management
- Local component state via React hooks.
- No global state management library; each page fetches its own data.

## Localization
- Full Arabic (RTL) support via i18n JSON translation files.
- Language toggle available in the UI.
- Tailwind's `rtl:` variant handles directional layout changes.
