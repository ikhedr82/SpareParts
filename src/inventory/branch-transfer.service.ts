import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BranchTransferStatus } from '@prisma/client';
import { InventoryLedgerService } from './inventory-ledger.service';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
import { assertTransition, BRANCH_TRANSFER_TRANSITIONS } from '../common/guards/fsm.guard';
import { InvariantException } from '../common/exceptions/invariant.exception';

@Injectable()
export class BranchTransferService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly ledger: InventoryLedgerService,
        private readonly auditService: AuditService,
        private readonly outbox: OutboxService,
    ) { }

    async createTransfer(
        tenantId: string, userId: string,
        dto: { sourceBranchId: string; destBranchId: string; notes?: string; items: { productId: string; quantity: number }[] },
        correlationId?: string,
    ) {
        if (dto.sourceBranchId === dto.destBranchId) {
            throw new BadRequestException('Source and destination branches must differ');
        }

        // Validate both branches belong to tenant
        const [source, dest] = await Promise.all([
            this.prisma.branch.findFirst({ where: { id: dto.sourceBranchId, tenantId } }),
            this.prisma.branch.findFirst({ where: { id: dto.destBranchId, tenantId } }),
        ]);
        if (!source) throw new NotFoundException('Source branch not found');
        if (!dest) throw new NotFoundException('Destination branch not found');

        // Validate stock availability
        for (const item of dto.items) {
            const inv = await this.prisma.inventory.findUnique({
                where: { branchId_productId: { branchId: dto.sourceBranchId, productId: item.productId } },
            });
            if (!inv || inv.quantity - inv.allocated < item.quantity) {
                throw new InvariantException('BT-01', `Insufficient available stock for product ${item.productId}`, {
                    available: inv ? inv.quantity - inv.allocated : 0, requested: item.quantity,
                });
            }
        }

        return this.prisma.$transaction(async (tx) => {
            const transfer = await tx.branchTransfer.create({
                data: {
                    tenantId, sourceBranchId: dto.sourceBranchId, destBranchId: dto.destBranchId,
                    requestedById: userId, notes: dto.notes,
                    items: { create: dto.items.map(i => ({ productId: i.productId, requestedQty: i.quantity })) },
                },
                include: { items: true },
            });

            await this.outbox.schedule(tx as any, {
                tenantId, topic: 'inventory.transfer.requested',
                payload: { transferId: transfer.id }, correlationId,
            });

            await this.auditService.logAction(
                tenantId, userId, 'CREATE_TRANSFER', 'BranchTransfer',
                transfer.id, null, { status: 'REQUESTED', items: dto.items },
                correlationId, undefined, tx as any,
            );

            return transfer;
        });
    }

    async approveTransfer(tenantId: string, transferId: string, userId: string, correlationId?: string) {
        const transfer = await this.prisma.branchTransfer.findFirst({ where: { id: transferId, tenantId } });
        if (!transfer) throw new NotFoundException('Transfer not found');

        assertTransition('BranchTransfer', transferId, transfer.status, BranchTransferStatus.APPROVED, BRANCH_TRANSFER_TRANSITIONS);

        return this.prisma.$transaction(async (tx) => {
            const result = await tx.branchTransfer.updateMany({
                where: { id: transferId, tenantId, version: transfer.version },
                data: { status: BranchTransferStatus.APPROVED, approvedById: userId, version: { increment: 1 } },
            });
            if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

            await this.outbox.schedule(tx as any, {
                tenantId, topic: 'inventory.transfer.approved',
                payload: { transferId }, correlationId,
            });

            await this.auditService.logAction(
                tenantId, userId, 'APPROVE_TRANSFER', 'BranchTransfer', transferId,
                { status: transfer.status }, { status: BranchTransferStatus.APPROVED },
                correlationId, undefined, tx as any,
            );

            return tx.branchTransfer.findUnique({ where: { id: transferId }, include: { items: true } });
        });
    }

    async shipTransfer(tenantId: string, transferId: string, userId: string, correlationId?: string) {
        const transfer = await this.prisma.branchTransfer.findFirst({
            where: { id: transferId, tenantId },
            include: { items: true },
        });
        if (!transfer) throw new NotFoundException('Transfer not found');

        assertTransition('BranchTransfer', transferId, transfer.status, BranchTransferStatus.SHIPPED, BRANCH_TRANSFER_TRANSITIONS);

        return this.prisma.$transaction(async (tx) => {
            // Deduct from source warehouse via ledger
            for (const item of transfer.items) {
                await this.ledger.recordTransaction({
                    tenantId, branchId: transfer.sourceBranchId,
                    productId: item.productId, type: 'TRANSFER_OUT',
                    quantityChange: -item.requestedQty,
                    referenceType: 'TRANSFER', referenceId: transfer.id, userId,
                }, tx as any);

                await tx.branchTransferItem.update({
                    where: { id: item.id },
                    data: { shippedQty: item.requestedQty },
                });
            }

            const result = await tx.branchTransfer.updateMany({
                where: { id: transferId, tenantId, version: transfer.version },
                data: { status: BranchTransferStatus.SHIPPED, shippedAt: new Date(), version: { increment: 1 } },
            });
            if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

            await this.outbox.schedule(tx as any, {
                tenantId, topic: 'inventory.transfer.shipped',
                payload: { transferId }, correlationId,
            });

            await this.auditService.logAction(
                tenantId, userId, 'SHIP_TRANSFER', 'BranchTransfer', transferId,
                { status: transfer.status }, { status: BranchTransferStatus.SHIPPED },
                correlationId, undefined, tx as any,
            );

            return tx.branchTransfer.findUnique({ where: { id: transferId }, include: { items: true } });
        });
    }

    async receiveTransfer(
        tenantId: string, transferId: string, userId: string,
        receivedItems: { itemId: string; receivedQty: number }[],
        correlationId?: string,
    ) {
        const transfer = await this.prisma.branchTransfer.findFirst({
            where: { id: transferId, tenantId },
            include: { items: true },
        });
        if (!transfer) throw new NotFoundException('Transfer not found');

        assertTransition('BranchTransfer', transferId, transfer.status, BranchTransferStatus.RECEIVED, BRANCH_TRANSFER_TRANSITIONS);

        // Invariant: cannot receive more than shipped
        for (const ri of receivedItems) {
            const item = transfer.items.find(i => i.id === ri.itemId);
            if (!item) throw new BadRequestException(`Transfer item ${ri.itemId} not found`);
            if (ri.receivedQty > item.shippedQty) {
                throw new InvariantException('BT-02', 'Cannot receive more than shipped', {
                    itemId: ri.itemId, shipped: item.shippedQty, received: ri.receivedQty,
                });
            }
        }

        return this.prisma.$transaction(async (tx) => {
            // Credit to destination warehouse via ledger
            for (const ri of receivedItems) {
                const item = transfer.items.find(i => i.id === ri.itemId)!;
                await this.ledger.recordTransaction({
                    tenantId, branchId: transfer.destBranchId,
                    productId: item.productId, type: 'TRANSFER_IN',
                    quantityChange: ri.receivedQty,
                    referenceType: 'TRANSFER', referenceId: transfer.id, userId,
                }, tx as any);

                await tx.branchTransferItem.update({
                    where: { id: ri.itemId },
                    data: { receivedQty: ri.receivedQty },
                });
            }

            const result = await tx.branchTransfer.updateMany({
                where: { id: transferId, tenantId, version: transfer.version },
                data: { status: BranchTransferStatus.RECEIVED, receivedAt: new Date(), version: { increment: 1 } },
            });
            if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

            await this.outbox.schedule(tx as any, {
                tenantId, topic: 'inventory.transfer.received',
                payload: { transferId }, correlationId,
            });

            await this.auditService.logAction(
                tenantId, userId, 'RECEIVE_TRANSFER', 'BranchTransfer', transferId,
                { status: transfer.status }, { status: BranchTransferStatus.RECEIVED },
                correlationId, undefined, tx as any,
            );

            return tx.branchTransfer.findUnique({ where: { id: transferId }, include: { items: true } });
        });
    }

    async findAll(tenantId: string, branchId?: string, status?: BranchTransferStatus) {
        return this.prisma.branchTransfer.findMany({
            where: {
                tenantId,
                ...(branchId && { OR: [{ sourceBranchId: branchId }, { destBranchId: branchId }] }),
                ...(status && { status }),
            },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(tenantId: string, transferId: string) {
        const transfer = await this.prisma.branchTransfer.findFirst({
            where: { id: transferId, tenantId },
            include: { items: true },
        });
        if (!transfer) throw new NotFoundException('Transfer not found');
        return transfer;
    }
}
