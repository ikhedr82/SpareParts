# Antigravity Commerce Platform — Access Credentials

## 🌐 Platform URLs

| Platform | URL | Description |
| :--- | :--- | :--- |
| **Admin Portal** | `http://localhost:3004` | System administration & tenant management |
| **Tenant Portal** | `http://localhost:3003/tenant` | Branch operations, inventory, orders |
| **Platform Portal** | `http://localhost:3003/platform` | Super Admin / System-wide dashboard |
| **Branch/POS Portal** | `http://localhost:3003/branch` | POS and branch-specific operations |
| **API Base** | `http://localhost:3000` | Backend REST API |

---

## 👤 User Accounts

> **Password for all accounts: `Password123!`**

### Super Admin

| Email | Role | Scope |
| :--- | :--- | :--- |
| `admin@aljazeera.com` | Super Admin | Full system access |

### Branch Managers

| Email | Role | Branch |
| :--- | :--- | :--- |
| `warehouse.mgr@aljazeera.com` | Branch Manager | Central Warehouse |
| `downtown.mgr@aljazeera.com` | Branch Manager | Downtown Retail |
| `industrial.mgr@aljazeera.com` | Branch Manager | Industrial District |

### Warehouse Staff

| Email | Role | Branch |
| :--- | :--- | :--- |
| `picker1@aljazeera.com` | Warehouse Staff | Central Warehouse |
| `picker2@aljazeera.com` | Warehouse Staff | Central Warehouse |

### POS Cashiers

| Email | Role | Branch |
| :--- | :--- | :--- |
| `cashier1@aljazeera.com` | POS User | Downtown Retail |
| `cashier2@aljazeera.com` | POS User | Industrial District |

### Drivers

| Email | Role | Branch |
| :--- | :--- | :--- |
| `driver1@aljazeera.com` | Driver | Downtown Retail |
| `driver2@aljazeera.com` | Driver | Downtown Retail |
| `driver3@aljazeera.com` | Driver | Industrial District |
| `driver4@aljazeera.com` | Driver | Industrial District |

### Finance

| Email | Role | Scope |
| :--- | :--- | :--- |
| `finance@aljazeera.com` | Finance User | Tenant-wide |

---

## 🏢 Tenant Details

| Field | Value |
| :--- | :--- |
| **Name** | Al Jazeera Auto Parts |
| **Subdomain** | `aljazeera` |
| **Plan** | Enterprise |
| **Default Language** | Arabic (AR) |
| **Supported Languages** | English, Arabic |

---

## 🏬 Branches

| Branch | Type | Address |
| :--- | :--- | :--- |
| **Central Warehouse** | Warehouse | 15 Industrial Zone, 6th of October City, Giza |
| **Downtown Retail** | Retail | 42 Ahmed Orabi St, Mohandessin, Giza |
| **Industrial District** | Retail | 8 El-Nasr Rd, Heliopolis, Cairo |

---

## 🔐 Role Permissions Summary

| Role | Key Permissions |
| :--- | :--- |
| **Super Admin** | All permissions (30+) |
| **Branch Manager** | Branch mgmt, sales, inventory, orders, trips, returns |
| **Warehouse Staff** | Inventory, picklists, packs, scanning |
| **POS User** | Sales, void, cash sessions, view inventory |
| **Driver** | Drive trips, view trips & orders |
| **Finance User** | Invoices, journal entries, reports, accounting |

---

## 🗄️ Database

| Field | Value |
| :--- | :--- |
| **Provider** | PostgreSQL |
| **Host** | `localhost:5432` |
| **Database** | `partstack` |
| **User** | `postgres` |
