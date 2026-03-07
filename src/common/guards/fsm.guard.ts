import { ConflictException } from '../exceptions/conflict.exception';

/**
 * HC-7: Finite State Machine Guard Utility
 *
 * Validates that a status transition is allowed for a given entity.
 * Throws ConflictException (409) if the transition is not permitted.
 *
 * @param entityName  Human-readable entity name (e.g. 'Order', 'DeliveryTrip')
 * @param entityId    The entity's ID
 * @param from        Current status
 * @param to          Desired new status
 * @param transitions Map of allowed transitions: { FROM_STATUS: ['ALLOWED_TO_1', 'ALLOWED_TO_2'] }
 */
export function assertTransition(
    entityName: string,
    entityId: string,
    from: string,
    to: string,
    transitions: Record<string, string[]>,
): void {
    const allowed = transitions[from] ?? [];
    if (!allowed.includes(to)) {
        throw new ConflictException({
            entity: entityName,
            entityId,
            yourValue: to,
            currentValue: from,
        });
    }
}

/** Order FSM transitions */
export const ORDER_TRANSITIONS: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['PARTIALLY_FULFILLED', 'SHIPPED', 'CANCELLED'],
    PARTIALLY_FULFILLED: ['PROCESSING', 'SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED', 'DELIVERY_FAILED'],
    READY_FOR_PICKUP: ['DELIVERED', 'DELIVERY_FAILED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'DELIVERY_FAILED'],
    DELIVERED: [],
    DELIVERY_FAILED: ['PROCESSING', 'CANCELLED'],
    CANCELLED: [],
};

/** PickList FSM transitions */
export const PICKLIST_TRANSITIONS: Record<string, string[]> = {
    CREATED: ['PICKING', 'CANCELLED'],
    PICKING: ['PICKED', 'CANCELLED'],
    PICKED: ['PACKED', 'CANCELLED'],
    PACKED: [],
    CANCELLED: [],
};

/** DeliveryTrip FSM transitions (INTERNAL_FLEET path) */
export const DELIVERY_TRIP_TRANSITIONS: Record<string, string[]> = {
    PLANNED: ['LOADING', 'FAILED', 'IN_TRANSIT'],
    LOADING: ['IN_TRANSIT', 'FAILED'],
    IN_TRANSIT: ['COMPLETED', 'FAILED'],
    COMPLETED: [],
    FAILED: ['RETURNED'],
    RETURNED: [],
};

/** PurchaseOrder FSM transitions */
export const PURCHASE_ORDER_TRANSITIONS: Record<string, string[]> = {
    DRAFT: ['SENT', 'CANCELLED'],
    SENT: ['RECEIVED', 'CANCELLED'],
    RECEIVED: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
};

/** Quote FSM transitions */
export const QUOTE_TRANSITIONS: Record<string, string[]> = {
    DRAFT: ['SENT', 'CANCELLED'],
    SENT: ['ACCEPTED', 'REJECTED', 'EXPIRED'],
    ACCEPTED: ['CONVERTED'],
    REJECTED: [],
    EXPIRED: [],
    CONVERTED: [],
    CANCELLED: [],
};

/** Sale FSM transitions */
export const SALE_TRANSITIONS: Record<string, string[]> = {
    PENDING: ['COMPLETED', 'VOIDED'],
    COMPLETED: ['REFUNDED', 'VOIDED'],
    REFUNDED: [],
    VOIDED: [],
};

/** PurchaseReturn FSM transitions */
export const PURCHASE_RETURN_TRANSITIONS: Record<string, string[]> = {
    REQUESTED: ['APPROVED', 'REJECTED'],
    APPROVED: ['SHIPPED', 'REJECTED'],
    SHIPPED: ['COMPLETED'],
    COMPLETED: [],
    REJECTED: [],
    DRAFT: ['REQUESTED', 'REJECTED'],
};
/** Sale Return FSM transitions */
export const RETURN_TRANSITIONS: Record<string, string[]> = {
    REQUESTED: ['APPROVED', 'REJECTED'],
    APPROVED: ['RECEIVED', 'REJECTED'],
    RECEIVED: ['COMPLETED'],
    COMPLETED: [],
    REJECTED: [],
};

/** Refund FSM transitions */
export const REFUND_TRANSITIONS: Record<string, string[]> = {
    PENDING: ['COMPLETED', 'FAILED'],
    COMPLETED: [],
    FAILED: [],
};

/** UC-2: BranchTransfer FSM transitions */
export const BRANCH_TRANSFER_TRANSITIONS: Record<string, string[]> = {
    REQUESTED: ['APPROVED', 'CANCELLED'],
    APPROVED: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['RECEIVED'],
    RECEIVED: [],
    CANCELLED: [],
};

/** UC-6: Chargeback FSM transitions */
export const CHARGEBACK_TRANSITIONS: Record<string, string[]> = {
    PENDING: ['RESOLVED', 'REJECTED'],
    RESOLVED: [],
    REJECTED: [],
};

/** UC-7: TaxFiling FSM transitions */
export const TAX_FILING_TRANSITIONS: Record<string, string[]> = {
    DRAFT: ['FILED', 'CANCELLED'],
    FILED: [],
    CANCELLED: [],
};

/** UC-9: Manifest FSM transitions */
export const MANIFEST_TRANSITIONS: Record<string, string[]> = {
    DRAFT: ['SEALED', 'CANCELLED'],
    SEALED: ['DISPATCHED', 'CANCELLED'],
    DISPATCHED: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
};

/** UC-3: Substitution FSM transitions */
export const SUBSTITUTION_TRANSITIONS: Record<string, string[]> = {
    PENDING: ['APPROVED', 'REJECTED'],
    APPROVED: [],
    REJECTED: [],
};
