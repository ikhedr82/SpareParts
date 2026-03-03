"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUBSTITUTION_TRANSITIONS = exports.MANIFEST_TRANSITIONS = exports.TAX_FILING_TRANSITIONS = exports.CHARGEBACK_TRANSITIONS = exports.BRANCH_TRANSFER_TRANSITIONS = exports.REFUND_TRANSITIONS = exports.RETURN_TRANSITIONS = exports.PURCHASE_RETURN_TRANSITIONS = exports.SALE_TRANSITIONS = exports.QUOTE_TRANSITIONS = exports.PURCHASE_ORDER_TRANSITIONS = exports.DELIVERY_TRIP_TRANSITIONS = exports.PICKLIST_TRANSITIONS = exports.ORDER_TRANSITIONS = void 0;
exports.assertTransition = assertTransition;
const conflict_exception_1 = require("../exceptions/conflict.exception");
function assertTransition(entityName, entityId, from, to, transitions) {
    var _a;
    const allowed = (_a = transitions[from]) !== null && _a !== void 0 ? _a : [];
    if (!allowed.includes(to)) {
        throw new conflict_exception_1.ConflictException({
            entity: entityName,
            entityId,
            yourValue: to,
            currentValue: from,
        });
    }
}
exports.ORDER_TRANSITIONS = {
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
exports.PICKLIST_TRANSITIONS = {
    CREATED: ['PICKING', 'CANCELLED'],
    PICKING: ['PICKED', 'CANCELLED'],
    PICKED: ['PACKED', 'CANCELLED'],
    PACKED: [],
    CANCELLED: [],
};
exports.DELIVERY_TRIP_TRANSITIONS = {
    PLANNED: ['LOADING', 'FAILED', 'IN_TRANSIT'],
    LOADING: ['IN_TRANSIT', 'FAILED'],
    IN_TRANSIT: ['COMPLETED', 'FAILED'],
    COMPLETED: [],
    FAILED: ['RETURNED'],
    RETURNED: [],
};
exports.PURCHASE_ORDER_TRANSITIONS = {
    DRAFT: ['SENT', 'CANCELLED'],
    SENT: ['RECEIVED', 'CANCELLED'],
    RECEIVED: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
};
exports.QUOTE_TRANSITIONS = {
    DRAFT: ['SENT', 'CANCELLED'],
    SENT: ['ACCEPTED', 'REJECTED', 'EXPIRED'],
    ACCEPTED: ['CONVERTED'],
    REJECTED: [],
    EXPIRED: [],
    CONVERTED: [],
    CANCELLED: [],
};
exports.SALE_TRANSITIONS = {
    PENDING: ['COMPLETED', 'VOIDED'],
    COMPLETED: ['REFUNDED', 'VOIDED'],
    REFUNDED: [],
    VOIDED: [],
};
exports.PURCHASE_RETURN_TRANSITIONS = {
    REQUESTED: ['APPROVED', 'REJECTED'],
    APPROVED: ['SHIPPED', 'REJECTED'],
    SHIPPED: ['COMPLETED'],
    COMPLETED: [],
    REJECTED: [],
    DRAFT: ['REQUESTED', 'REJECTED'],
};
exports.RETURN_TRANSITIONS = {
    REQUESTED: ['APPROVED', 'REJECTED'],
    APPROVED: ['RECEIVED', 'REJECTED'],
    RECEIVED: ['COMPLETED'],
    COMPLETED: [],
    REJECTED: [],
};
exports.REFUND_TRANSITIONS = {
    PENDING: ['COMPLETED', 'FAILED'],
    COMPLETED: [],
    FAILED: [],
};
exports.BRANCH_TRANSFER_TRANSITIONS = {
    REQUESTED: ['APPROVED', 'CANCELLED'],
    APPROVED: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['RECEIVED'],
    RECEIVED: [],
    CANCELLED: [],
};
exports.CHARGEBACK_TRANSITIONS = {
    PENDING: ['RESOLVED', 'REJECTED'],
    RESOLVED: [],
    REJECTED: [],
};
exports.TAX_FILING_TRANSITIONS = {
    DRAFT: ['FILED', 'CANCELLED'],
    FILED: [],
    CANCELLED: [],
};
exports.MANIFEST_TRANSITIONS = {
    DRAFT: ['SEALED', 'CANCELLED'],
    SEALED: ['DISPATCHED', 'CANCELLED'],
    DISPATCHED: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
};
exports.SUBSTITUTION_TRANSITIONS = {
    PENDING: ['APPROVED', 'REJECTED'],
    APPROVED: [],
    REJECTED: [],
};
//# sourceMappingURL=fsm.guard.js.map