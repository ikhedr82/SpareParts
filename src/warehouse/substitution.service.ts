import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PickListItemStatus, SubstitutionStatus } from '@prisma/client';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
import { assertTransition, SUBSTITUTION_TRANSITIONS } from '../common/guards/fsm.guard';
import { InvariantException } from '../common/exceptions/invariant.exception';
import { TranslationService } from '../i18n/translation.service';

@Injectable()
export class SubstitutionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditService: AuditService,
        private readonly outbox: OutboxService,
        private readonly t: TranslationService,
    ) { }

    /**
     * Suggest a substitute SKU for a shortage pick list item.
     */
    async suggestSubstitution(
        tenantId: string, pickListItemId: string,
        substituteProductId: string, reason: string,
        userId: string, correlationId?: string,
    ) {
        const item = await this.prisma.pickListItem.findUnique({
            where: { id: pickListItemId },
            include: { pickList: true, product: true },
        });

        if (!item) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'PickListItem' }));
        if (item.pickList.tenantId !== tenantId) {
            throw new BadRequestException(this.t.translate('errors.auth.forbidden', 'EN'));
        }

        // Invariant: must be SHORTAGE
        if (item.status !== PickListItemStatus.SHORTAGE) {
            throw new InvariantException('SUB-01', this.t.translate('errors.warehouse.substitution_shortage_only', 'EN'), { status: item.status });
        }

        // Invariant: cannot substitute with same SKU
        if (item.productId === substituteProductId) {
            throw new InvariantException('SUB-02', this.t.translate('errors.warehouse.substitution_same_sku', 'EN'), {});
        }

        // Validate substitute exists in branch inventory with sufficient stock
        const subInventory = await this.prisma.inventory.findUnique({
            where: { branchId_productId: { branchId: item.pickList.branchId, productId: substituteProductId } },
            include: { product: true },
        });

        if (!subInventory || subInventory.quantity - subInventory.allocated < item.requiredQty) {
            throw new InvariantException('SUB-03', this.t.translate('errors.inventory.insufficient_stock', 'EN', { product: substituteProductId, available: String(subInventory ? subInventory.quantity - subInventory.allocated : 0), requested: String(item.requiredQty) }), {
                available: subInventory ? subInventory.quantity - subInventory.allocated : 0,
                required: item.requiredQty,
            });
        }

        // Calculate price delta
        const originalPrice = await this.prisma.inventory.findUnique({
            where: { branchId_productId: { branchId: item.pickList.branchId, productId: item.productId } },
        });
        const priceDelta = Number(subInventory.sellingPrice) - Number(originalPrice?.sellingPrice || 0);

        // Check existing pending substitution
        const existing = await this.prisma.shortageSubstitution.findUnique({
            where: { pickListItemId },
        });
        if (existing && existing.status === SubstitutionStatus.PENDING) {
            throw new BadRequestException(this.t.translate('errors.warehouse.substitution_pending', 'EN'));
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

            await this.auditService.logAction(
                tenantId, userId, 'SUGGEST_SUBSTITUTION', 'ShortageSubstitution', sub.id,
                { originalProductId: item.productId },
                { substituteProductId, priceDelta },
                correlationId, undefined, tx as any,
            );

            return sub;
        });
    }

    /**
     * Approve substitution: swap product on pick list item + adjust pricing.
     */
    async approveSubstitution(
        tenantId: string, substitutionId: string,
        userId: string, correlationId?: string,
    ) {
        const sub = await this.prisma.shortageSubstitution.findUnique({
            where: { id: substitutionId },
        });

        if (!sub) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Substitution' }));
        if (sub.tenantId !== tenantId) throw new BadRequestException(this.t.translate('errors.auth.forbidden', 'EN'));

        assertTransition('ShortageSubstitution', substitutionId, sub.status, SubstitutionStatus.APPROVED, SUBSTITUTION_TRANSITIONS);

        return this.prisma.$transaction(async (tx) => {
            // Update substitution status
            const result = await tx.shortageSubstitution.updateMany({
                where: { id: substitutionId, version: sub.version },
                data: {
                    status: SubstitutionStatus.APPROVED,
                    approvedBy: userId,
                    respondedAt: new Date(),
                    version: { increment: 1 },
                },
            });
            if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

            // Swap product on pick list item and mark as PICKED
            await tx.pickListItem.update({
                where: { id: sub.pickListItemId },
                data: {
                    productId: sub.substituteProductId,
                    pickedQty: (await tx.pickListItem.findUnique({ where: { id: sub.pickListItemId } }))!.requiredQty,
                    status: PickListItemStatus.PICKED,
                },
            });

            // Adjust order item pricing if price differs
            if (Number(sub.priceDelta) !== 0) {
                const pickItem = await tx.pickListItem.findUnique({
                    where: { id: sub.pickListItemId },
                    include: { pickList: { include: { order: { include: { items: true } } } } },
                });

                if (pickItem?.pickList.order) {
                    const orderItem = pickItem.pickList.order.items.find(
                        oi => oi.productId === sub.originalProductId,
                    );
                    if (orderItem) {
                        const newPrice = Number(orderItem.unitPrice) + Number(sub.priceDelta);
                        await tx.orderItem.update({
                            where: { id: orderItem.id },
                            data: { productId: sub.substituteProductId, unitPrice: newPrice > 0 ? newPrice : orderItem.unitPrice },
                        });
                    }
                }
            }

            await this.outbox.schedule(tx as any, {
                tenantId, topic: 'warehouse.substitution.approved',
                payload: { substitutionId, pickListItemId: sub.pickListItemId },
                correlationId,
            });

            await this.auditService.logAction(
                tenantId, userId, 'APPROVE_SUBSTITUTION', 'ShortageSubstitution', substitutionId,
                { status: sub.status }, { status: SubstitutionStatus.APPROVED },
                correlationId, undefined, tx as any,
            );

            return tx.shortageSubstitution.findUnique({ where: { id: substitutionId } });
        });
    }

    async rejectSubstitution(tenantId: string, substitutionId: string, userId: string, correlationId?: string) {
        const sub = await this.prisma.shortageSubstitution.findUnique({ where: { id: substitutionId } });
        if (!sub) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Substitution' }));
        if (sub.tenantId !== tenantId) throw new BadRequestException(this.t.translate('errors.auth.forbidden', 'EN'));

        assertTransition('ShortageSubstitution', substitutionId, sub.status, SubstitutionStatus.REJECTED, SUBSTITUTION_TRANSITIONS);

        const result = await this.prisma.shortageSubstitution.updateMany({
            where: { id: substitutionId, version: sub.version },
            data: { status: SubstitutionStatus.REJECTED, respondedAt: new Date(), version: { increment: 1 } },
        });
        if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

        await this.auditService.logAction(
            tenantId, userId, 'REJECT_SUBSTITUTION', 'ShortageSubstitution', substitutionId,
            { status: sub.status }, { status: SubstitutionStatus.REJECTED }, correlationId,
        );

        return this.prisma.shortageSubstitution.findUnique({ where: { id: substitutionId } });
    }

    async findByPickList(tenantId: string, pickListId: string) {
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
}
