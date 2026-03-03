import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../shared/audit.service';
import { EventBus } from '../shared/event-bus.service';
import { OutboxService } from '../shared/outbox.service';
import { assertTransition, PURCHASE_RETURN_TRANSITIONS } from '../common/guards/fsm.guard';
import { CreatePurchaseReturnDto } from './dtos/create-return.dto';
import { TranslationService } from '../i18n/translation.service';

@Injectable()
export class PurchaseReturnsService {
    constructor(
        private prisma: PrismaService,
        private auditService: AuditService,
        private outbox: OutboxService,
        private t: TranslationService,
    ) { }

    async createReturn(tenantId: string, userId: string, dto: CreatePurchaseReturnDto) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Validate Purchase Order
            const po = await tx.purchaseOrder.findUnique({
                where: { id: dto.purchaseOrderId },
                include: { items: true, receipts: { include: { items: true } } },
            });

            if (!po || po.tenantId !== tenantId) {
                throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Purchase Order' }));
            }

            if (po.status !== 'RECEIVED' && po.status !== 'PARTIALLY_RECEIVED') {
                throw new BadRequestException(this.t.translate('errors.procurement.po_not_received', 'EN'));
            }

            // 2. Validate Items & Quantities
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
                    throw new BadRequestException(this.t.translate('errors.inventory.insufficient_stock', 'EN', { product: item.productId, available: String(remainingQty), requested: String(item.quantity) }));
                }

                const poItem = po.items.find(poi => poi.productId === item.productId);
                const unitCost = poItem ? Number(poItem.unitCost) : 0;
                totalValue += item.quantity * unitCost;

                // 3. Invariants Check: Inventory Availability
                const inventory = await tx.inventory.findUnique({
                    where: { branchId_productId: { branchId: po.branchId, productId: item.productId } }
                });

                if (!inventory || inventory.quantity < item.quantity) {
                    throw new ConflictException(this.t.translate('errors.inventory.insufficient_stock', 'EN', { product: item.productId, available: String(inventory?.quantity || 0), requested: String(item.quantity) }));
                }
            }

            // 4. Create Return Record (REQUESTED status)
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

            // 5. Update Inventory (Reduction)
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

            // 6. Audit & Events
            await this.auditService.logAction(
                tenantId,
                userId,
                'CREATE_PURCHASE_RETURN',
                'PurchaseReturn',
                purchaseReturn.id,
                null,
                purchaseReturn,
                undefined,
                undefined,
                tx,
            );

            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'purchase-return.created',
                payload: { returnId: purchaseReturn.id, tenantId },
            });

            return purchaseReturn;
        });
    }

    // ─── G-05: Approve RTV (REQUESTED → APPROVED) ──────────────────────────────
    async approveReturn(tenantId: string, userId: string, returnId: string) {
        return this.prisma.$transaction(async (tx) => {
            const ret = await tx.purchaseReturn.findFirst({
                where: { id: returnId, tenantId },
            });
            if (!ret) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Purchase return' }));
            // ✅ G-08: FSM Guard
            assertTransition('PurchaseReturn', returnId, ret.status, 'APPROVED', PURCHASE_RETURN_TRANSITIONS);

            const updated = await tx.purchaseReturn.update({
                where: { id: returnId },
                data: { status: 'APPROVED' },
            });

            await this.auditService.logAction(
                tenantId,
                userId,
                'APPROVE_PURCHASE_RETURN',
                'PurchaseReturn',
                returnId,
                { status: ret.status },
                { status: 'APPROVED' },
                undefined,
                undefined,
                tx,
            );

            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'purchase-return.approved',
                payload: { returnId, tenantId },
            });

            return updated;
        });
    }

    // ─── G-05: Reject RTV (REQUESTED → REJECTED) + Reverse Inventory ──────────
    async rejectReturn(tenantId: string, userId: string, returnId: string, reason: string) {
        return this.prisma.$transaction(async (tx) => {
            const ret = await tx.purchaseReturn.findFirst({
                where: { id: returnId, tenantId },
                include: { items: true, purchaseOrder: true },
            });
            if (!ret) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Purchase return' }));
            if (ret.status !== 'REQUESTED') {
                throw new BadRequestException(this.t.translate('errors.fsm.invalid_transition', 'EN', { entity: 'Purchase return', from: ret.status, to: 'REJECTED' }));
            }

            // Reverse inventory: items were decremented on create, so restore them
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
                } as any,
            });

            await this.auditService.logAction(
                tenantId,
                userId,
                'REJECT_PURCHASE_RETURN',
                'PurchaseReturn',
                returnId,
                { status: 'REQUESTED' },
                { status: 'REJECTED', reason },
                undefined,
                undefined,
                tx,
            );

            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'purchase-return.rejected',
                payload: { returnId, tenantId, reason },
            });
            return updated;
        });
    }

    // ─── G-05: Mark as Shipped (APPROVED → SHIPPED) ────────────────────────────
    async shipReturn(tenantId: string, userId: string, returnId: string) {
        return this.prisma.$transaction(async (tx) => {
            const ret = await tx.purchaseReturn.findFirst({
                where: { id: returnId, tenantId },
            });
            if (!ret) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Purchase return' }));
            if (ret.status !== 'APPROVED') {
                throw new BadRequestException(this.t.translate('errors.fsm.invalid_transition', 'EN', { entity: 'Purchase return', from: ret.status, to: 'SHIPPED' }));
            }

            const updated = await tx.purchaseReturn.update({
                where: { id: returnId },
                data: { status: 'SHIPPED' },
            });

            await this.auditService.logAction(
                tenantId,
                userId,
                'SHIP_PURCHASE_RETURN',
                'PurchaseReturn',
                returnId,
                { status: 'APPROVED' },
                { status: 'SHIPPED' },
                undefined,
                undefined,
                tx,
            );

            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'purchase-return.shipped',
                payload: { returnId, tenantId },
            });

            return updated;
        });
    }

    // ─── G-05: Complete RTV (SHIPPED → COMPLETED) ──────────────────────────────
    async completeReturn(tenantId: string, userId: string, returnId: string) {
        return this.prisma.$transaction(async (tx) => {
            const ret = await tx.purchaseReturn.findFirst({
                where: { id: returnId, tenantId },
            });
            if (!ret) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Purchase return' }));
            if (ret.status !== 'SHIPPED') {
                throw new BadRequestException(this.t.translate('errors.fsm.invalid_transition', 'EN', { entity: 'Purchase return', from: ret.status, to: 'COMPLETED' }));
            }

            const updated = await tx.purchaseReturn.update({
                where: { id: returnId },
                data: { status: 'COMPLETED' },
            });

            await this.auditService.logAction(
                tenantId,
                userId,
                'COMPLETE_PURCHASE_RETURN',
                'PurchaseReturn',
                returnId,
                { status: 'SHIPPED' },
                { status: 'COMPLETED' },
                undefined,
                undefined,
                tx,
            );

            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'purchase-return.completed',
                payload: { returnId, tenantId },
            });

            return updated;
        });
    }

    async findOne(tenantId: string, returnId: string) {
        const ret = await this.prisma.purchaseReturn.findFirst({
            where: { id: returnId, tenantId },
            include: { items: { include: { product: true } }, purchaseOrder: true },
        });
        if (!ret) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Purchase return' }));
        return ret;
    }

    async findAll(tenantId: string) {
        return this.prisma.purchaseReturn.findMany({
            where: { tenantId },
            include: { items: true, purchaseOrder: { select: { id: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
}
