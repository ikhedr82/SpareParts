# Tenant Admin Portal — Developer Guide & Architecture Reference

> Version: 1.0 | Status: Production | Last Updated: March 2026

---

## Project Structure

```
frontend/
├── app/
│   └── tenant/           ← All tenant portal pages (Next.js App Router)
│       ├── page.tsx          Dashboard
│       ├── layout.tsx        Tenant shell layout (nav, error boundary)
│       ├── branches/
│       ├── users/
│       ├── inventory/
│       ├── customers/
│       ├── suppliers/
│       ├── purchase-orders/
│       ├── returns/
│       ├── quotes/
│       ├── warehouse/
│       └── billing/
├── components/
│   ├── error-boundary.tsx    Global React ErrorBoundary
│   ├── shell-layout.tsx      Shared layout shell
│   ├── nav-item.tsx          Navigation item component
│   └── toast.tsx             Toast notification hook
├── lib/
│   ├── api.ts                Axios client with JWT interceptor + error logging
│   ├── auth.ts               Token helpers (getToken, removeToken)
│   └── i18n/
│       ├── LanguageContext.tsx   Language provider (RTL aware)
│       └── useTranslation.ts     Translation hook
└── locales/
    ├── en.json               English translations
    └── ar.json               Arabic translations (1:1 parity with en.json)
```

---

## API Client (`frontend/lib/api.ts`)

Centralized Axios instance used by **all** tenant pages:

```typescript
import apiClient from '@/lib/api';

// GET with query params
const { data } = await apiClient.get('/inventory', { params: { page, search } });

// POST
await apiClient.post('/users', { email, password, roles });

// PATCH
await apiClient.patch(`/customers/${id}`, patch);

// DELETE
await apiClient.delete(`/suppliers/${id}`);
```

**Interceptors:**
- **Request**: Attaches `Authorization: Bearer <token>` from cookies.
- **Response (error)**: Logs `[API Error] METHOD URL → HTTP STATUS: message`; on 401 clears token and redirects to `/login`.

---

## Localization Pattern

All pages must follow this pattern:

```tsx
'use client';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function MyPage() {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';

    return (
        <div className={`p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
            <h1>{t('module.title')}</h1>
            <button>{t('module.add')}</button>
        </div>
    );
}
```

**Adding new translations:**
1. Add the key to `frontend/locales/en.json`.
2. Add the **same key** with Arabic value to `frontend/locales/ar.json`.
3. Both files must always maintain 1:1 key parity.

---

## Backend API Reference (Key Tenant Endpoints)

All endpoints are prefixed with `/api/v1/` and require a valid JWT (`Authorization: Bearer <token>`).

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inventory` | Paginated inventory list (supports `page`, `limit`, `search`, `minStock`, `branchId`) |
| POST | `/inventory` | Create inventory item |
| PATCH | `/inventory/:id/adjust` | Adjust stock quantity (requires reason) |
| GET | `/customers` | List customers |
| POST | `/customers` | Create customer |
| PATCH | `/customers/:id` | Update customer |
| DELETE | `/customers/:id` | Delete customer |
| GET | `/suppliers` | List suppliers |
| POST | `/suppliers` | Create supplier |
| PATCH | `/suppliers/:id` | Update supplier |
| DELETE | `/suppliers/:id` | Delete supplier |
| GET | `/users` | List tenant users |
| POST | `/users` | Create user |
| GET | `/branches` | List branches |
| POST | `/branches` | Create branch |
| GET | `/purchase-orders` | List purchase orders |
| GET | `/purchase-returns` | List purchase returns |
| GET | `/sales-extensions/quotes` | List sales quotes |
| GET | `/warehouse/picklists` | List warehouse pick lists |
| GET | `/api/tenant/plan` | Get plan status + usage |
| GET | `/api/tenant/billing/history` | Payment history |
| POST | `/api/tenant/billing/create-checkout-session` | Initiate Stripe checkout |
| GET | `/api/tenant/billing/portal` | Open Stripe billing portal |

---

## Adding a New Tenant Page

1. Create `frontend/app/tenant/<feature>/page.tsx`.
2. Add `'use client'` directive.
3. Import `useLanguage` from `@/lib/i18n/LanguageContext`.
4. Import `apiClient` from `@/lib/api`.
5. Add locale keys to both `en.json` and `ar.json`.
6. Implement loading / empty / error states.
7. Wrap all text in `t('module.key')`.
8. Use `${isRTL ? 'rtl' : 'ltr'}` on the root div.
9. Register nav item in `frontend/app/tenant/layout.tsx`.

---

## Known Pre-existing Issues

| Issue | File | Severity |
|-------|------|----------|
| Missing `react-hot-toast` dependency | `package.json` | Medium — billing page imports `toast` from this |
| Missing `@radix-ui/react-switch` types | Any page using Switch | Low — type warnings only |
| Type error in `tailwind.config.ts` | Root config | Low — build succeeds |

These pre-existed before the hardening work and require separate dependency resolution.
