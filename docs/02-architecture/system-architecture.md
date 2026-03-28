# System Architecture

## Core Architectural Paradigm
Partivo is a vertical, multi-tenant B2B2C Software as a Service (SaaS). The system employs a modular monolith backend architecture communicating with independent frontend applications via REST APIs and WebSockets.

## Technology Stack
- **Backend**: Node.js, NestJS framework, TypeScript.
- **Database**: PostgreSQL (Relational), Prisma ORM.
- **Frontend (Web Portals)**: React, Next.js, Tailwind CSS.
- **Mobile Apps (POS & Driver)**: React Native, Expo, SQLite (for offline capabilities).
- **Deployment & Infra**: Cloud-native (Dockerized), CI/CD pipelines.

## High-Level Topology
The system is divided into three distinct execution environments: Cloud Services, Edge Web Portals, and Edge Mobile Devices.

```mermaid
graph TD
    subgraph Edge Web
        Landing[Landing Portal (Next.js)]
        PlatformAdmin[Platform Admin (Next.js)]
        TenantAdmin[Tenant Admin (Next.js)]
        CustomerPortal[Customer Portal (Next.js)]
    end

    subgraph Edge Mobile
        POS[POS App (React Native + SQLite)]
        Driver[Driver App (React Native)]
    end

    subgraph Cloud Infrastructure
        API[NestJS API Gateway & Modules]
        DB[(PostgreSQL Database)]
        Cache[(Redis Cache / State)]
        Queue[BullMQ Background Jobs]
    end

    %% Web to API
    Landing -->|HTTPS REST| API
    PlatformAdmin -->|HTTPS REST / JWT| API
    TenantAdmin -->|HTTPS REST / JWT| API
    CustomerPortal -->|HTTPS REST / JWT| API

    %% Mobile to API
    POS <-->|REST + Sync Protocol| API
    Driver -->|REST / Geolocation| API

    %% Internal Cloud
    API -->|Prisma ORM| DB
    API -->|Cache Check| Cache
    API -->|Enqueue Jobs| Queue
```

## Data Isolation Strategy
Data is segregated via a strictly enforced column-based multi-tenancy model (`tenantId` column) within a single shared database schema. The Prisma Client has extensions and middleware to automatically inject the `tenantId` into all queries originating from an authenticated tenant context.
