Car Spare Parts Retail SaaS Platform

1. Architecture Style

We use a modular SaaS architecture:

[ React Web ]       [ React Native ]
        ↓                    ↓
              [ API Gateway ]
                    ↓
             [ NestJS Services ]
                    ↓
  Postgres   OpenSearch   RabbitMQ   Stripe

Everything is:

API-first

Multi-tenant

Cloud-native

1. Backend — Node.js + NestJS

NestJS is used because:

It enforces architecture

It supports modularization

It scales to microservices

It works perfectly with RabbitMQ

Core modules
/auth
/tenants
/users
/branches
/catalog
/inventory
/sales
/purchases
/billing
/public

Each module owns:

Controllers

Services

Repositories

DTOs

1. Database — PostgreSQL

Postgres is the source of truth.

Used for:

Tenants

Inventory

Sales

Subscriptions

Fitment

Transactions

Critical design rules

Every business table has tenant_id

Global catalog tables do NOT

Foreign keys enforce data integrity

UUIDs for public entities

This supports:

Data isolation

Security

Scaling

1. Search — OpenSearch

OpenSearch is your catalog engine.

It indexes:

Products

Part numbers

Brands

Vehicle fitment

Used for:

POS search

Public site search

Internal discovery

Postgres stores data
OpenSearch finds it fast.

1. Messaging — RabbitMQ

RabbitMQ handles everything asynchronous:

Inventory updates

Search indexing

Sale events

Analytics

Email & notifications

This keeps:

POS fast

APIs responsive

Data consistent

1. Authentication — JWT

JWT contains:

tenant_id
user_id
roles
branch_id (optional)

This enables:

Secure multi-tenancy

Branch-level control

API scalability

No session storage needed.

1. Payments — Stripe

Stripe handles:

Trials

Subscriptions

Invoices

Failed payments

Cancellations

Your system just:

Creates customers

Syncs subscription status

Enforces plan limits

You never store card data.

1. Frontend — React

Used for:

SaaS Admin

Retailer Admin

POS

Reporting

Key features:

Role-based screens

Real-time inventory

Fast search

Offline POS mode (later)

1. Mobile — React Native

Used for:

Barcode scanning

Stock checking

Quick sales

Mobile is a tool, not the core system.

1. Deployment

Use:

Docker

Nginx

CI/CD (GitHub Actions)

Recommended:

Backend → containers

DB → managed Postgres

OpenSearch → managed cluster

1. Environments

You must have:

DEV
STAGING
PRODUCTION

Never test on production data.
