# Landing Portal — API Reference

## Authentication
The Landing Portal primarily uses public (unauthenticated) endpoints. The onboarding/signup flow creates a new tenant and user.

## Endpoint Groups

### CMS Content (Public)
- `GET /public-info/cms/hero` — Hero section content.
- `GET /public-info/cms/features` — Features section content.
- `GET /public-info/cms/testimonials` — Testimonials.
- `GET /public-info/cms/faqs` — FAQ items.
- `GET /public-info/cms/pricing` — Pricing section visibility and text.

### Plans (Public)
- `GET /public-info/plans` — Active subscription plans for display.

### Onboarding
- `POST /onboarding/register` — Register a new tenant.
  - Creates: Tenant, Admin User, Default Branch, Subscription (TRIAL).

### Legal
- `GET /public-info/terms` — Terms & Conditions content.
- `GET /public-info/privacy` — Privacy Policy content.

> **Note**: For full request/response schemas, refer to the Swagger UI at `/api/docs`.
