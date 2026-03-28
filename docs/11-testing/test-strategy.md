# Testing Strategy

## Overview
Partivo's testing strategy covers unit, integration, and end-to-end (E2E) testing across the backend, frontend portals, and mobile applications.

## Testing Layers

### 1. Unit Tests
- **Backend**: Test individual NestJS service methods in isolation.
  - Mock Prisma client and external services.
  - Focus on business logic: pricing calculations, stock adjustments, billing lifecycle transitions.
- **Frontend**: Test React components with React Testing Library.
  - Focus on component rendering, user interactions, and state management.

### 2. Integration Tests
- **Backend**: Test controller + service + database interactions.
  - Use a test PostgreSQL database.
  - Test API endpoint request/response contracts.
  - Verify tenant isolation.
- **Mobile**: Test navigation flows and screen transitions.

### 3. End-to-End Tests
- Full workflow simulations.
- Test critical paths:
  - Tenant onboarding → first sale → Z-report.
  - Order creation → pick → pack → dispatch → delivery → proof.
  - Offline POS sale → sync → server persistence.

### 4. Production Simulation Tests
Located in `src/tests-production/`:
- **Offline Sync Simulation**: Tests the complete offline sync lifecycle with batch uploads, idempotency, and conflict resolution.
- Validates real-world scenarios like network drops during sync.

## Test Tools
| Tool | Purpose |
|---|---|
| Jest | Unit and integration test runner |
| Supertest | HTTP integration testing for NestJS |
| React Testing Library | Frontend component testing |
| Prisma Test Utils | Database seeding and cleanup |

## Coverage Goals
| Area | Target |
|---|---|
| Backend Services | ≥ 80% line coverage |
| Critical Business Logic | 100% branch coverage |
| API Endpoints | 100% of documented endpoints |
| Frontend Components | ≥ 70% coverage |

## Test Execution
```bash
# Backend unit & integration tests
npm run test

# Backend E2E tests
npm run test:e2e

# Frontend tests
cd frontend && npm run test

# Run with coverage
npm run test -- --coverage
```
