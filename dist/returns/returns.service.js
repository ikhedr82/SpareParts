"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const inventory_safety_service_1 = require("../warehouse/inventory-safety.service");
const fsm_guard_1 = require("../common/guards/fsm.guard");
const audit_service_1 = require("../shared/audit.service");
const translation_service_1 = require("../i18n/translation.service");
let ReturnsService = class ReturnsService {
    constructor(prisma, inventorySafetyService, auditService, t) {
        this.prisma = prisma;
        this.inventorySafetyService = inventorySafetyService;
        this.auditService = auditService;
        this.t = t;
    }
    async initiateReturn(tenantId, orderId, reason, items, requestedBy, reasonNotes, deliveryExceptionId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, tenantId },
            include: { items: true },
        });
        if (!order) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Order' }));
        }
        for (const item of items) {
            const orderItem = order.items.find((i) => i.id === item.orderItemId);
            if (!orderItem) {
                throw new common_1.BadRequestException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Order item' }));
            }
            if (item.quantity > orderItem.quantity) {
                throw new common_1.BadRequestException(this.t.translate('errors.orders.quantity_exceeds', 'EN'));
            }
        }
        const returnCount = await this.prisma.return.count({ where: { tenantId } });
        const returnNumber = `RET-${new Date().getFullYear()}-${paddedNumber(returnCount + 1)}`;
        const result = await this.prisma.return.create({
            data: {
                tenantId,
                orderId,
                returnNumber,
                reason,
                reasonNotes,
                requestedBy,
                deliveryExceptionId,
                status: client_1.ReturnStatus.REQUESTED,
                returnItems: {
                    create: items.map((item) => ({
                        orderItemId: item.orderItemId,
                        quantity: item.quantity,
                    })),
                },
            },
            include: {
                returnItems: true,
            },
        });
        await this.auditService.logAction(tenantId, requestedBy, 'INITIATE_RETURN', 'Return', result.id, null, result);
        return result;
    }
    async approveReturn(tenantId, returnId, approvedBy) {
        const returnRequest = await this.prisma.return.findFirst({
            where: { id: returnId, tenantId },
            include: { order: true, returnItems: { include: { orderItem: true } } },
        });
        if (!returnRequest) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Return' }));
        }
        if (returnRequest.status !== client_1.ReturnStatus.REQUESTED) {
            throw new common_1.BadRequestException(this.t.translate('errors.fsm.invalid_transition', 'EN', { entity: 'Return', from: returnRequest.status, to: 'APPROVED' }));
        }
        const totalRefundAmount = returnRequest.returnItems.reduce((sum, item) => {
            return sum + Number(item.orderItem.unitPrice) * item.quantity;
        }, 0);
        const refundCount = await this.prisma.refund.count({ where: { tenantId } });
        const refundNumber = `REF-${new Date().getFullYear()}-${paddedNumber(refundCount + 1)}`;
        return this.prisma.$transaction(async (tx) => {
            (0, fsm_guard_1.assertTransition)('Return', returnId, returnRequest.status, client_1.ReturnStatus.APPROVED, fsm_guard_1.RETURN_TRANSITIONS);
            const result = await tx.return.updateMany({
                where: { id: returnId, tenantId, version: returnRequest.version },
                data: {
                    status: client_1.ReturnStatus.APPROVED,
                    approvedBy,
                    approvedAt: new Date(),
                    version: { increment: 1 }
                },
            });
            if (result.count === 0)
                throw new Error('CONCURRENCY_CONFLICT');
            const updatedReturn = await tx.return.findFirst({ where: { id: returnId, tenantId } });
            const refund = await tx.refund.create({
                data: {
                    tenantId,
                    branchId: returnRequest.order.branchId,
                    orderId: returnRequest.orderId,
                    returnId,
                    refundNumber,
                    amount: totalRefundAmount,
                    reason: `Refund for Return ${returnRequest.returnNumber}`,
                    status: client_1.RefundStatus.PENDING,
                    createdById: approvedBy,
                },
            });
            await this.auditService.logAction(tenantId, approvedBy, 'APPROVE_RETURN', 'Return', returnId, { status: returnRequest.status }, { status: client_1.ReturnStatus.APPROVED, refundId: refund.id });
            return updatedReturn;
        });
    }
    async rejectReturn(tenantId, returnId, rejectedBy, reason) {
        const returnRequest = await this.prisma.return.findFirst({
            where: { id: returnId, tenantId },
        });
        if (!returnRequest) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Return' }));
        }
        if (returnRequest.status !== client_1.ReturnStatus.REQUESTED) {
            throw new common_1.BadRequestException(this.t.translate('errors.fsm.invalid_transition', 'EN', { entity: 'Return', from: returnRequest.status, to: 'REJECTED' }));
        }
        const result = await this.prisma.return.updateMany({
            where: { id: returnId, tenantId, version: returnRequest.version },
            data: {
                status: client_1.ReturnStatus.REJECTED,
                reasonNotes: reason ? `${returnRequest.reasonNotes || ''} [REJECTED: ${reason}]` : undefined,
                version: { increment: 1 }
            },
        });
        if (result.count === 0)
            throw new Error('CONCURRENCY_CONFLICT');
        return this.prisma.return.findFirst({ where: { id: returnId, tenantId } });
    }
    async receiveReturn(tenantId, returnId, items, receivedBy) {
        const returnRequest = await this.prisma.return.findFirst({
            where: { id: returnId, tenantId },
            include: {
                returnItems: {
                    include: {
                        orderItem: true,
                    },
                },
                order: true,
            },
        });
        if (!returnRequest) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Return' }));
        }
        (0, fsm_guard_1.assertTransition)('Return', returnId, returnRequest.status, client_1.ReturnStatus.RECEIVED, fsm_guard_1.RETURN_TRANSITIONS);
        return this.prisma.$transaction(async (tx) => {
            const itemsToRestock = [];
            for (const item of items) {
                await tx.returnItem.update({
                    where: { id: item.returnItemId },
                    data: {
                        condition: item.condition,
                        restockable: item.restockable,
                        inspectionNotes: item.inspectionNotes,
                    },
                });
                if (item.restockable) {
                    const returnItem = returnRequest.returnItems.find((ri) => ri.id === item.returnItemId);
                    if (returnItem && returnItem.orderItem) {
                        itemsToRestock.push({
                            productId: returnItem.orderItem.productId,
                            quantity: returnItem.quantity,
                        });
                    }
                }
            }
            if (itemsToRestock.length > 0) {
                await this.inventorySafetyService.restock(tenantId, returnRequest.order.branchId, itemsToRestock, client_1.InventoryTransactionType.RETURN, client_1.InventoryReferenceType.RETURN, returnId, receivedBy, tx);
            }
            const result = await tx.return.updateMany({
                where: { id: returnId, tenantId, version: returnRequest.version },
                data: {
                    status: client_1.ReturnStatus.RECEIVED,
                    receivedAt: new Date(),
                    version: { increment: 1 }
                },
            });
            if (result.count === 0)
                throw new Error('CONCURRENCY_CONFLICT');
            const updated = await tx.return.findFirst({
                where: { id: returnId, tenantId },
                include: { returnItems: true },
            });
            await this.auditService.logAction(tenantId, receivedBy, 'RECEIVE_RETURN', 'Return', returnId, { status: returnRequest.status }, { status: client_1.ReturnStatus.RECEIVED });
            return updated;
        });
    }
    async completeReturn(tenantId, returnId, completedBy) {
        const returnRequest = await this.prisma.return.findFirst({
            where: { id: returnId, tenantId },
            include: {
                returnItems: { include: { orderItem: true } },
                refund: true,
            },
        });
        if (!returnRequest) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Return' }));
        }
        (0, fsm_guard_1.assertTransition)('Return', returnId, returnRequest.status, client_1.ReturnStatus.COMPLETED, fsm_guard_1.RETURN_TRANSITIONS);
        return this.prisma.$transaction(async (tx) => {
            if (returnRequest.refund && returnRequest.refund.status === client_1.RefundStatus.PENDING) {
                const refundResult = await tx.refund.updateMany({
                    where: { id: returnRequest.refund.id, tenantId, version: returnRequest.refund.version },
                    data: {
                        status: client_1.RefundStatus.COMPLETED,
                        processedById: completedBy,
                        processedAt: new Date(),
                        version: { increment: 1 }
                    },
                });
                if (refundResult.count === 0)
                    throw new Error('CONCURRENCY_CONFLICT');
            }
            const result = await tx.return.updateMany({
                where: { id: returnId, tenantId, version: returnRequest.version },
                data: {
                    status: client_1.ReturnStatus.COMPLETED,
                    completedAt: new Date(),
                    version: { increment: 1 }
                },
            });
            if (result.count === 0)
                throw new Error('CONCURRENCY_CONFLICT');
            return tx.return.findFirst({ where: { id: returnId, tenantId } });
            await this.auditService.logAction(tenantId, completedBy, 'COMPLETE_RETURN', 'Return', returnId, { status: returnRequest.status }, { status: client_1.ReturnStatus.COMPLETED });
            return result;
        });
    }
    async findAll(tenantId, status, orderId) {
        return this.prisma.return.findMany({
            where: Object.assign(Object.assign({ tenantId }, (status && { status })), (orderId && { orderId })),
            include: {
                order: { select: { orderNumber: true } },
                returnItems: true,
                refund: true,
            },
            orderBy: { requestedAt: 'desc' },
        });
    }
    async findOne(tenantId, id) {
        return this.prisma.return.findFirst({
            where: { id, tenantId },
            include: {
                order: true,
                returnItems: { include: { orderItem: true } },
                refund: true,
            },
        });
    }
};
exports.ReturnsService = ReturnsService;
exports.ReturnsService = ReturnsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_safety_service_1.InventorySafetyService,
        audit_service_1.AuditService,
        translation_service_1.TranslationService])
], ReturnsService);
function paddedNumber(num) {
    return num.toString().padStart(6, '0');
}
//# sourceMappingURL=returns.service.js.map