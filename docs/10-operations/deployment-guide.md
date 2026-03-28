# Deployment Guide

## Overview
This guide covers deploying the Partivo stack: NestJS backend, Next.js web portals, and React Native mobile apps.

## Prerequisites
- Node.js ≥ 18.x
- PostgreSQL ≥ 14.x
- npm or yarn

## Backend (NestJS)

### 1. Environment Variables
Create a `.env` file at the project root:
```env
DATABASE_URL=postgresql://user:password@host:5432/partivo
JWT_SECRET=your-secure-jwt-secret
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 2. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed initial data (plans, currencies, permissions)
npx ts-node src/prisma/seed-cms.ts
```

### 3. Build & Run
```bash
# Build
npm run build

# Start production server
npm run start:prod
```

### 4. Health Check
Verify: `GET /platform-admin/health` should return `200 OK`.

## Frontend (Next.js Portals)

### Tenant Admin / Customer Portal (`/frontend/`)
```bash
cd frontend
npm install
npm run build
npm run start
```

### Platform Admin (`/admin-panel/`)
```bash
cd admin-panel
npm install
npm run build
npm run start
```

### Environment
```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=https://api.partivo.com
```

## Mobile Apps (`/mobile-app/`)
```bash
cd mobile-app
npm install

# Development
npx expo start

# Production build
npx expo build:android
npx expo build:ios
```

## Production Checklist
- [ ] Database migrations applied
- [ ] Seed data loaded (currencies, permissions, plans)
- [ ] SSL/TLS configured for all endpoints
- [ ] JWT_SECRET is strong and unique
- [ ] CORS configured for frontend domains
- [ ] Stripe/Paymob webhook endpoints registered
- [ ] Backup strategy in place
- [ ] Monitoring configured
