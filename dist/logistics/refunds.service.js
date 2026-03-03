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
exports.RefundsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
let RefundsService = class RefundsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRefund(tenantId, orderId, amount, reason, createdBy, returnId, deliveryExceptionId) {
        if (!returnId && !deliveryExceptionId) {
            throw new common_1.BadRequestException('COMMERCIAL SAFETY LAW 4: Refund must be linked to a Return or Delivery Exception');
        }
        if (returnId && deliveryExceptionId) {
            throw new common_1.BadRequestException('COMMERCIAL SAFETY LAW 4: Refund cannot be linked to both Return and Delivery Exception');
        }
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, tenantId },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const refundCount = await this.prisma.refund.count({ where: { tenantId } });
        const refundNumber = `REF-${new Date().getFullYear()}-${paddedNumber(refundCount + 1)}`;
        return this.prisma.refund.create({
            data: {
                tenantId,
                branchId: order.branchId,
                orderId,
                returnId,
                deliveryExceptionId,
                refundNumber,
                amount,
                reason,
                status: client_1.RefundStatus.PENDING,
                createdById: createdBy,
            },
        });
    }
    async processRefund(tenantId, refundId, processedBy) {
        var _a, _b;
        const refund = await this.prisma.refund.findFirst({
            where: { id: refundId, tenantId },
            include: { return: true, deliveryException: true },
        });
        if (!refund) {
            throw new common_1.NotFoundException('Refund not found');
        }
        if (refund.status !== client_1.RefundStatus.PENDING) {
            throw new common_1.BadRequestException('Refund must be PENDING to process');
        }
        if (refund.returnId) {
            if (((_a = refund.return) === null || _a === void 0 ? void 0 : _a.status) !== 'RECEIVED') {
                throw new common_1.BadRequestException('COMMERCIAL SAFETY LAW 4: Return must be RECEIVED to process refund');
            }
            const returnItems = await this.prisma.returnItem.findMany({
                where: { returnId: refund.returnId },
                include: { orderItem: true }
            });
            let maxRefundable = new library_1.Decimal(0);
            for (const item of returnItems) {
                if (item.orderItem) {
                    maxRefundable = maxRefundable.plus(item.orderItem.unitPrice.mul(item.quantity));
                }
            }
            if (refund.amount.gt(maxRefundable)) {
                throw new common_1.BadRequestException(`COMMERCIAL SAFETY P1: Refund amount (${refund.amount}) exceeds value of returned goods (${maxRefundable})`);
            }
        }
        else if (refund.deliveryExceptionId) {
            const validTypes = ['LOST_IN_TRANSIT', 'DAMAGED_IN_TRANSIT'];
            if (!validTypes.includes((_b = refund.deliveryException) === null || _b === void 0 ? void 0 : _b.exceptionType)) {
                throw new common_1.BadRequestException('COMMERCIAL SAFETY LAW 4: Delivery Exception must be LOST or DAMAGED to process refund');
            }
        }
        else {
            throw new common_1.BadRequestException('COMMERCIAL SAFETY LAW 4: No valid proof linked to this refund');
        }
        return this.prisma.$transaction(async (tx) => {
            const processedRefund = await tx.refund.update({
                where: { id: refundId },
                data: {
                    status: client_1.RefundStatus.COMPLETED,
                    processedById: processedBy,
                    processedAt: new Date(),
                },
            });
            return processedRefund;
        });
    }
    async cancelRefund(tenantId, refundId, cancelledBy, reason) {
        const refund = await this.prisma.refund.findFirst({
            where: { id: refundId, tenantId },
        });
        if (!refund) {
            throw new common_1.NotFoundException('Refund not found');
        }
        if (refund.status !== client_1.RefundStatus.PENDING) {
            throw new common_1.BadRequestException('Only PENDING refunds can be cancelled');
        }
        return this.prisma.refund.update({
            where: { id: refundId },
            data: {
                status: client_1.RefundStatus.CANCELLED,
                cancelledById: cancelledBy,
                cancelledAt: new Date(),
                reason: `${refund.reason} [CANCELLED: ${reason}]`,
            },
        });
    }
    async findAll(tenantId, status, orderId) {
        return this.prisma.refund.findMany({
            where: Object.assign(Object.assign({ tenantId }, (status && { status })), (orderId && { orderId })),
            include: {
                order: { select: { orderNumber: true } },
                return: { select: { returnNumber: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getPendingTotal(tenantId) {
        const aggregations = await this.prisma.refund.aggregate({
            where: { tenantId, status: client_1.RefundStatus.PENDING },
            _sum: { amount: true },
        });
        return aggregations._sum.amount || 0;
    }
};
exports.RefundsService = RefundsService;
exports.RefundsService = RefundsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RefundsService);
function paddedNumber(num) {
    return num.toString().padStart(6, '0');
}
//# sourceMappingURL=refunds.service.js.map