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
exports.ManifestService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const audit_service_1 = require("../shared/audit.service");
const outbox_service_1 = require("../shared/outbox.service");
const fsm_guard_1 = require("../common/guards/fsm.guard");
const invariant_exception_1 = require("../common/exceptions/invariant.exception");
let ManifestService = class ManifestService {
    constructor(prisma, auditService, outbox) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.outbox = outbox;
    }
    async createManifest(tenantId, userId, dto, correlationId) {
        const branch = await this.prisma.branch.findFirst({
            where: { id: dto.branchId, tenantId },
        });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        for (const orderId of dto.orderIds) {
            const order = await this.prisma.order.findFirst({
                where: { id: orderId, tenantId },
            });
            if (!order)
                throw new common_1.NotFoundException(`Order ${orderId} not found`);
            if (!['CONFIRMED', 'PROCESSING', 'PARTIALLY_FULFILLED'].includes(order.status)) {
                throw new invariant_exception_1.InvariantException('MAN-01', `Order ${orderId} is not eligible for manifest`, {
                    orderId, status: order.status,
                });
            }
        }
        return this.prisma.$transaction(async (tx) => {
            const manifest = await tx.shipmentManifest.create({
                data: {
                    tenantId, branchId: dto.branchId, manifestRef: dto.manifestRef,
                    orders: {
                        create: dto.orderIds.map((orderId, idx) => ({
                            orderId, sequence: idx + 1,
                        })),
                    },
                },
                include: { orders: true },
            });
            await this.auditService.logAction(tenantId, userId, 'CREATE_MANIFEST', 'ShipmentManifest', manifest.id, null, { manifestRef: dto.manifestRef, orderCount: dto.orderIds.length }, correlationId, undefined, tx);
            return manifest;
        });
    }
    async addOrders(tenantId, manifestId, orderIds, userId, correlationId) {
        const manifest = await this.prisma.shipmentManifest.findFirst({
            where: { id: manifestId, tenantId },
            include: { orders: true },
        });
        if (!manifest)
            throw new common_1.NotFoundException('Manifest not found');
        if (manifest.status !== client_1.ManifestStatus.DRAFT) {
            throw new invariant_exception_1.InvariantException('MAN-02', 'Can only add orders to DRAFT manifest', { status: manifest.status });
        }
        const maxSeq = manifest.orders.reduce((max, o) => Math.max(max, o.sequence), 0);
        return this.prisma.$transaction(async (tx) => {
            for (let i = 0; i < orderIds.length; i++) {
                await tx.manifestOrder.create({
                    data: {
                        shipmentManifestId: manifestId,
                        orderId: orderIds[i],
                        sequence: maxSeq + i + 1,
                    },
                });
            }
            return tx.shipmentManifest.findUnique({
                where: { id: manifestId },
                include: { orders: true },
            });
        });
    }
    async sealManifest(tenantId, manifestId, userId, correlationId) {
        const manifest = await this.prisma.shipmentManifest.findFirst({
            where: { id: manifestId, tenantId },
            include: { orders: true },
        });
        if (!manifest)
            throw new common_1.NotFoundException('Manifest not found');
        if (manifest.orders.length === 0) {
            throw new invariant_exception_1.InvariantException('MAN-03', 'Cannot seal empty manifest', {});
        }
        (0, fsm_guard_1.assertTransition)('ShipmentManifest', manifestId, manifest.status, client_1.ManifestStatus.SEALED, fsm_guard_1.MANIFEST_TRANSITIONS);
        return this.prisma.$transaction(async (tx) => {
            const result = await tx.shipmentManifest.updateMany({
                where: { id: manifestId, tenantId, version: manifest.version },
                data: {
                    status: client_1.ManifestStatus.SEALED,
                    sealedAt: new Date(),
                    version: { increment: 1 },
                },
            });
            if (result.count === 0)
                throw new Error('CONCURRENCY_CONFLICT');
            await this.auditService.logAction(tenantId, userId, 'SEAL_MANIFEST', 'ShipmentManifest', manifestId, { status: manifest.status }, { status: client_1.ManifestStatus.SEALED, orderCount: manifest.orders.length }, correlationId, undefined, tx);
            return tx.shipmentManifest.findUnique({ where: { id: manifestId }, include: { orders: true } });
        });
    }
    async dispatchManifest(tenantId, manifestId, tripId, userId, correlationId) {
        const manifest = await this.prisma.shipmentManifest.findFirst({
            where: { id: manifestId, tenantId },
        });
        if (!manifest)
            throw new common_1.NotFoundException('Manifest not found');
        (0, fsm_guard_1.assertTransition)('ShipmentManifest', manifestId, manifest.status, client_1.ManifestStatus.DISPATCHED, fsm_guard_1.MANIFEST_TRANSITIONS);
        const trip = await this.prisma.deliveryTrip.findFirst({
            where: { id: tripId, tenantId },
        });
        if (!trip)
            throw new common_1.NotFoundException('Delivery Trip not found');
        return this.prisma.$transaction(async (tx) => {
            const result = await tx.shipmentManifest.updateMany({
                where: { id: manifestId, tenantId, version: manifest.version },
                data: {
                    status: client_1.ManifestStatus.DISPATCHED,
                    tripId,
                    dispatchedAt: new Date(),
                    version: { increment: 1 },
                },
            });
            if (result.count === 0)
                throw new Error('CONCURRENCY_CONFLICT');
            await this.outbox.schedule(tx, {
                tenantId, topic: 'logistics.manifest.dispatched',
                payload: { manifestId, tripId },
                correlationId,
            });
            await this.auditService.logAction(tenantId, userId, 'DISPATCH_MANIFEST', 'ShipmentManifest', manifestId, { status: manifest.status }, { status: client_1.ManifestStatus.DISPATCHED, tripId }, correlationId, undefined, tx);
            return tx.shipmentManifest.findUnique({ where: { id: manifestId }, include: { orders: true } });
        });
    }
    async completeManifest(tenantId, manifestId, userId, correlationId) {
        const manifest = await this.prisma.shipmentManifest.findFirst({
            where: { id: manifestId, tenantId },
        });
        if (!manifest)
            throw new common_1.NotFoundException('Manifest not found');
        (0, fsm_guard_1.assertTransition)('ShipmentManifest', manifestId, manifest.status, client_1.ManifestStatus.COMPLETED, fsm_guard_1.MANIFEST_TRANSITIONS);
        return this.prisma.$transaction(async (tx) => {
            const result = await tx.shipmentManifest.updateMany({
                where: { id: manifestId, tenantId, version: manifest.version },
                data: {
                    status: client_1.ManifestStatus.COMPLETED,
                    completedAt: new Date(),
                    version: { increment: 1 },
                },
            });
            if (result.count === 0)
                throw new Error('CONCURRENCY_CONFLICT');
            await this.auditService.logAction(tenantId, userId, 'COMPLETE_MANIFEST', 'ShipmentManifest', manifestId, { status: manifest.status }, { status: client_1.ManifestStatus.COMPLETED }, correlationId, undefined, tx);
            return tx.shipmentManifest.findUnique({ where: { id: manifestId }, include: { orders: true } });
        });
    }
    async findAll(tenantId, branchId, status) {
        return this.prisma.shipmentManifest.findMany({
            where: Object.assign(Object.assign({ tenantId }, (branchId && { branchId })), (status && { status })),
            include: { orders: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(tenantId, manifestId) {
        const manifest = await this.prisma.shipmentManifest.findFirst({
            where: { id: manifestId, tenantId },
            include: { orders: true },
        });
        if (!manifest)
            throw new common_1.NotFoundException('Manifest not found');
        return manifest;
    }
};
exports.ManifestService = ManifestService;
exports.ManifestService = ManifestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        outbox_service_1.OutboxService])
], ManifestService);
//# sourceMappingURL=manifest.service.js.map