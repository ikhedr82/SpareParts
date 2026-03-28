# Driver App — Functional Specification

## Overview
The Driver App is a React Native mobile application used by delivery drivers. It enables them to manage assigned delivery trips, navigate through stops, capture proof of delivery, and report exceptions.

## User Role
- **Driver**: Authenticated as a `Driver` entity linked to a tenant and branch.

## Screens & Capabilities

### 1. Login (`DriverLoginScreen`)
- Email/password authentication.
- Restricted to users with driver role assignments.

### 2. Home (`DriverHomeScreen`)
- View list of assigned delivery trips.
- Trips grouped by status: Active (IN_TRANSIT, LOADING), Planned, Completed.
- Each trip card shows: Trip ID, Branch, Number of Stops, Number of Packs, Status.
- Pull-to-refresh for latest assignments.

### 3. Trip Detail (`TripDetailScreen`)
- Full trip information with stop-by-stop breakdown.
- Stop sequence with status indicators.
- For each stop: Customer/Supplier name, address, order reference, status.

#### Stop Actions
| Action | Effect |
|---|---|
| **Start Trip** | Changes trip status from PLANNED → LOADING → IN_TRANSIT |
| **Arrive** | Marks stop as ARRIVED, records arrival time |
| **Complete Delivery** | Marks stop as DELIVERED, prompts for proof of delivery |
| **Report Failure** | Marks stop as FAILED, prompts for exception details |

#### Proof of Delivery
| Field | Type | Description |
|---|---|---|
| Signer Name | Text | Name of person who received delivery |
| Signature | Canvas | Digital signature capture |
| Photo | Camera | Photo of delivered goods |
| Notes | Text | Additional delivery notes |
| GPS Location | Automatic | Captured coordinates at delivery time |

#### Delivery Exception Reporting
| Field | Type | Options |
|---|---|---|
| Exception Type | Dropdown | CUSTOMER_UNAVAILABLE, ADDRESS_INCORRECT, REFUSED_DELIVERY, DAMAGED_IN_TRANSIT, LOST_IN_TRANSIT, ACCESS_DENIED, WEATHER_DELAY, OTHER |
| Description | Text | Required details |

### Trip Completion
When all stops are completed or resolved, the trip can be marked as COMPLETED or RETURNED.
