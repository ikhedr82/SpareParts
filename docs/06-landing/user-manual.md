# Landing Portal — User Manual

## Overview
The Landing Portal is the first touchpoint for prospective Partivo customers. No login is required to view the site.

---

## Screen: Main Landing Page
**Purpose**: Showcase the Partivo platform and convert visitors into subscribers.

### Hero Section
| Element | Description |
|---|---|
| Headline | Dynamic main message (EN/AR, CMS-managed) |
| Subheadline | Supporting text |
| CTA Button | "Get Started" — navigates to signup |

### Features Section
| Element | Description |
|---|---|
| Feature Cards | Grid of platform capabilities |
| Each Card | Icon + Title + Description |
| Visibility | Only displayed if CMS features are defined |

### Pricing Section
| Element | Description |
|---|---|
| Plan Cards | One card per active plan |
| Each Card | Plan name, price, billing cycle, feature list |
| CTA | "Subscribe" — navigates to signup with plan pre-selected |
| Visibility | **Hidden entirely** if no active plans exist |

### Testimonials Section
| Element | Description |
|---|---|
| Quote Cards | Customer testimonials |
| Visibility | Hidden if no testimonials configured |

### FAQ Section
| Element | Description |
|---|---|
| Accordion Items | Expandable question/answer pairs |
| Behavior | Click question to expand answer |
| Visibility | Hidden if no FAQs configured |

### Navigation Bar
| Link | Destination |
|---|---|
| Home | Scroll to top |
| Features | Scroll to features section |
| Pricing | Scroll to pricing section |
| About | Scroll to about section |
| Login | Navigate to `/login` |
| Get Started | Navigate to `/signup` |
| 🌐 Language Toggle | Switch between English and Arabic |

---

## Screen: Sign Up / Onboarding (`/signup/`)
**Purpose**: Self-serve tenant registration.

### Form Fields
| Field | Type | Validation | Description |
|---|---|---|---|
| Business Name | Text | Required | The retailer's company name |
| Email | Email | Required, unique | Admin user email |
| Phone | Phone | Required | Contact phone number |
| Password | Password | Required, min 8 chars | Admin account password |
| Selected Plan | Pre-filled | From pricing CTA | Subscription plan |

### Buttons
| Button | Action |
|---|---|
| **Create Account** | Submits registration; creates tenant, user, and trial subscription |
| **Back to Home** | Returns to landing page |

### Success State
*"Welcome to Partivo! Your account has been created. You can now log in to your admin portal."*

### Error States
- Email taken: *"An account with this email already exists."*
- Missing fields: Inline validation messages per field.

---

## Screen: Terms & Conditions (`/terms/`)
**Purpose**: Legal terms for using the platform.
- No authentication required.
- Content is CMS-managed and rendered as formatted markdown/text.

---

## Screen: Privacy Policy (`/privacy/`)
**Purpose**: Data privacy information.
- No authentication required.
- Content is CMS-managed.

---

## Responsive Behavior
- On mobile devices, the navigation collapses into a hamburger menu.
- Feature and pricing cards stack vertically.
- Hero section adjusts the text size and CTA positioning.

## RTL Support
- When Arabic is selected, the entire page layout mirrors (right-to-left).
- Typography uses Arabic web fonts optimized to prevent line intersection issues.
