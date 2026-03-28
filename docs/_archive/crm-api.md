# CRM API Documentation

## Base Path
`/crm`

## Endpoints

### Customer 360 View
`GET /crm/customers/:id/360`
- **Description**: Returns a complete aggregation of customer data.
- **Auth Required**: Yes

### Leads
`POST /crm/leads`
- **Body**: `{ name, company, email, phone, status, source, notes }`
`GET /crm/leads`
- **Description**: Returns all leads for the current tenant.

### Opportunities
`POST /crm/opportunities`
- **Body**: `{ name, value, stage, leadId, businessClientId, expectedCloseDate }`
`GET /crm/opportunities`

### Credit Management
`PATCH /crm/credit/limit`
- **Body**: `{ businessClientId, limit, status }`
- **Description**: Updates the credit limit and status for a business client. Syncs with core `BusinessClient` record.

### Activities & Notes
`POST /crm/activities`
- **Body**: `{ type, subject, description, dueDate, businessClientId, leadId, ... }`
`POST /crm/notes`
- **Body**: `{ content, businessClientId, leadId, ... }`
