# Driver App — Functional Specification

## EP-D01: Driver Authentication

### FT-D01.1: Driver Login
**US-D01.1.1**: As a driver, I want to log in with my email and password so that I can access my delivery assignments.
- **AC1**: Login form collects email and password
- **AC2**: JWT token is stored in secure storage after successful login
- **AC3**: Invalid credentials display localized error message
- **AC4**: Loading spinner appears during authentication
- **AC5**: Interface supports English and Arabic (RTL)

### FT-D01.2: Session Management
**US-D01.2.1**: As a driver, I want my session to persist across app restarts.
- **AC1**: Token is loaded from SecureStore on app launch
- **AC2**: Expired tokens trigger automatic logout with notification
- **AC3**: Logout clears all stored credentials

---

## EP-D02: Delivery Dashboard

### FT-D02.1: Delivery List
**US-D02.1.1**: As a driver, I want to see all my assigned deliveries so I can plan my route.
- **AC1**: Deliveries fetched from `GET /mobile/driver/trips`
- **AC2**: Each delivery shows customer name, address, item count, and status badge
- **AC3**: Status badges use color-coded indicators (Assigned=amber, In Transit=blue, Delivered=green)
- **AC4**: Pull-to-refresh updates the delivery list
- **AC5**: Empty state shown when no deliveries assigned

### FT-D02.2: Loading & Error States
**US-D02.2.1**: As a driver, I want clear feedback when data is loading or an error occurs.
- **AC1**: ActivityIndicator shown during initial load
- **AC2**: Error state with retry button on API failure
- **AC3**: Offline banner when no network

---

## EP-D03: Delivery Management

### FT-D03.1: Delivery Details
**US-D03.1.1**: As a driver, I want to view full delivery details including customer contact info.
- **AC1**: Shows customer name, address, phone (tappable to call), item count, and delivery notes
- **AC2**: Navigate button opens Google Maps / Apple Maps with deep link
- **AC3**: All text is localized and RTL-aware

### FT-D03.2: Delivery Status Workflow
**US-D03.2.1**: As a driver, I want to update delivery status through a defined workflow.
- **AC1**: Status flow: Assigned → Accepted → Picked Up → In Transit → Delivered
- **AC2**: Each transition calls `PATCH /mobile/driver/trips/:id/status`
- **AC3**: Primary action button updates dynamically based on current status
- **AC4**: Terminal states (Delivered, Cancelled, Failed) show completion banner

### FT-D03.3: Proof of Delivery
**US-D03.3.1**: As a driver, I must capture proof before marking delivery as complete.
- **AC1**: Photo capture button available during IN_TRANSIT status
- **AC2**: Signature capture button available during IN_TRANSIT status
- **AC3**: Optional delivery notes text input
- **AC4**: At least one proof type required before marking delivered

### FT-D03.4: Issue Reporting
**US-D03.4.1**: As a driver, I can report delivery issues.
- **AC1**: Issue categories: Customer Absent, Wrong Address, Damaged Goods, Access Denied
- **AC2**: Reporting sets delivery status to FAILED
- **AC3**: Issue details sent with status update API call

---

## EP-D04: Navigation Integration

### FT-D04.1: Maps Deep Link
**US-D04.1.1**: As a driver, I want to navigate to delivery addresses using my preferred maps app.
- **AC1**: iOS opens Apple Maps, Android opens Google Maps
- **AC2**: Fallback to Google Maps web URL if native app unavailable
- **AC3**: Address is URL-encoded for accurate geocoding
