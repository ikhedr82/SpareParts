# Partivo UI Component Library

The Partivo platform utilizes a custom-built, premium UI component library based on React, TailwindCSS, and Lucide icons. All components support RTL (Right-to-Left) mirroring and dark mode by default.

---

## 1. Core Elements — `components/ui`

### **Button** (`button.tsx`)
**Purpose**: Primary interaction element.
- **Variants**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`.
- **States**: Supports `disabled`, `loading`, and `hover` transitions.
- **RTL**: Automatically flips icon positions when used with icons.

### **Input** (`input.tsx`)
**Purpose**: Secure data entry.
- **Features**: Customizable focus rings, error states, and localization-ready placeholders.
- **RTL**: Text alignment and icon placements mirror automatically.

### **Label** (`label.tsx`)
**Purpose**: Contextual field identification.
- **Features**: Includes a `required` prop which automatically appends a red asterisk (`*`) and translates associated validation messages.

### **Badge** (`badge.tsx`)
**Purpose**: Status and metadata indicators.
- **Variants**: `default`, `secondary`, `destructive`, `outline`, `success`.
- **Usage**: Typically used for order statuses (`Paid`, `Pending`, `Void`).

### **Dialog** (`dialog.tsx`)
**Purpose**: High-context modal overlays.
- **Features**: Backdrop blur, smooth scale-in animations, and keyboard accessibility (ESC to close).

---

## 2. Layout Components — `components/`

### **KPI Card** (`kpi-card.tsx`)
**Purpose**: Analytical data visualization.
- **Properties**: `title`, `value`, `trend` (percentage), `icon`.
- **Design**: Utilizes glassmorphism (semi-transparent backgrounds with blur).

### **Language Switcher** (`language-switcher.tsx`)
**Purpose**: Global locale protocol management.
- **Features**: Seamless hot-swapping between English (LTR) and Arabic (RTL) without page reload.
- **Persistence**: Remembers user preference in `localStorage`.

### **Shell Layout** (`shell-layout.tsx`)
**Purpose**: The main administrative application frame.
- **Features**: Responsive sidebar, breadcrumb navigation, and user profile node.
- **RTL**: Sidebar moves from Left to Right when switching to Arabic.

### **Pagination** (`pagination.tsx`)
**Purpose**: Data navigation for large registries.
- **Features**: "Page X of Y" localization, previous/next controls with RTL-aware arrows.

---

## 3. Specialized Elements

### **Payment Modal** (`payment-modal.tsx`)
**Purpose**: POS-specific financial transaction handling.
- **Features**: Multi-currency support, card/cash selection, and change calculation.

### **Receipt Generator** (`receipt.tsx`)
**Purpose**: HTML-to-Print thermal receipt templates.
- **Features**: RTL support for Arabic receipts, QR code integration, and itemized ledger.

### **UI Harden** (`ui-harden.tsx`)
**Purpose**: Global aesthetic utility.
- **Features**: Ensures all transitions, shadows, and gradients follow the "Premium Partivo" design language.
