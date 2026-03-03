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
exports.SubstitutionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const audit_service_1 = require("../shared/audit.service");
const outbox_service_1 = require("../shared/outbox.service");
const fsm_guard_1 = require("../common/guards/fsm.guard");
const invariant_exception_1 = require("../common/exceptions/invariant.exception");
const translation_service_1 = require("../i18n/translation.service");
let SubstitutionService = class SubstitutionService {
    constructor(prisma, auditService, outbox, t) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.outbox = outbox;
        this.t = t;
    }
    async suggestSubstitution(tenantId, pickListItemId, substituteProductId, reason, userId, correlationId) {
        const item = await this.prisma.pickListItem.findUnique({
            where: { id: pickListItemId },
            include: { pickList: true, product: true },
        });
        if (!item)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'PickListItem' }));
        if (item.pickList.tenantId !== tenantId) {
            throw new common_1.BadRequestException(this.t.translate('errors.auth.forbidden', 'EN'));
        }
        if (item.status !== client_1.PickListItemStatus.SHORTAGE) {
            throw new invariant_exception_1.InvariantException('SUB-01', this.t.translate('errors.warehouse.substitution_shortage_only', 'EN'), { status: item.status });
        }
        if (item.productId === substituteProductId) {
            throw new invariant_exception_1.InvariantException('SUB-02', this.t.translate('errors.warehouse.substitution_same_sku', 'EN'), {});
        }
        const subInventory = await this.prisma.inventory.findUnique({
            where: { branchId_productId: { branchId: item.pickList.branchId, productId: substituteProductId } },
            include: { product: true },
        });
        if (!subInventory || subInventory.quantity - subInventory.allocated < item.requiredQty) {
            throw new invariant_exception_1.InvariantException('SUB-03', this.t.translate('errors.inventory.insufficient_stock', 'EN', { product: substituteProductId, available: String(subInventory ? subInventory.quantity - subInventory.allocated : 0), requested: String(item.requiredQty) }), {
                available: subInventory ? subInventory.quantity - subInventory.allocated : 0,
                required: item.requiredQty,
            });
        }
        const originalPrice = await this.prisma.inventory.findUnique({
            where: { branchId_productId: { branchId: item.pickList.branchId, productId: item.productId } },
        });
        const priceDelta = Number(subInventory.sellingPrice) - Number((originalPrice === null || originalPrice === void 0 ? void 0 : originalPrice.sellingPrice) || 0);
        const existing = await this.prisma.shortageSubstitution.findUnique({
            where: { pickListItemId },
        });
        if (existing && existing.status === client_1.SubstitutionStatus.PENDING) {
            throw new common_1.BadRequestException(this.t.translate('errors.warehouse.substitution_pending', 'EN'));
        }
        return this.prisma.$transaction(async (tx) => {
            const sub = await tx.shortageSubstitution.create({
                data: {
                    tenantId, pickListItemId,
                    originalProductId: item.productId,
                    substituteProductId, requestedBy: userId,
                    priceDelta, reason,
                },
            });
            await this.auditService.logAction(tenantId, userId, 'SUGGEST_SUBSTITUTION', 'ShortageSubstitution', sub.id, { originalProductId: item.productId }, { substituteProductId, priceDelta }, correlationId, undefined, tx);
            return sub;
        });
    }
    async approveSubstitution(tenantId, substitutionId, userId, correlationId) {
        const sub = await this.prisma.shortageSubstitution.findUnique({
            where: { id: substitutionId },
        });
        if (!sub)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Substitution' }));
        if (sub.tenantId !== tenantId)
            throw new common_1.BadRequestException(this.t.translate('errors.auth.forbidden', 'EN'));
        (0, fsm_guard_1.assertTransition)('ShortageSubstitution', substitutionId, sub.status, client_1.SubstitutionStatus.APPROVED, fsm_guard_1.SUBSTITUTION_TRANSITIONS);
        return this.prisma.$transaction(async (tx) => {
            const result = await tx.shortageSubstitution.updateMany({
                where: { id: substitutionId, version: sub.version },
                data: {
                    status: client_1.SubstitutionStatus.APPROVED,
                    approvedBy: userId,
                    respondedAt: new Date(),
                    version: { increment: 1 },
                },
            });
            if (result.count === 0)
                throw new Error('CONCURRENCY_CONFLICT');
            await tx.pickListItem.update({
                where: { id: sub.pickListItemId },
                data: {
                    productId: sub.substituteProductId,
                    pickedQty: (await tx.pickListItem.findUnique({ where: { id: sub.pickListItemId } })).requiredQty,
                    status: client_1.PickListItemStatus.PICKED,
                },
            });
            if (Number(sub.priceDelta) !== 0) {
                const pickItem = await tx.pickListItem.findUnique({
                    where: { id: sub.pickListItemId },
                    include: { pickList: { include: { order: { include: { items: true } } } } },
                });
                if (pickItem === null || pickItem === void 0 ? void 0 : pickItem.pickList.order) {
                    const orderItem = pickItem.pickList.order.items.find(oi => oi.productId === sub.originalProductId);
                    if (orderItem) {
                        const newPrice = Number(orderItem.unitPrice) + Number(sub.priceDelta);
                        await tx.orderItem.update({
                            where: { id: orderItem.id },
                            data: { productId: sub.substituteProductId, unitPrice: newPrice > 0 ? newPrice : orderItem.unitPrice },
                        });
                    }
                }
            }
            await this.outbox.schedule(tx, {
                tenantId, topic: 'warehouse.substitution.approved',
                payload: { substitutionId, pickListItemId: sub.pickListItemId },
                correlationId,
            });
            await this.auditService.logAction(tenantId, userId, 'APPROVE_SUBSTITUTION', 'ShortageSubstitution', substitutionId, { status: sub.status }, { status: client_1.SubstitutionStatus.APPROVED }, correlationId, undefined, tx);
            return tx.shortageSubstitution.findUnique({ where: { id: substitutionId } });
        });
    }
    async rejectSubstitution(tenantId, substitutionId, userId, correlationId) {
        const sub = await this.prisma.shortageSubstitution.findUnique({ where: { id: substitutionId } });
        if (!sub)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Substitution' }));
        if (sub.tenantId !== tenantId)
            throw new common_1.BadRequestException(this.t.translate('errors.auth.forbidden', 'EN'));
        (0, fsm_guard_1.assertTransition)('ShortageSubstitution', substitutionId, sub.status, client_1.SubstitutionStatus.REJECTED, fsm_guard_1.SUBSTITUTION_TRANSITIONS);
        const result = await this.prisma.shortageSubstitution.updateMany({
            where: { id: substitutionId, version: sub.version },
            data: { status: client_1.SubstitutionStatus.REJECTED, respondedAt: new Date(), version: { increment: 1 } },
        });
        if (result.count === 0)
            throw new Error('CONCURRENCY_CONFLICT');
        await this.auditService.logAction(tenantId, userId, 'REJECT_SUBSTITUTION', 'ShortageSubstitution', substitutionId, { status: sub.status }, { status: client_1.SubstitutionStatus.REJECTED }, correlationId);
        return this.prisma.shortageSubstitution.findUnique({ where: { id: substitutionId } });
    }
    async findByPickList(tenantId, pickListId) {
        return this.prisma.shortageSubstitution.findMany({
            where: {
                tenantId,
                pickListItemId: {
                    in: (await this.prisma.pickListItem.findMany({
                        where: { pickListId },
                        select: { id: true },
                    })).map(i => i.id),
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.SubstitutionService = SubstitutionService;
exports.SubstitutionService = SubstitutionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        outbox_service_1.OutboxService,
        translation_service_1.TranslationService])
], SubstitutionService);
//# sourceMappingURL=substitution.service.js.map