# Customer Portal — User Manual

## Getting Started
1. Navigate to the tenant's Customer Portal URL (e.g., `https://acme-parts.partivo.com`).
2. If you are a new customer, click **Sign Up** to register.
3. If you have an account, click **Login** and enter your credentials.

---

## Screen: Public Landing Page
**Purpose**: Introduction to the tenant's business and catalog.

### Elements
| Element | Description |
|---|---|
| Business Name | Tenant's company name prominently displayed |
| Tagline | Brief business description |
| Call to Action | "Browse Our Catalog" or "Sign Up" buttons |
| Contact Info | Phone, email, address |

### Buttons
| Button | Action |
|---|---|
| **Browse Catalog** | Navigates to product search (login not required for browsing) |
| **Sign Up** | Navigates to registration form |
| **Login** | Navigates to login page |

---

## Screen: Registration (`/signup/`)
**Purpose**: Self-serve account creation for new business clients.

### Form Fields
| Field | Type | Validation | Description |
|---|---|---|---|
| Business Name | Text | Required | Company/workshop name |
| Business Type | Dropdown | Required | WORKSHOP or RETAILER |
| Email | Email | Required, unique | Primary contact email |
| Phone | Phone | Required | Contact phone |
| Password | Password | Required, min 8 chars | Account password |
| Confirm Password | Password | Must match password | Verification |

### Buttons
| Button | Action |
|---|---|
| **Register** | Submits registration; creates BusinessClient + user account |
| **Back to Login** | Returns to login page |

### Success State
*"Registration successful! You can now log in to browse our catalog and place orders."*

### Error States
- Email already exists: *"An account with this email already exists."*
- Validation errors: Inline field-level error messages.

---

## Screen: Product Catalog
**Purpose**: Browse and search the tenant's product inventory.

### Search Methods
| Method | Description |
|---|---|
| **Text Search** | Search by product name, part number, or barcode |
| **Category Browse** | Navigate hierarchical category tree |
| **Vehicle Fitment** | Select Make → Model → Year → View compatible parts |

### Product Card
| Element | Description |
|---|---|
| Product Image | Product photo (or placeholder) |
| Name | Product name (localized) |
| Brand | Manufacturer brand |
| Price | Client-specific price (or list price for guests) |
| Availability | In Stock / Out of Stock indicator |
| **Add to Cart** button | Adds 1 unit to cart (authenticated users only) |

### Vehicle Fitment Search
| Step | Field | Source |
|---|---|---|
| 1 | Vehicle Make | Dropdown from `VehicleMake` |
| 2 | Vehicle Model | Dropdown filtered by make |
| 3 | Year | Range from model's `yearStart` to `yearEnd` |
| 4 | Results | Products linked via `ProductFitment` |

### Empty State
*"No products match your search. Try different search terms or browse by category."*

---

## Screen: Product Detail
**Purpose**: View full product information.

### Fields
| Field | Description |
|---|---|
| Name | Product name (EN/AR) |
| Brand | Manufacturer |
| Category | Product category |
| Description | Product description (EN/AR) |
| Part Number | Primary and alternate part numbers |
| Vehicle Fitment | List of compatible vehicles |
| Price | Client-specific or list price |
| Availability | Stock quantity at nearest branch |

### Actions
| Button | Action | Condition |
|---|---|---|
| **Add to Cart** | Adds to cart with quantity selector | User must be logged in |
| **Back to Results** | Returns to search results | Always visible |

---

## Screen: Shopping Cart
**Purpose**: Review selected items before checkout.

### Cart Table
| Column | Description |
|---|---|
| Product | Name and image |
| Unit Price | Price per unit |
| Quantity | Editable quantity input |
| Line Total | Unit Price × Quantity |

### Summary
| Field | Description |
|---|---|
| Subtotal | Sum of line totals |
| Tax | Calculated VAT |
| Total | Subtotal + Tax |

### Actions
| Button | Action |
|---|---|
| **Update Quantity** | Saves new quantity (inline) |
| **Remove** | Removes item from cart |
| **Proceed to Checkout** | Navigates to checkout |
| **Continue Shopping** | Returns to catalog |

### Empty State
*"Your cart is empty. Browse our catalog to add products."*

---

## Screen: Checkout
**Purpose**: Finalize and place the order.

### Form Fields
| Field | Type | Validation | Description |
|---|---|---|---|
| Delivery Address | Dropdown | Required | Select from saved addresses |
| Contact Person | Dropdown | Optional | Select from saved contacts |
| Notes | Textarea | Optional | Special instructions |

### Order Summary
Displays all cart items, subtotal, tax, and total.

### Buttons
| Button | Action |
|---|---|
| **Place Order** | Submits order (status: PENDING) |
| **Back to Cart** | Returns to cart for changes |

### Success State
*"Your order has been placed successfully! Order #ORD-2024-0042. You will be notified when it is confirmed."*

### Error States
- Credit limit exceeded: *"This order exceeds your credit limit. Please contact the sales team."*
- Product out of stock: *"Some items are no longer available. Please review your cart."*

---

## Screen: Order History
**Purpose**: Track past and current orders.

### Order List Table
| Column | Description |
|---|---|
| Order # | Order number |
| Date | Placed date |
| Items | Count of line items |
| Total | Order total |
| Status | Badge: PENDING, CONFIRMED, PROCESSING, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED |

### Order Detail
| Section | Content |
|---|---|
| Line Items | Product, quantity, unit price, line total |
| Delivery Address | Selected delivery address |
| Status Timeline | Chronological status progression with timestamps |
| Notes | Any special instructions |

### Empty State
*"You haven't placed any orders yet. Browse our catalog to get started."*

---

## Screen: Legal Pages
**Purpose**: Terms & Conditions and Privacy Policy.

### Behavior
- Publicly accessible — no login required.
- Content is managed via CMS by the Platform Admin.
- Visible in both EN and AR based on language selection.
