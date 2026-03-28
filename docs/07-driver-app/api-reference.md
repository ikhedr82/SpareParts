# Driver App — API Reference

## Authentication
```
Authorization: Bearer <access_token>
```

## Endpoint Groups

### Trips
- `GET /logistics/driver/trips` — List assigned trips.
- `GET /logistics/trips/:id` — Trip detail with stops.
- `PATCH /logistics/trips/:id/status` — Update trip status (start, complete).

### Stops
- `PATCH /logistics/trips/:tripId/stops/:stopId` — Update stop status.
- `POST /logistics/trips/:tripId/stops/:stopId/proof` — Submit proof of delivery.
- `POST /logistics/trips/:tripId/stops/:stopId/exception` — Report delivery exception.

> **Note**: For full request/response schemas, refer to the Swagger UI at `/api/docs`.
