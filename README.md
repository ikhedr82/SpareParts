# 🚀 Partivo

**Multi-Tenant SaaS Platform for Spare Parts Commerce**

[![Platform](https://img.shields.io/badge/Platform-partivo.net-10B981?style=for-the-badge)](https://partivo.net)
[![License](https://img.shields.io/badge/License-Proprietary-0EA5E9?style=for-the-badge)]()

---

## Overview

Partivo is a full-stack, multi-tenant SaaS platform purpose-built for the spare parts industry. It provides end-to-end commerce capabilities — from procurement and inventory management to point-of-sale, delivery logistics, and customer self-service — all under one unified brand.

## Architecture

```
┌──────────────────────────────────────────────────┐
│                  partivo.net                      │
│          Public Marketing Website                 │
│         Self-Service Tenant Onboarding            │
└────────────────────┬─────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    ▼                ▼                ▼
┌────────┐    ┌──────────┐    ┌──────────┐
│Platform│    │  Tenant  │    │ Customer │
│ Admin  │    │  Admin   │    │  Portal  │
│ Portal │    │  Portal  │    │          │
└────────┘    └──────────┘    └──────────┘
                     │
         ┌───────────┼───────────┐
         │                       │
         ▼                       ▼
    ┌──────────┐          ┌──────────┐
    │  Driver  │          │   POS    │
    │   App    │          │   App    │
    │ (Mobile) │          │ (Mobile) │
    └──────────┘          └──────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | NestJS, Prisma ORM, PostgreSQL |
| **Frontend** | Next.js 14, React, Tailwind CSS |
| **Mobile** | React Native, Expo |
| **Auth** | JWT, SecureStore, RBAC |
| **i18n** | EN/AR with full RTL support |

## Portals & Apps

| Application | Description | Path |
|---|---|---|
| **Platform Admin** | Super-admin portal for tenant management, subscriptions, system health | `/frontend/app/platform/` |
| **Tenant Admin** | Business owner portal for products, orders, users, warehouse, finances | `/frontend/app/tenant/` |
| **Customer Portal** | B2B customer-facing portal for procurement, quotes, and order tracking | `/admin-panel/` |
| **Public Website** | Marketing landing page with features, pricing, and self-service signup | `/frontend/app/(public)/` |
| **Driver App** | Mobile logistics app for delivery management and proof-of-delivery | `/mobile-app/src/screens/driver/` |
| **POS App** | Mobile retail point-of-sale with barcode scanning, cart, and checkout | `/mobile-app/src/screens/pos/` |

## Repository Structure

```
partivo/
├── src/                   # NestJS backend (modules, services, controllers)
├── prisma/                # Database schema & migrations
├── frontend/              # Next.js web application (all web portals)
│   ├── app/
│   │   ├── (public)/      # Landing website + onboarding
│   │   ├── platform/      # Platform admin portal
│   │   ├── tenant/        # Tenant admin portal
│   │   └── login/         # Shared auth
│   ├── components/        # Shared UI components
│   └── locales/           # EN/AR translations
├── admin-panel/           # Customer portal (Next.js)
├── mobile-app/            # React Native / Expo
│   └── src/
│       ├── screens/
│       │   ├── driver/    # Driver app screens
│       │   ├── pos/       # POS app screens
│       │   └── warehouse/ # Warehouse screens
│       ├── services/      # API client, auth
│       ├── i18n/          # Mobile localization
│       └── locales/       # Mobile EN/AR
├── config/                # Global configuration (brand.ts)
├── public/brand/          # Brand assets (SVG logos, icons)
├── docs/                  # Full project documentation
└── scripts/               # Utility scripts
```

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 14
- **npm** >= 9

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/partivo.git
cd partivo

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install customer portal dependencies
cd admin-panel && npm install && cd ..

# Install mobile app dependencies
cd mobile-app && npm install && cd ..
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/partivo

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=86400

# App
PORT=3000
NODE_ENV=development
```

### Running Locally

```bash
# Backend (NestJS)
npm run start:dev

# Frontend (Next.js) — new terminal
cd frontend
npm run dev

# Customer Portal — new terminal
cd admin-panel
npm run dev

# Mobile App — new terminal
cd mobile-app
npx expo start
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed demo data
npx ts-node src/prisma/demo-seed.ts
```

## Localization

All applications support **English** and **Arabic** with full RTL layout:

- **Web**: `/frontend/locales/en.json` and `/frontend/locales/ar.json`
- **Mobile**: `/mobile-app/src/locales/en.json` and `/mobile-app/src/locales/ar.json`

## Brand

Partivo uses a centralized brand system:

- **Config**: `/config/brand.ts` (web), `/mobile-app/src/config/brand.ts` (mobile)
- **Assets**: `/public/brand/` (logos, icons, favicon)
- **Docs**: `/docs/brand-system.md`

## Documentation

See full documentation index at [`docs/README.md`](docs/README.md).

---

**© 2026 Partivo Commerce Platform — partivo.net**
