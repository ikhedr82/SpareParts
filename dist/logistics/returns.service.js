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
let ReturnsService = class ReturnsService {
    constructor(prisma, inventorySafetyService) {
        this.prisma = prisma;
        this.inventorySafetyService = inventorySafetyService;
    }
    async initiateReturn(tenantId, orderId, reason, items, requestedBy, reasonNotes, deliveryExceptionId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, tenantId },
            include: { items: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        for (const item of items) {
            const orderItem = order.items.find((i) => i.id === item.orderItemId);
            if (!orderItem) {
                throw new common_1.BadRequestException(`Order item ${item.orderItemId} not found in order`);
            }
            if (item.quantity > orderItem.quantity) {
                throw new common_1.BadRequestException(`Return quantity cannot exceed order quantity for item ${item.orderItemId}`);
            }
        }
        const returnCount = await this.prisma.return.count({ where: { tenantId } });
        const returnNumber = `RET - ${new Date().getFullYear()} -${paddedNumber(returnCount + 1)} `;
        return this.prisma.return.create({
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
    }
    async approveReturn(tenantId, returnId, approvedBy) {
        const returnRequest = await this.prisma.return.findFirst({
            where: { id: returnId, tenantId },
            include: { order: true, returnItems: { include: { orderItem: true } } },
        });
        if (!returnRequest) {
            throw new common_1.NotFoundException('Return not found');
        }
        if (returnRequest.status !== client_1.ReturnStatus.REQUESTED) {
            throw new common_1.BadRequestException('Return must be in REQUESTED status');
        }
        const totalRefundAmount = returnRequest.returnItems.reduce((sum, item) => {
            return sum + Number(item.orderItem.unitPrice) * item.quantity;
        }, 0);
        const refundCount = await this.prisma.refund.count({ where: { tenantId } });
        const refundNumber = `REF - ${new Date().getFullYear()} -${paddedNumber(refundCount + 1)} `;
        return this.prisma.$transaction(async (tx) => {
            const updatedReturn = await tx.return.update({
                where: { id: returnId },
                data: {
                    status: client_1.ReturnStatus.APPROVED,
                    approvedBy,
                    approvedAt: new Date(),
                },
            });
            await tx.refund.create({
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
            return updatedReturn;
        });
    }
    async rejectReturn(tenantId, returnId, rejectedBy, reason) {
        const returnRequest = await this.prisma.return.findFirst({
            where: { id: returnId, tenantId },
        });
        if (!returnRequest) {
            throw new common_1.NotFoundException('Return not found');
        }
        if (returnRequest.status !== client_1.ReturnStatus.REQUESTED) {
            throw new common_1.BadRequestException('Return must be in REQUESTED status');
        }
        return this.prisma.return.update({
            where: { id: returnId },
            data: {
                status: client_1.ReturnStatus.REJECTED,
                reasonNotes: reason ? `${returnRequest.reasonNotes || ''} [REJECTED: ${reason}]` : undefined,
            },
        });
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
            throw new common_1.NotFoundException('Return not found');
        }
        if (returnRequest.status !== client_1.ReturnStatus.APPROVED) {
            throw new common_1.BadRequestException('Return must be APPROVED before receiving items');
        }
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
            return tx.return.update({
                where: { id: returnId },
                data: {
                    status: client_1.ReturnStatus.RECEIVED,
                    receivedAt: new Date(),
                },
                include: { returnItems: true },
            });
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
            throw new common_1.NotFoundException('Return not found');
        }
        if (returnRequest.status !== client_1.ReturnStatus.RECEIVED) {
            throw new common_1.BadRequestException('Return items must be RECEIVED before completion');
        }
        return this.prisma.$transaction(async (tx) => {
            if (returnRequest.refund && returnRequest.refund.status === client_1.RefundStatus.PENDING) {
                await tx.refund.update({
                    where: { id: returnRequest.refund.id },
                    data: {
                        status: client_1.RefundStatus.COMPLETED,
                        processedById: completedBy,
                        processedAt: new Date(),
                    },
                });
            }
            return tx.return.update({
                where: { id: returnId },
                data: {
                    status: client_1.ReturnStatus.COMPLETED,
                    completedAt: new Date(),
                },
            });
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
};
exports.ReturnsService = ReturnsService;
exports.ReturnsService = ReturnsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_safety_service_1.InventorySafetyService])
], ReturnsService);
function paddedNumber(num) {
    return num.toString().padStart(6, '0');
}
//# sourceMappingURL=returns.service.js.map