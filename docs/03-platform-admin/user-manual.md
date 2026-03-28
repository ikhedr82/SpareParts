# Platform Admin Portal — User Manual

## Getting Started
1. Navigate to the Platform Admin login page.
2. Enter your platform admin email and password.
3. Click **Login**. You will be redirected to the Platform Dashboard.

---

## Screen: Dashboard
**Purpose**: Provides a high-level overview of the entire Partivo platform.

### KPI Cards
| Card | Description | Data Source |
|---|---|---|
| Total Tenants | Count of all registered tenants | `tenants` table |
| Active Subscriptions | Subscriptions with status ACTIVE or TRIAL | `subscriptions` table |
| Monthly Recurring Revenue | Sum of active subscription plan prices | Calculated from plans × subscriptions |
| Total Products | Count of products in the global catalog | `products` table |

### Actions
- Click any KPI card to navigate to the corresponding management page.

### Empty State
If there are no tenants yet, the dashboard displays: *"No tenants registered yet. New tenants will appear here after onboarding."*

---

## Screen: Tenant Management
**Purpose**: View, search, and manage all registered tenants.

### Tenant List Table
| Column | Type | Description |
|---|---|---|
| Name | Text | Tenant business name |
| Subdomain | Text | Unique subdomain identifier |
| Status | Badge | ACTIVE (green), SUSPENDED (yellow), DELETED (red) |
| Plan | Text | Current subscription plan name |
| Created | Date | Registration date |

### Actions
| Button | Action | Effect |
|---|---|---|
| **View** | Opens tenant detail page | Navigates to `/platform/tenants/[id]` |
| **Suspend** | Suspends the tenant | Sets status to SUSPENDED; tenant users lose access |
| **Activate** | Reactivates a suspended tenant | Sets status to ACTIVE |
| **Delete** | Soft-deletes the tenant | Sets `deletedAt`; data retained but inaccessible |

### Search & Filter
- **Search**: By tenant name or subdomain.
- **Filter**: By status (Active, Suspended, All).

### Error States
- **API Error**: Red banner: *"Failed to load tenants. Please try again."*
- **No Results**: *"No tenants match your search criteria."*

---

## Screen: Plans Management
**Purpose**: Create and manage SaaS subscription plans.

### Plan Form Fields
| Field | Type | Validation | Description |
|---|---|---|---|
| Name | Text | Required, unique | Plan display name (English) |
| Name (Arabic) | Text | Optional | Arabic translation |
| Price | Decimal | Required, ≥ 0 | Monthly/yearly price |
| Currency | Dropdown | Required | USD, EGP, SAR, etc. |
| Billing Cycle | Dropdown | Required | MONTHLY or YEARLY |
| Is Active | Toggle | Default: true | Whether the plan is available |
| Features | JSON Editor | Optional | Feature flags as JSON |
| Limits | JSON Editor | Optional | Usage limits as JSON |

### Buttons
| Button | Action |
|---|---|
| **Save** | Creates or updates the plan |
| **Cancel** | Discards changes and returns to list |
| **Deactivate** | Sets `isActive` to false |

---

## Screen: Subscriptions
**Purpose**: Monitor and manage all tenant subscriptions.

### Subscription Table
| Column | Description |
|---|---|
| Tenant | Tenant name |
| Plan | Associated plan |
| Status | TRIAL, ACTIVE, PAST_DUE, CANCELLED, SUSPENDED, EXPIRED |
| Provider | STRIPE or PAYMOB |
| Start Date | Subscription start |
| Period End | Current billing period end |

### Actions
- **Change Plan**: Opens modal to upgrade/downgrade the subscription.
- **Cancel**: Initiates cancellation (can be set to cancel at period end).
- **Extend Trial**: Extends the trial end date.

### Role-Based Visibility
- Only Super Admins can modify subscriptions. Support Agents have read-only access.

---

## Screen: Currency Management
**Purpose**: Manage active currencies and exchange rates.

### Currency List
| Column | Description |
|---|---|
| Code | ISO currency code (e.g., USD) |
| Name | Full name (e.g., US Dollar) |
| Symbol | Display symbol (e.g., $) |
| Precision | Decimal places |
| Active | Toggle status |

### Exchange Rate Form
| Field | Type | Description |
|---|---|---|
| From Currency | Dropdown | Source currency |
| To Currency | Dropdown | Target currency |
| Rate | Decimal | Conversion rate |
| Source | Text | Rate data source (Manual, API) |

---

## Screen: Audit Logs
**Purpose**: Review all administrative actions for compliance.

### Log Table
| Column | Description |
|---|---|
| Timestamp | When the action occurred |
| User | Who performed the action |
| Action | CREATE, UPDATE, DELETE |
| Entity Type | What was changed (Tenant, Plan, etc.) |
| Entity ID | Specific record identifier |
| IP Address | Origin IP |

### Search & Filter
- Filter by: Date range, User, Entity Type, Action.
- Logs are read-only and immutable.

---

## Screen: CMS Management
**Purpose**: Manage content displayed on the Landing Portal.

### Sections
- **Hero**: Main headline and subheadline (EN/AR).
- **Features**: Feature cards with icons and descriptions.
- **Testimonials**: Customer quotes.
- **FAQs**: Question/Answer pairs.
- **Pricing**: Controls whether pricing is displayed publicly.

### Workflow
1. Select a CMS section from the sidebar.
2. Edit the content in the form fields.
3. Click **Save** to publish changes immediately to the Landing Portal.

---

## Screen: System Health
**Purpose**: Monitor backend system status.

### Health Indicators
| Indicator | Status Values |
|---|---|
| API Server | ✅ Healthy / ❌ Down |
| Database | ✅ Connected / ❌ Disconnected |

### Error State
If the health endpoint fails: *"Unable to reach the system health endpoint. The backend may be offline."*
