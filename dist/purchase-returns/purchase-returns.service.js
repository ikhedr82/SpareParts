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
exports.PurchaseReturnsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../shared/audit.service");
const outbox_service_1 = require("../shared/outbox.service");
const fsm_guard_1 = require("../common/guards/fsm.guard");
const translation_service_1 = require("../i18n/translation.service");
let PurchaseReturnsService = class PurchaseReturnsService {
    constructor(prisma, auditService, outbox, t) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.outbox = outbox;
        this.t = t;
    }
    async createReturn(tenantId, userId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const po = await tx.purchaseOrder.findUnique({
                where: { id: dto.purchaseOrderId },
                include: { items: true, receipts: { include: { items: true } } },
            });
            if (!po || po.tenantId !== tenantId) {
                throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Purchase Order' }));
            }
            if (po.status !== 'RECEIVED' && po.status !== 'PARTIALLY_RECEIVED') {
                throw new common_1.BadRequestException(this.t.translate('errors.procurement.po_not_received', 'EN'));
            }
            let totalValue = 0;
            for (const item of dto.items) {
                const receivedQty = po.receipts.reduce((acc, receipt) => {
                    const validItem = receipt.items.find((ri) => ri.productId === item.productId);
                    return acc + (validItem ? validItem.quantity : 0);
                }, 0);
                const previouslyReturned = await tx.purchaseReturnItem.aggregate({
                    where: {
                        purchaseReturn: { purchaseOrderId: dto.purchaseOrderId },
                        productId: item.productId,
                    },
                    _sum: { quantity: true },
                });
                const returnedQty = previouslyReturned._sum.quantity || 0;
                const remainingQty = receivedQty - returnedQty;
                if (item.quantity > remainingQty) {
                    throw new common_1.BadRequestException(this.t.translate('errors.inventory.insufficient_stock', 'EN', { product: item.productId, available: String(remainingQty), requested: String(item.quantity) }));
                }
                const poItem = po.items.find(poi => poi.productId === item.productId);
                const unitCost = poItem ? Number(poItem.unitCost) : 0;
                totalValue += item.quantity * unitCost;
                const inventory = await tx.inventory.findUnique({
                    where: { branchId_productId: { branchId: po.branchId, productId: item.productId } }
                });
                if (!inventory || inventory.quantity < item.quantity) {
                    throw new common_1.ConflictException(this.t.translate('errors.inventory.insufficient_stock', 'EN', { product: item.productId, available: String((inventory === null || inventory === void 0 ? void 0 : inventory.quantity) || 0), requested: String(item.quantity) }));
                }
            }
            const purchaseReturn = await tx.purchaseReturn.create({
                data: {
                    tenantId,
                    purchaseOrderId: dto.purchaseOrderId,
                    status: 'REQUESTED',
                    createdById: userId,
                    totalValue: totalValue,
                    items: {
                        create: dto.items.map((i) => ({
                            productId: i.productId,
                            quantity: i.quantity,
                            reason: i.reason,
                        })),
                    },
                },
                include: { items: true },
            });
            for (const item of dto.items) {
                await tx.inventory.update({
                    where: { branchId_productId: { branchId: po.branchId, productId: item.productId } },
                    data: { quantity: { decrement: item.quantity } },
                });
                await tx.inventoryLedger.create({
                    data: {
                        tenantId,
                        branchId: po.branchId,
                        productId: item.productId,
                        type: 'RETURN',
                        quantityChange: -item.quantity,
                        costPrice: 0,
                        referenceType: 'RETURN',
                        referenceId: purchaseReturn.id,
                        userId,
                    },
                });
            }
            await this.auditService.logAction(tenantId, userId, 'CREATE_PURCHASE_RETURN', 'PurchaseReturn', purchaseReturn.id, null, purchaseReturn, undefined, undefined, tx);
            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'purchase-return.created',
                payload: { returnId: purchaseReturn.id, tenantId },
            });
            return purchaseReturn;
        });
    }
    async approveReturn(tenantId, userId, returnId) {
        return this.prisma.$transaction(async (tx) => {
            const ret = await tx.purchaseReturn.findFirst({
                where: { id: returnId, tenantId },
            });
            if (!ret)
                throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Purchase return' }));
            (0, fsm_guard_1.assertTransition)('PurchaseReturn', returnId, ret.status, 'APPROVED', fsm_guard_1.PURCHASE_RETURN_TRANSITIONS);
            const updated = await tx.purchaseReturn.update({
                where: { id: returnId },
                data: { status: 'APPROVED' },
            });
            await this.auditService.logAction(tenantId, userId, 'APPROVE_PURCHASE_RETURN', 'PurchaseReturn', returnId, { status: ret.status }, { status: 'APPROVED' }, undefined, undefined, tx);
            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'purchase-return.approved',
                payload: { returnId, tenantId },
            });
            return updated;
        });
    }
    async rejectReturn(tenantId, userId, returnId, reason) {
        return this.prisma.$transaction(async (tx) => {
            const ret = await tx.purchaseReturn.findFirst({
                where: { id: returnId, tenantId },
                include: { items: true, purchaseOrder: true },
            });
            if (!ret)
                throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Purchase return' }));
            if (ret.status !== 'REQUESTED') {
                throw new common_1.BadRequestException(this.t.translate('errors.fsm.invalid_transition', 'EN', { entity: 'Purchase return', from: ret.status, to: 'REJECTED' }));
            }
            for (const item of ret.items) {
                await tx.inventory.update({
                    where: {
                        branchId_productId: {
                            branchId: ret.purchaseOrder.branchId,
                            productId: item.productId,
                        },
                    },
                    data: { quantity: { increment: item.quantity } },
                });
                await tx.inventoryLedger.create({
                    data: {
                        tenantId,
                        branchId: ret.purchaseOrder.branchId,
                        productId: item.productId,
                        type: 'ADJUSTMENT',
                        quantityChange: item.quantity,
                        costPrice: 0,
                        referenceType: 'RETURN',
                        referenceId: returnId,
                        userId,
                    },
                });
            }
            const updated = await tx.purchaseReturn.update({
                where: { id: returnId },
                data: {
                    status: 'REJECTED',
                    rejectionReason: reason,
                },
            });
            await this.auditService.logAction(tenantId, userId, 'REJECT_PURCHASE_RETURN', 'PurchaseReturn', returnId, { status: 'REQUESTED' }, { status: 'REJECTED', reason }, undefined, undefined, tx);
            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'purchase-return.rejected',
                payload: { returnId, tenantId, reason },
            });
            return updated;
        });
    }
    async shipReturn(tenantId, userId, returnId) {
        return this.prisma.$transaction(async (tx) => {
            const ret = await tx.purchaseReturn.findFirst({
                where: { id: returnId, tenantId },
            });
            if (!ret)
                throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Purchase return' }));
            if (ret.status !== 'APPROVED') {
                throw new common_1.BadRequestException(this.t.translate('errors.fsm.invalid_transition', 'EN', { entity: 'Purchase return', from: ret.status, to: 'SHIPPED' }));
            }
            const updated = await tx.purchaseReturn.update({
                where: { id: returnId },
                data: { status: 'SHIPPED' },
            });
            await this.auditService.logAction(tenantId, userId, 'SHIP_PURCHASE_RETURN', 'PurchaseReturn', returnId, { status: 'APPROVED' }, { status: 'SHIPPED' }, undefined, undefined, tx);
            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'purchase-return.shipped',
                payload: { returnId, tenantId },
            });
            return updated;
        });
    }
    async completeReturn(tenantId, userId, returnId) {
        return this.prisma.$transaction(async (tx) => {
            const ret = await tx.purchaseReturn.findFirst({
                where: { id: returnId, tenantId },
            });
            if (!ret)
                throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Purchase return' }));
            if (ret.status !== 'SHIPPED') {
                throw new common_1.BadRequestException(this.t.translate('errors.fsm.invalid_transition', 'EN', { entity: 'Purchase return', from: ret.status, to: 'COMPLETED' }));
            }
            const updated = await tx.purchaseReturn.update({
                where: { id: returnId },
                data: { status: 'COMPLETED' },
            });
            await this.auditService.logAction(tenantId, userId, 'COMPLETE_PURCHASE_RETURN', 'PurchaseReturn', returnId, { status: 'SHIPPED' }, { status: 'COMPLETED' }, undefined, undefined, tx);
            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'purchase-return.completed',
                payload: { returnId, tenantId },
            });
            return updated;
        });
    }
    async findOne(tenantId, returnId) {
        const ret = await this.prisma.purchaseReturn.findFirst({
            where: { id: returnId, tenantId },
            include: { items: { include: { product: true } }, purchaseOrder: true },
        });
        if (!ret)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Purchase return' }));
        return ret;
    }
    async findAll(tenantId) {
        return this.prisma.purchaseReturn.findMany({
            where: { tenantId },
            include: { items: true, purchaseOrder: { select: { id: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.PurchaseReturnsService = PurchaseReturnsService;
exports.PurchaseReturnsService = PurchaseReturnsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        outbox_service_1.OutboxService,
        translation_service_1.TranslationService])
], PurchaseReturnsService);
//# sourceMappingURL=purchase-returns.service.js.map