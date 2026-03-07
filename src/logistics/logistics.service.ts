import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../shared/audit.service';
import { EventBus } from '../shared/event-bus.service';
import { OutboxService } from '../shared/outbox.service';
import { TranslationService } from '../i18n/translation.service';
import { CreateTripDto } from './dtos/create-trip.dto';
import { DispatchTripDto } from './dtos/dispatch-trip.dto';

@Injectable()
export class LogisticsService {
    constructor(
        private prisma: PrismaService,
        private auditService: AuditService,
        private outbox: OutboxService,
        private t: TranslationService,
    ) { }

    async createTrip(tenantId: string, branchId: string, userId: string, dto: CreateTripDto) {
        return this.prisma.$transaction(async (tx) => {
            // Validate Driver & Vehicle availability
            if (dto.driverId) {
                const driver = await tx.driver.findUnique({ where: { id: dto.driverId } });
                if (!driver || driver.currentTripId) throw new ConflictException(this.t.translate('errors.logistics.driver_unavailable', 'EN'));
            }

            const trip = await tx.deliveryTrip.create({
                data: {
                    tenantId,
                    branchId,
                    driverId: dto.driverId,
                    vehicleId: dto.vehicleId,
                    status: 'PLANNED',
                    stops: {
                        create: dto.stops.map(s => ({
                            orderId: s.orderId,
                            stopType: s.type as any,
                            sequence: s.sequence,
                            status: 'PENDING'
                        }))
                    }
                },
                include: { stops: true }
            });

            await this.auditService.logAction(
                tenantId,
                userId,
                'CREATE_TRIP',
                'DeliveryTrip',
                trip.id,
                null,
                trip,
                undefined,
                undefined,
                tx,
            );
            return trip;
        });
    }

    async dispatchTrip(tenantId: string, userId: string, tripId: string, dto: DispatchTripDto) {
        return this.prisma.$transaction(async (tx) => {
            const trip = await tx.deliveryTrip.findUnique({ where: { id: tripId }, include: { stops: true } });
            if (!trip || trip.tenantId !== tenantId) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Trip' }));
            if (trip.status !== 'PLANNED' && trip.status !== 'LOADING') throw new BadRequestException(this.t.translate('errors.logistics.invalid_trip_transition', 'EN', { from: trip.status, to: 'IN_TRANSIT' }));

            const driverId = dto.driverId || trip.driverId;
            const vehicleId = dto.vehicleId || trip.vehicleId;

            if (!driverId || !vehicleId) throw new BadRequestException(this.t.translate('errors.logistics.no_stops', 'EN'));

            // Logic to update Orders to OUT_FOR_DELIVERY
            for (const stop of trip.stops) {
                if (stop.orderId) {
                    await tx.order.update({
                        where: { id: stop.orderId },
                        data: { status: 'OUT_FOR_DELIVERY' }
                    });
                }
            }

            const updatedTrip = await tx.deliveryTrip.update({
                where: { id: tripId },
                data: {
                    status: 'IN_TRANSIT',
                    driverId,
                    vehicleId,
                    startedAt: new Date()
                }
            });

            // Set Driver/Vehicle specific status (e.g., currentTripId)
            await tx.driver.update({ where: { id: driverId }, data: { currentTripId: tripId } });
            await tx.vehicle.update({ where: { id: vehicleId }, data: { currentTripId: tripId } });

            await this.auditService.logAction(
                tenantId,
                userId,
                'DISPATCH_TRIP',
                'DeliveryTrip',
                tripId,
                { status: trip.status },
                { status: 'IN_TRANSIT' },
                undefined,
                undefined,
                tx,
            );

            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'trip.dispatched',
                payload: { tripId, driverId, count: trip.stops.length },
            });

            return updatedTrip;
        });
    }
}
