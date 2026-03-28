# CRM Functional Specification

## Overview
The Partivo CRM is an enterprise-grade B2B customer relationship management module tightly integrated with the core ERP systems (Inventory, Finance, Orders). It provides a unified view of customers, sales pipelines, and credit management.

## Key Entities
- **Lead**: Initial contact or business prospect.
- **Opportunity**: Qualified sales prospect with prospective value.
- **Deal**: Closed sales contract.
- **Activity**: Interactions like calls, meetings, emails, and follow-ups.
- **Note**: Internal chronological log of observations.
- **CreditAccount**: Advanced credit management entity linked to Business Clients.

## Core Features

### 1. Customer 360 View
A comprehensive dashboard for each business client that aggregates:
- **Profile**: Basic contact and business information.
- **Segmentation**: Automated classification (VIP, Active, Risky, Inactive).
- **Risk Level**: Real-time risk assessment based on credit usage (LOW to CRITICAL).
- **Financial History**: Recent orders, invoices, and payments.
- **Timeline**: Integrated chronological log of all CRM activities and notes.

### 2. Sales Pipeline (Kanban)
A visual funnel for managing opportunities through stages:
- **Stages**: LEAD → QUALIFIED → PROPOSAL → WON → LOST.
- **Metrics**: Total stage value and opportunity count.

### 3. Credit Management
Automated credit control integrated with the ordering flow:
- **Credit Limits**: Managed per client.
- **Status Control**: Accounts can be set to ACTIVE, ON_HOLD, or BLOCKED.
- **Automated Blocking**: The system automatically blocks new orders if:
    - The client's status is BLOCKED.
    - The order total exceeds the available credit.

### 4. Activity Management
Unified log of all client interactions with due dates and completion status.
