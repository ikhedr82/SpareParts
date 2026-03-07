import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeliveryTripStatus, TripStopStatus, InventoryReferenceType } from '@prisma/client';
import { InventorySafetyService } from '../warehouse/inventory-safety.service';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
import { assertTransition, DELIVERY_TRIP_TRANSITIONS } from '../common/guards/fsm.guard';
import { InvariantException } from '../common/exceptions/invariant.exception';

@Injectable()
export class ReturnToWarehouseService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly inventorySafety: InventorySafetyService,
        private readonly auditService: AuditService,
        private readonly outbox: OutboxService,
    ) { }

    /**
     * UC-1: Trigger Return-to-Warehouse for a failed delivery stop.
     * FSM: Trip FAILED → RETURNED
     * Reverses inventory allocation via ledger.
     */
    async returnToWarehouse(
        tenantId: string,
        tripId: string,
        stopId: string,
        reason: string,
        userId: string,
        correlationId?: string,
    ) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Load stop and verify tenant + status
            const stop = await tx.tripStop.findFirst({
                where: { id: stopId, tripId },
                include: {
                    trip: true,
                    order: { include: { items: true } },
                },
            });

            if (!stop) throw new NotFoundException('Stop not found');
            if (stop.trip.tenantId !== tenantId) {
                throw new BadRequestException('Stop does not belong to this tenant');
            }

            // Invariant: stop must be FAILED
            if (stop.status !== TripStopStatus.FAILED) {
                throw new InvariantException(
                    'RTW-01',
                    'Can only RTW a FAILED stop',
                    { currentStatus: stop.status },
                );
            }

            // 2. FSM Guard: Trip FAILED → RETURNED
            assertTransition(
                'DeliveryTrip', tripId,
                stop.trip.status, DeliveryTripStatus.RETURNED,
                DELIVERY_TRIP_TRANSITIONS,
            );

            // 3. Check idempotency: already RTW'd?
            const existing = await tx.returnToWarehouse.findUnique({
                where: { stopId },
            });
            if (existing) return existing; // Idempotent return

            // 4. Create RTW record
            const rtw = await tx.returnToWarehouse.create({
                data: {
                    tenantId,
                    tripId,
                    stopId,
                    branchId: stop.trip.branchId,
                    reason,
                },
            });

            // 5. Reverse inventory via ledger (return goods to warehouse)
            if (stop.order?.items?.length) {
                for (const item of stop.order.items) {
                    await this.inventorySafety.deallocate(
                        tenantId,
                        stop.trip.branchId,
                        [{ productId: item.productId, quantity: item.quantity }],
                        InventoryReferenceType.RETURN,
                        rtw.id,
                        userId,
                        tx,
                    );
                }
            }

            // 6. Update trip status with optimistic locking
            const result = await tx.deliveryTrip.updateMany({
                where: { id: tripId, tenantId, version: stop.trip.version },
                data: {
                    status: DeliveryTripStatus.RETURNED,
                    version: { increment: 1 },
                },
            });
            if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

            // 7. Outbox event
            await this.outbox.schedule(tx as any, {
                tenantId,
                topic: 'logistics.rtw.completed',
                payload: { rtwId: rtw.id, tripId, stopId },
                correlationId,
            });

            // 8. Audit log
            await this.auditService.logAction(
                tenantId, userId,
                'RTW_COMPLETED', 'ReturnToWarehouse', rtw.id,
                { tripStatus: stop.trip.status, stopStatus: stop.status },
                { tripStatus: DeliveryTripStatus.RETURNED, reason },
                correlationId, undefined, tx as any,
            );

            return rtw;
        });
    }

    async findAll(tenantId: string, branchId?: string) {
        return this.prisma.returnToWarehouse.findMany({
            where: { tenantId, ...(branchId && { branchId }) },
            orderBy: { createdAt: 'desc' },
        });
    }
}
