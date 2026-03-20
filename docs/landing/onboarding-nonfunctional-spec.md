# Self-Service Onboarding — Non-Functional Requirements

This document outlines the operational and quality standards for the self-service onboarding layer.

## Security

- **Password Hashing**: Passwords are hashed using bcrypt with a cost factor of 12 before storage.
- **Email Validation**: `class-validator` `@IsEmail()` decorator enforces valid email format.
- **Subdomain Validation**: RFC-compliant regex (`/^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/`) prevents injection and ensures DNS compatibility.
- **Duplicate Prevention**: Unique constraint checks on both `subdomain` (Tenant table) and `email` (User table) before creation.
- **No Auth Required**: The `/onboarding/*` endpoints are excluded from `TenantMiddleware` and `JwtAuthGuard` since they are public.
- **Input Sanitization**: All DTO fields use `class-validator` decorators for type, length, and format enforcement.

## Error Handling

- **Conflict Detection**: Duplicate subdomain/email returns HTTP 409 Conflict with a descriptive message.
- **Validation Errors**: Invalid input returns HTTP 400 Bad Request with field-level error details from `class-validator`.
- **Transaction Safety**: The entire signup flow runs in a Prisma `$transaction`. If any step fails, all changes are rolled back.
- **Error Logging**: Signup failures are logged via NestJS `Logger` with context (email, error) but without sensitive data (password).

## Performance

- **Single Transaction**: All 6 database operations (tenant, subscription, role, permissions, user, audit) execute in one atomic transaction.
- **Subdomain Check**: `GET /onboarding/check-subdomain` is a lightweight single-query endpoint optimized for real-time form validation.

## Observability

- **Audit Logging**: Every successful signup creates an `AuditLog` entry with action `SELF_SERVICE_SIGNUP` containing company name, subdomain, email, and plan.
- **Structured Logging**: `OnboardingService` uses NestJS `Logger` to emit structured messages for tenant creation and failures.

## Localization

- **Full EN/AR Support**: 80+ landing page locale keys with 1:1 parity between English and Arabic dictionaries.
- **RTL Landing Pages**: Public layout uses `dir` attribute from `LanguageProvider` for automatic RTL mirroring.
- **Tenant Language**: Signup form allows selecting preferred language (EN/AR), which becomes the tenant's `defaultLanguage`.

## Pagination Strategy

- **Not Applicable**: The onboarding flow does not involve list views or paginated data.

## API Error Logging

- **Request Validation**: class-validator pipes validate all fields before the service is invoked.
- **Transaction Errors**: Caught at the service level, logged with context, and re-thrown as generic `InternalServerErrorException`.
- **No Sensitive Data**: Passwords are never logged. Only email and subdomain appear in error context.
