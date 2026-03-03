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
exports.CommercialSafetyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const inventory_safety_service_1 = require("../warehouse/inventory-safety.service");
const client_1 = require("@prisma/client");
let CommercialSafetyService = class CommercialSafetyService {
    constructor(prisma, inventorySafety) {
        this.prisma = prisma;
        this.inventorySafety = inventorySafety;
    }
    async processReplacement(tenantId, userId, returnId, deliveryExceptionId) {
        var _a, _b;
        if (!returnId && !deliveryExceptionId) {
            throw new common_1.BadRequestException('COMMERCIAL SAFETY R1: Replacement requires Return or DeliveryException');
        }
        if (returnId && deliveryExceptionId) {
            throw new common_1.BadRequestException('COMMERCIAL SAFETY R1: Replacement cannot have both Return and DeliveryException');
        }
        let itemsToReplace = [];
        let replacementsBranchId;
        let replacementsClientId = null;
        let sourceReturn = null;
        let sourceException = null;
        if (returnId) {
            const ret = await this.prisma.return.findFirst({
                where: { id: returnId, tenantId },
                include: { returnItems: true, order: true },
            });
            if (!ret)
                throw new common_1.NotFoundException('Return not found');
            if (ret.status !== client_1.ReturnStatus.RECEIVED) {
                throw new common_1.BadRequestException('COMMERCIAL SAFETY R1: Return must be RECEIVED');
            }
            sourceReturn = ret;
            replacementsBranchId = ((_a = ret.order) === null || _a === void 0 ? void 0 : _a.branchId) || '';
            replacementsClientId = ((_b = ret.order) === null || _b === void 0 ? void 0 : _b.businessClientId) || null;
            itemsToReplace = ret.returnItems
                .filter(i => i.productId)
                .map(i => ({ productId: i.productId, quantity: i.quantity }));
        }
        if (deliveryExceptionId) {
            const ex = await this.prisma.deliveryException.findFirst({
                where: { id: deliveryExceptionId, tenantId },
                include: { tripStop: { include: { order: { include: { items: true } } } } },
            });
            if (!ex)
                throw new common_1.NotFoundException('Delivery Exception not found');
            const validTypes = ['LOST_IN_TRANSIT', 'DAMAGED_IN_TRANSIT'];
            if (!validTypes.includes(ex.exceptionType)) {
                throw new common_1.BadRequestException('COMMERCIAL SAFETY R1: DeliveryException must be LOST or DAMAGED');
            }
            sourceException = ex;
            const order = ex.tripStop.order;
            if (!order)
                throw new common_1.BadRequestException('Exception not linked to order');
            replacementsBranchId = order.branchId;
            replacementsClientId = order.businessClientId;
            itemsToReplace = order.items.map(i => ({ productId: i.productId, quantity: i.quantity }));
        }
        if (itemsToReplace.length === 0) {
            throw new common_1.BadRequestException('No items found to replace');
        }
        return this.prisma.$transaction(async (tx) => {
            const orderCount = await tx.order.count({ where: { tenantId } });
            const orderNumber = `EXC-${new Date().getFullYear()}-${(orderCount + 1).toString().padStart(6, '0')}`;
            const newOrder = await tx.order.create({
                data: {
                    tenantId,
                    branchId: replacementsBranchId,
                    businessClientId: replacementsClientId !== null && replacementsClientId !== void 0 ? replacementsClientId : '',
                    orderNumber,
                    status: 'PENDING',
                    total: 0,
                    subtotal: 0,
                    tax: 0,
                    createdById: userId,
                    returnId: returnId,
                    deliveryExceptionId: deliveryExceptionId,
                    items: {
                        create: itemsToReplace.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: 0,
                        }))
                    }
                },
                include: { items: true }
            });
            await this.inventorySafety.allocate(tenantId, newOrder.branchId, newOrder.items.map(i => ({ productId: i.productId, quantity: i.quantity })), 'ORDER', newOrder.id, userId, tx);
            await tx.order.update({
                where: { id: newOrder.id },
                data: { status: 'CONFIRMED' }
            });
            if (sourceReturn) {
                await tx.return.update({
                    where: { id: returnId },
                    data: { status: client_1.ReturnStatus.COMPLETED, completedAt: new Date() }
                });
            }
            if (sourceException) {
                await tx.deliveryException.update({
                    where: { id: deliveryExceptionId },
                    data: {
                        resolved: true,
                        resolutionType: 'REPLACEMENT',
                        resolvedBy: userId,
                        resolvedAt: new Date(),
                        resolutionNotes: `Replaced by Order ${newOrder.orderNumber}`
                    }
                });
            }
            return newOrder;
        });
    }
    async processLoss(tenantId, exceptionId, userId) {
        const exception = await this.prisma.deliveryException.findUnique({
            where: { id: exceptionId },
            include: { tripStop: { include: { order: { include: { items: true } } } } }
        });
        if (!exception)
            throw new common_1.NotFoundException('Exception not found');
        if (exception.exceptionType !== 'LOST_IN_TRANSIT') {
            throw new common_1.BadRequestException('Only LOST_IN_TRANSIT can be processed as total loss');
        }
        const order = exception.tripStop.order;
        if (!order)
            throw new common_1.BadRequestException('exception not linked to order');
        return this.prisma.$transaction(async (tx) => {
            const refundCount = await tx.refund.count({ where: { tenantId } });
            const refundNumber = `REF-LOSS-${new Date().getFullYear()}-${(refundCount + 1).toString().padStart(6, '0')}`;
            await tx.refund.create({
                data: {
                    tenantId,
                    branchId: order.branchId,
                    orderId: order.id,
                    amount: order.total,
                    reason: 'Lost in Transit - Auto Refund',
                    status: client_1.RefundStatus.PENDING,
                    refundNumber,
                    createdById: userId
                }
            });
            await tx.deliveryException.update({
                where: { id: exceptionId },
                data: {
                    resolved: true,
                    resolutionType: 'LOSS_REFUND',
                    resolvedBy: userId,
                    resolvedAt: new Date()
                }
            });
        });
    }
};
exports.CommercialSafetyService = CommercialSafetyService;
exports.CommercialSafetyService = CommercialSafetyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_safety_service_1.InventorySafetyService])
], CommercialSafetyService);
//# sourceMappingURL=commercial-safety.service.js.map