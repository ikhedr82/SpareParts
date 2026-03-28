# Error Codes

## HTTP Status Codes
| Code | Meaning | Usage |
|---|---|---|
| `200` | OK | Successful read or update |
| `201` | Created | Successful resource creation |
| `400` | Bad Request | Validation failures, malformed input |
| `401` | Unauthorized | Missing or invalid JWT token |
| `403` | Forbidden | User lacks required permission |
| `404` | Not Found | Resource does not exist or is not in user's tenant |
| `409` | Conflict | Optimistic concurrency version mismatch, duplicate idempotency key |
| `422` | Unprocessable Entity | Business rule violation (e.g., credit limit exceeded) |
| `500` | Internal Server Error | Unexpected server failure |

## Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## Business Error Codes
| Error | HTTP | Message |
|---|---|---|
| Invalid credentials | 401 | "Invalid email or password" |
| Account suspended | 403 | "Your organization's subscription is suspended" |
| Insufficient permissions | 403 | "You do not have permission to perform this action" |
| Credit limit exceeded | 422 | "This order exceeds the client's credit limit" |
| Stale version | 409 | "This record has been modified by another user. Please refresh and try again" |
| Duplicate sync event | 200 | Silently accepted (idempotent) |
| Cash session already open | 400 | "A cash session is already open for this branch" |
| No active cash session | 400 | "Please open a cash session before making sales" |
| Insufficient stock | 422 | "Insufficient stock for product X at branch Y" |
| Invoice already paid | 400 | "This invoice has already been paid" |
| Period already closed | 400 | "Cannot post entries to a closed accounting period" |
