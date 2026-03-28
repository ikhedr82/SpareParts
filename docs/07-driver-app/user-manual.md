# Driver App — User Manual

## Login
1. Open the Driver App on your mobile device.
2. Enter your email and password.
3. Tap **Login**.

**Error States**:
- Invalid credentials: *"Invalid email or password."*
- Not a driver: *"You do not have driver access. Contact your manager."*

---

## Screen: Home
**Purpose**: View all assigned delivery trips.

### Trip List
| Element | Description |
|---|---|
| Trip Card | Shows Trip ID, Branch name, Stop count, Pack count, Status badge |
| Status Badge | Color-coded: PLANNED (blue), LOADING (orange), IN_TRANSIT (yellow), COMPLETED (green), FAILED (red) |

### Actions
| Action | Effect |
|---|---|
| **Tap Trip Card** | Opens Trip Detail screen |
| **Pull Down** | Refreshes trip list from server |

### Empty State
*"No trips assigned. Check back later or contact your dispatcher."*

---

## Screen: Trip Detail
**Purpose**: Manage a delivery trip and its stops.

### Trip Header
| Field | Description |
|---|---|
| Trip ID | Auto-generated identifier |
| Branch | Origin branch |
| Vehicle | Assigned vehicle (plate number) |
| Status | Current trip status |
| Total Stops | Number of delivery stops |
| Total Packs | Number of loaded packs |

### Stop List
Each stop is displayed in sequence order:

| Element | Description |
|---|---|
| Sequence # | Delivery order number |
| Type Icon | 🏪 Customer, 🏭 Supplier, 🏢 Branch |
| Name | Customer/Supplier/Branch name |
| Address | Delivery address |
| Order # | Linked order reference |
| Status Badge | PENDING (grey), ARRIVED (blue), DELIVERED (green), FAILED (red) |

### Actions per Stop

#### When Stop is PENDING
| Button | Action |
|---|---|
| **Mark Arrived** | Records arrival time, changes status to ARRIVED |

#### When Stop is ARRIVED
| Button | Action |
|---|---|
| **Complete Delivery** | Opens Proof of Delivery form |
| **Report Failure** | Opens Exception form |

### Proof of Delivery Form
| Field | Type | Required | Description |
|---|---|---|---|
| Signer Name | Text | Yes | Name of receiver |
| Signature | Drawing Canvas | Yes | Digital signature |
| Photo | Camera Capture | No | Photo of delivered goods |
| Notes | Text | No | Additional notes |
| GPS | Automatic | Yes | Auto-captured on submission |

**Submit Button**: Tap **Confirm Delivery** → Stop marked as DELIVERED.

### Exception Report Form
| Field | Type | Required | Description |
|---|---|---|---|
| Exception Type | Picker | Yes | Select from predefined types |
| Description | Text | Yes | Detailed explanation |

**Submit Button**: Tap **Report Exception** → Stop marked as FAILED.

### Trip-Level Actions
| Button | Condition | Effect |
|---|---|---|
| **Start Trip** | Trip status is PLANNED | Changes to LOADING → IN_TRANSIT |
| **Complete Trip** | All stops resolved | Changes to COMPLETED |

### Error States
- Network error during submission: *"Unable to submit. Your update will be saved and synced when connection is restored."*
- Trip already completed: *"This trip has already been completed."*

---

## Workflow: Typical Delivery Day

1. **Open app** → View assigned trips on Home screen.
2. **Select trip** → Review stops and route.
3. **Tap "Start Trip"** → Trip enters IN_TRANSIT.
4. **Drive to first stop** → Tap "Mark Arrived" when on-site.
5. **Deliver goods** → Capture proof of delivery (signature, photo).
6. **Tap "Complete Delivery"** → Stop turns green.
7. **Repeat** for each stop.
8. **If delivery fails** → Tap "Report Failure", select exception type, describe issue.
9. **After last stop** → Tap "Complete Trip" → Trip marked as COMPLETED.
