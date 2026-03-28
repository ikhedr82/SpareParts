# Synchronization & Conflict Resolution Strategy

Partivo implements a robust synchronization protocol to ensure data consistency across distributed clients (POS, Mobile).

## Sync Lifecycle

1. **Client-Side Action**: 
   - Store record in Local DB.
   - Assign `version: 0`.
   - Add to `sync_queue`.
   - Update UI: Show "Sync Pending" icon.

2. **Sync Outbound**:
   - Client fetches items from `sync_queue`.
   - Packs into `batch` request.
   - Header: `X-Client-Version: [AppVersion]`.

3. **Server Processing**:
   - Check `X-Idempotency-Key` or `syncId` in the database.
   - If `syncId` exists: return previous successful response (idempotency).
   - If Record exists: Compare `version` or `updatedAt`.
   - Conflict Resolution (LWW): 
     - If `client.version >= server.version`: Accept update + increment server version.
     - If `client.version < server.version`: Reject update + return current server state (Conflict).

4. **Response Handling**:
   - `200/201 (Sync Success)`: Client marks item as `SYNCED` and drops it.
   - `409 (Conflict)`: Client pulls server version.
   - `400 (Bad Request)`: Client drops payload (terminal failure).
   - `500+ / Network Error`: Client increments `retryCount` and uses exponential backoff.

## Offline Priority Strategy
The local `SyncQueue` uses priority tiers:
- **HIGH**: Checkout (`SALE`/`ORDER`) and `PAYMENT`. Synced first.
- **MEDIUM**: Driver `TRIP` drops and Warehouse `INVENTORY` transfers.
- **LOW**: User behavior logs and non-critical edits.

These are batched using a secondary sort by `sequenceNumber` to ensure causal consistency.

## Exponential Backoff Retry Flow
For partial batch failures or network timeouts, the mobile `SyncQueue` implements the following backoff algorithm:

1. **Attempt 1**: T0
2. **Attempt 2**: T0 + 2s
3. **Attempt 3**: T0 + 5s
4. **Attempt 4**: T0 + 10s
5. **Attempt 5**: T0 + 30s
6. **Max Retries Exceeded**: `maxRetries` hits 5. The operation is dropped from the queue, preventing unresolvable payloads from blocking the sync engine.

## Conflict Resolution Rules

| Component | Resolution | Rationale |
|-----------|------------|-----------|
| **POS Sale** | Server Authority | Payments must be finalized on server; offline sales are appended. |
| **Inventory** | Last-Write-Wins | Stock counts are point-in-time; most recent count is usually most accurate. |
| **Driver Trip** | Server Authority | Status transitions (e.g., 'Completed') cannot be reversed by stale offline syncs. |
| **Customer Metadata** | Last-Write-Wins | Contact details, address updates. |

## Idempotency Key Specification

All sync actions MUST include a `syncId` (UUID v4).
- Generated at the point of action (e.g., clicking "Place Order").
- Remains constant during retries.
- Stored on the server in the `IdempotencyRecord` table for 7 days.
