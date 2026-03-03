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
exports.BranchTransferService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const inventory_ledger_service_1 = require("./inventory-ledger.service");
const audit_service_1 = require("../shared/audit.service");
const outbox_service_1 = require("../shared/outbox.service");
const fsm_guard_1 = require("../common/guards/fsm.guard");
const invariant_exception_1 = require("../common/exceptions/invariant.exception");
let BranchTransferService = class BranchTransferService {
    constructor(prisma, ledger, auditService, outbox) {
        this.prisma = prisma;
        this.ledger = ledger;
        this.auditService = auditService;
        this.outbox = outbox;
    }
    async createTransfer(tenantId, userId, dto, correlationId) {
        if (dto.sourceBranchId === dto.destBranchId) {
            throw new common_1.BadRequestException('Source and destination branches must differ');
        }
        const [source, dest] = await Promise.all([
            this.prisma.branch.findFirst({ where: { id: dto.sourceBranchId, tenantId } }),
            this.prisma.branch.findFirst({ where: { id: dto.destBranchId, tenantId } }),
        ]);
        if (!source)
            throw new common_1.NotFoundException('Source branch not found');
        if (!dest)
            throw new common_1.NotFoundException('Destination branch not found');
        for (const item of dto.items) {
            const inv = await this.prisma.inventory.findUnique({
                where: { branchId_productId: { branchId: dto.sourceBranchId, productId: item.productId } },
            });
            if (!inv || inv.quantity - inv.allocated < item.quantity) {
                throw new invariant_exception_1.InvariantException('BT-01', `Insufficient available stock for product ${item.productId}`, {
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
            await this.outbox.schedule(tx, {
                tenantId, topic: 'inventory.transfer.requested',
                payload: { transferId: transfer.id }, correlationId,
            });
            await this.auditService.logAction(tenantId, userId, 'CREATE_TRANSFER', 'BranchTransfer', transfer.id, null, { status: 'REQUESTED', items: dto.items }, correlationId, undefined, tx);
            return transfer;
        });
    }
    async approveTransfer(tenantId, transferId, userId, correlationId) {
        const transfer = await this.prisma.branchTransfer.findFirst({ where: { id: transferId, tenantId } });
        if (!transfer)
            throw new common_1.NotFoundException('Transfer not found');
        (0, fsm_guard_1.assertTransition)('BranchTransfer', transferId, transfer.status, client_1.BranchTransferStatus.APPROVED, fsm_guard_1.BRANCH_TRANSFER_TRANSITIONS);
        return this.prisma.$transaction(async (tx) => {
            const result = await tx.branchTransfer.updateMany({
                where: { id: transferId, tenantId, version: transfer.version },
                data: { status: client_1.BranchTransferStatus.APPROVED, approvedById: userId, version: { increment: 1 } },
            });
            if (result.count === 0)
                throw new Error('CONCURRENCY_CONFLICT');
            await this.outbox.schedule(tx, {
                tenantId, topic: 'inventory.transfer.approved',
                payload: { transferId }, correlationId,
            });
            await this.auditService.logAction(tenantId, userId, 'APPROVE_TRANSFER', 'BranchTransfer', transferId, { status: transfer.status }, { status: client_1.BranchTransferStatus.APPROVED }, correlationId, undefined, tx);
            return tx.branchTransfer.findUnique({ where: { id: transferId }, include: { items: true } });
        });
    }
    async shipTransfer(tenantId, transferId, userId, correlationId) {
        const transfer = await this.prisma.branchTransfer.findFirst({
            where: { id: transferId, tenantId },
            include: { items: true },
        });
        if (!transfer)
            throw new common_1.NotFoundException('Transfer not found');
        (0, fsm_guard_1.assertTransition)('BranchTransfer', transferId, transfer.status, client_1.BranchTransferStatus.SHIPPED, fsm_guard_1.BRANCH_TRANSFER_TRANSITIONS);
        return this.prisma.$transaction(async (tx) => {
            for (const item of transfer.items) {
                await this.ledger.recordTransaction({
                    tenantId, branchId: transfer.sourceBranchId,
                    productId: item.productId, type: 'TRANSFER_OUT',
                    quantityChange: -item.requestedQty,
                    referenceType: 'TRANSFER', referenceId: transfer.id, userId,
                }, tx);
                await tx.branchTransferItem.update({
                    where: { id: item.id },
                    data: { shippedQty: item.requestedQty },
                });
            }
            const result = await tx.branchTransfer.updateMany({
                where: { id: transferId, tenantId, version: transfer.version },
                data: { status: client_1.BranchTransferStatus.SHIPPED, shippedAt: new Date(), version: { increment: 1 } },
            });
            if (result.count === 0)
                throw new Error('CONCURRENCY_CONFLICT');
            await this.outbox.schedule(tx, {
                tenantId, topic: 'inventory.transfer.shipped',
                payload: { transferId }, correlationId,
            });
            await this.auditService.logAction(tenantId, userId, 'SHIP_TRANSFER', 'BranchTransfer', transferId, { status: transfer.status }, { status: client_1.BranchTransferStatus.SHIPPED }, correlationId, undefined, tx);
            return tx.branchTransfer.findUnique({ where: { id: transferId }, include: { items: true } });
        });
    }
    async receiveTransfer(tenantId, transferId, userId, receivedItems, correlationId) {
        const transfer = await this.prisma.branchTransfer.findFirst({
            where: { id: transferId, tenantId },
            include: { items: true },
        });
        if (!transfer)
            throw new common_1.NotFoundException('Transfer not found');
        (0, fsm_guard_1.assertTransition)('BranchTransfer', transferId, transfer.status, client_1.BranchTransferStatus.RECEIVED, fsm_guard_1.BRANCH_TRANSFER_TRANSITIONS);
        for (const ri of receivedItems) {
            const item = transfer.items.find(i => i.id === ri.itemId);
            if (!item)
                throw new common_1.BadRequestException(`Transfer item ${ri.itemId} not found`);
            if (ri.receivedQty > item.shippedQty) {
                throw new invariant_exception_1.InvariantException('BT-02', 'Cannot receive more than shipped', {
                    itemId: ri.itemId, shipped: item.shippedQty, received: ri.receivedQty,
                });
            }
        }
        return this.prisma.$transaction(async (tx) => {
            for (const ri of receivedItems) {
                const item = transfer.items.find(i => i.id === ri.itemId);
                await this.ledger.recordTransaction({
                    tenantId, branchId: transfer.destBranchId,
                    productId: item.productId, type: 'TRANSFER_IN',
                    quantityChange: ri.receivedQty,
                    referenceType: 'TRANSFER', referenceId: transfer.id, userId,
                }, tx);
                await tx.branchTransferItem.update({
                    where: { id: ri.itemId },
                    data: { receivedQty: ri.receivedQty },
                });
            }
            const result = await tx.branchTransfer.updateMany({
                where: { id: transferId, tenantId, version: transfer.version },
                data: { status: client_1.BranchTransferStatus.RECEIVED, receivedAt: new Date(), version: { increment: 1 } },
            });
            if (result.count === 0)
                throw new Error('CONCURRENCY_CONFLICT');
            await this.outbox.schedule(tx, {
                tenantId, topic: 'inventory.transfer.received',
                payload: { transferId }, correlationId,
            });
            await this.auditService.logAction(tenantId, userId, 'RECEIVE_TRANSFER', 'BranchTransfer', transferId, { status: transfer.status }, { status: client_1.BranchTransferStatus.RECEIVED }, correlationId, undefined, tx);
            return tx.branchTransfer.findUnique({ where: { id: transferId }, include: { items: true } });
        });
    }
    async findAll(tenantId, branchId, status) {
        return this.prisma.branchTransfer.findMany({
            where: Object.assign(Object.assign({ tenantId }, (branchId && { OR: [{ sourceBranchId: branchId }, { destBranchId: branchId }] })), (status && { status })),
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(tenantId, transferId) {
        const transfer = await this.prisma.branchTransfer.findFirst({
            where: { id: transferId, tenantId },
            include: { items: true },
        });
        if (!transfer)
            throw new common_1.NotFoundException('Transfer not found');
        return transfer;
    }
};
exports.BranchTransferService = BranchTransferService;
exports.BranchTransferService = BranchTransferService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_ledger_service_1.InventoryLedgerService,
        audit_service_1.AuditService,
        outbox_service_1.OutboxService])
], BranchTransferService);
//# sourceMappingURL=branch-transfer.service.js.map