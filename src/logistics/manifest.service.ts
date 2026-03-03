import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ManifestStatus } from '@prisma/client';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
import { assertTransition, MANIFEST_TRANSITIONS } from '../common/guards/fsm.guard';
import { InvariantException } from '../common/exceptions/invariant.exception';

@Injectable()
export class ManifestService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditService: AuditService,
        private readonly outbox: OutboxService,
    ) { }

    /**
     * UC-9: Create a shipment manifest for grouping orders.
     */
    async createManifest(
        tenantId: string, userId: string,
        dto: { branchId: string; manifestRef: string; orderIds: string[] },
        correlationId?: string,
    ) {
        // Validate branch
        const branch = await this.prisma.branch.findFirst({
            where: { id: dto.branchId, tenantId },
        });
        if (!branch) throw new NotFoundException('Branch not found');

        // Validate all orders belong to tenant and are in PROCESSING/CONFIRMED status
        for (const orderId of dto.orderIds) {
            const order = await this.prisma.order.findFirst({
                where: { id: orderId, tenantId },
            });
            if (!order) throw new NotFoundException(`Order ${orderId} not found`);
            if (!['CONFIRMED', 'PROCESSING', 'PARTIALLY_FULFILLED'].includes(order.status)) {
                throw new InvariantException('MAN-01', `Order ${orderId} is not eligible for manifest`, {
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

            await this.auditService.logAction(
                tenantId, userId, 'CREATE_MANIFEST', 'ShipmentManifest',
                manifest.id, null, { manifestRef: dto.manifestRef, orderCount: dto.orderIds.length },
                correlationId, undefined, tx as any,
            );

            return manifest;
        });
    }

    /**
     * Add orders to an existing DRAFT manifest.
     */
    async addOrders(
        tenantId: string, manifestId: string, orderIds: string[],
        userId: string, correlationId?: string,
    ) {
        const manifest = await this.prisma.shipmentManifest.findFirst({
            where: { id: manifestId, tenantId },
            include: { orders: true },
        });
        if (!manifest) throw new NotFoundException('Manifest not found');

        if (manifest.status !== ManifestStatus.DRAFT) {
            throw new InvariantException('MAN-02', 'Can only add orders to DRAFT manifest', { status: manifest.status });
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

    /**
     * Seal the manifest — no more orders can be added.
     */
    async sealManifest(
        tenantId: string, manifestId: string, userId: string,
        correlationId?: string,
    ) {
        const manifest = await this.prisma.shipmentManifest.findFirst({
            where: { id: manifestId, tenantId },
            include: { orders: true },
        });
        if (!manifest) throw new NotFoundException('Manifest not found');

        if (manifest.orders.length === 0) {
            throw new InvariantException('MAN-03', 'Cannot seal empty manifest', {});
        }

        assertTransition('ShipmentManifest', manifestId, manifest.status, ManifestStatus.SEALED, MANIFEST_TRANSITIONS);

        return this.prisma.$transaction(async (tx) => {
            const result = await tx.shipmentManifest.updateMany({
                where: { id: manifestId, tenantId, version: manifest.version },
                data: {
                    status: ManifestStatus.SEALED,
                    sealedAt: new Date(),
                    version: { increment: 1 },
                },
            });
            if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

            await this.auditService.logAction(
                tenantId, userId, 'SEAL_MANIFEST', 'ShipmentManifest', manifestId,
                { status: manifest.status }, { status: ManifestStatus.SEALED, orderCount: manifest.orders.length },
                correlationId, undefined, tx as any,
            );

            return tx.shipmentManifest.findUnique({ where: { id: manifestId }, include: { orders: true } });
        });
    }

    /**
     * Dispatch the manifest — link to a delivery trip.
     */
    async dispatchManifest(
        tenantId: string, manifestId: string, tripId: string,
        userId: string, correlationId?: string,
    ) {
        const manifest = await this.prisma.shipmentManifest.findFirst({
            where: { id: manifestId, tenantId },
        });
        if (!manifest) throw new NotFoundException('Manifest not found');

        assertTransition('ShipmentManifest', manifestId, manifest.status, ManifestStatus.DISPATCHED, MANIFEST_TRANSITIONS);

        // Verify trip exists
        const trip = await this.prisma.deliveryTrip.findFirst({
            where: { id: tripId, tenantId },
        });
        if (!trip) throw new NotFoundException('Delivery Trip not found');

        return this.prisma.$transaction(async (tx) => {
            const result = await tx.shipmentManifest.updateMany({
                where: { id: manifestId, tenantId, version: manifest.version },
                data: {
                    status: ManifestStatus.DISPATCHED,
                    tripId,
                    dispatchedAt: new Date(),
                    version: { increment: 1 },
                },
            });
            if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

            await this.outbox.schedule(tx as any, {
                tenantId, topic: 'logistics.manifest.dispatched',
                payload: { manifestId, tripId },
                correlationId,
            });

            await this.auditService.logAction(
                tenantId, userId, 'DISPATCH_MANIFEST', 'ShipmentManifest', manifestId,
                { status: manifest.status }, { status: ManifestStatus.DISPATCHED, tripId },
                correlationId, undefined, tx as any,
            );

            return tx.shipmentManifest.findUnique({ where: { id: manifestId }, include: { orders: true } });
        });
    }

    /**
     * Complete the manifest after all deliveries.
     */
    async completeManifest(
        tenantId: string, manifestId: string, userId: string,
        correlationId?: string,
    ) {
        const manifest = await this.prisma.shipmentManifest.findFirst({
            where: { id: manifestId, tenantId },
        });
        if (!manifest) throw new NotFoundException('Manifest not found');

        assertTransition('ShipmentManifest', manifestId, manifest.status, ManifestStatus.COMPLETED, MANIFEST_TRANSITIONS);

        return this.prisma.$transaction(async (tx) => {
            const result = await tx.shipmentManifest.updateMany({
                where: { id: manifestId, tenantId, version: manifest.version },
                data: {
                    status: ManifestStatus.COMPLETED,
                    completedAt: new Date(),
                    version: { increment: 1 },
                },
            });
            if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

            await this.auditService.logAction(
                tenantId, userId, 'COMPLETE_MANIFEST', 'ShipmentManifest', manifestId,
                { status: manifest.status }, { status: ManifestStatus.COMPLETED },
                correlationId, undefined, tx as any,
            );

            return tx.shipmentManifest.findUnique({ where: { id: manifestId }, include: { orders: true } });
        });
    }

    async findAll(tenantId: string, branchId?: string, status?: ManifestStatus) {
        return this.prisma.shipmentManifest.findMany({
            where: {
                tenantId,
                ...(branchId && { branchId }),
                ...(status && { status }),
            },
            include: { orders: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(tenantId: string, manifestId: string) {
        const manifest = await this.prisma.shipmentManifest.findFirst({
            where: { id: manifestId, tenantId },
            include: { orders: true },
        });
        if (!manifest) throw new NotFoundException('Manifest not found');
        return manifest;
    }
}
