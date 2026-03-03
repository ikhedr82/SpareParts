import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    DeliveryTripStatus,
    TripStopStatus,
    TripStopType,
    PackStatus,
    OrderStatus,
    FulfillmentMode,
    InventoryReferenceType,
} from '@prisma/client';
import { InventorySafetyService } from '../warehouse/inventory-safety.service';
import { AuditService } from '../shared/audit.service';
import { assertTransition, DELIVERY_TRIP_TRANSITIONS } from '../common/guards/fsm.guard';
import { TranslationService } from '../i18n/translation.service';

@Injectable()
export class DeliveryTripsService {
    constructor(
        private prisma: PrismaService,
        private inventorySafetyService: InventorySafetyService,
        private auditService: AuditService,
        private readonly t: TranslationService,
    ) { }

    async createTrip(
        tenantId: string,
        branchId: string,
        mode: FulfillmentMode,
        driverId?: string,
        vehicleId?: string,
        fulfillmentProviderId?: string,
    ) {
        // Validate mode-specific requirements
        if (mode === FulfillmentMode.INTERNAL_FLEET) {
            if (!driverId || !vehicleId) {
                throw new BadRequestException(this.t.translate('errors.logistics.driver_required', 'EN'));
            }
        }

        if (mode === FulfillmentMode.EXTERNAL_COURIER || mode === FulfillmentMode.THIRD_PARTY_DRIVER) {
            if (!fulfillmentProviderId) {
                throw new BadRequestException(this.t.translate('errors.logistics.provider_required', 'EN'));
            }
            // Verify provider belongs to tenant and is active
            const provider = await this.prisma.fulfillmentProvider.findFirst({
                where: { id: fulfillmentProviderId, tenantId, isActive: true },
            });
            if (!provider) {
                throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Fulfillment provider' }));
            }
        }

        // Validate driver/vehicle for INTERNAL_FLEET mode
        let driver, vehicle;
        if (driverId && vehicleId) {
            driver = await this.prisma.driver.findFirst({
                where: { id: driverId, tenantId, branchId },
            });

            if (!driver) {
                throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Driver' }));
            }

            if (!driver.isActive) {
                throw new BadRequestException(this.t.translate('errors.logistics.driver_inactive', 'EN'));
            }

            if (driver.currentTripId) {
                throw new BadRequestException(this.t.translate('errors.logistics.driver_busy', 'EN'));
            }

            vehicle = await this.prisma.vehicle.findFirst({
                where: { id: vehicleId, tenantId, branchId },
            });

            if (!vehicle) {
                throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Vehicle' }));
            }

            if (!vehicle.isActive) {
                throw new BadRequestException(this.t.translate('errors.logistics.vehicle_inactive', 'EN'));
            }

            if (vehicle.currentTripId) {
                throw new BadRequestException(this.t.translate('errors.logistics.vehicle_busy', 'EN'));
            }
        }

        // Create trip
        const trip = await this.prisma.deliveryTrip.create({
            data: {
                tenantId,
                branchId,
                mode,
                driverId,
                vehicleId,
                fulfillmentProviderId,
                status: DeliveryTripStatus.PLANNED,
            },
            include: {
                driver: true,
                vehicle: true,
                fulfillmentProvider: true,
            },
        });

        // Assign trip as current for driver and vehicle (INTERNAL_FLEET only)
        if (driverId && vehicleId) {
            await this.prisma.$transaction([
                this.prisma.driver.update({
                    where: { id: driverId },
                    data: { currentTripId: trip.id },
                }),
                this.prisma.vehicle.update({
                    where: { id: vehicleId },
                    data: { currentTripId: trip.id },
                }),
            ]);
        }

        return trip;
    }

    async assignProvider(tenantId: string, tripId: string, providerId: string) {
        const trip = await this.prisma.deliveryTrip.findFirst({
            where: { id: tripId, tenantId },
        });

        if (!trip) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Trip' }));
        }

        if (trip.status !== DeliveryTripStatus.PLANNED) {
            throw new BadRequestException('Can only assign provider to planned trips');
        }

        // Verify provider
        const provider = await this.prisma.fulfillmentProvider.findFirst({
            where: { id: providerId, tenantId, isActive: true },
        });

        if (!provider) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Fulfillment provider' }));
        }

        const result = await this.prisma.deliveryTrip.updateMany({
            where: { id: tripId, tenantId, version: trip.version },
            data: {
                fulfillmentProviderId: providerId,
                version: { increment: 1 }
            },
        });

        if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

        return this.prisma.deliveryTrip.findFirst({
            where: { id: tripId, tenantId },
            include: { fulfillmentProvider: true },
        });
    }

    async addStop(
        tenantId: string,
        tripId: string,
        orderId?: string,
        supplierId?: string,
        customerId?: string,
    ) {
        const trip = await this.prisma.deliveryTrip.findFirst({
            where: { id: tripId, tenantId },
            include: { stops: true },
        });

        if (!trip) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Trip' }));
        }

        if (trip.status !== DeliveryTripStatus.PLANNED) {
            throw new BadRequestException('Can only add stops to planned trips');
        }

        // Validate at least one entity is provided
        if (!orderId && !supplierId && !customerId) {
            throw new BadRequestException('Must provide orderId, supplierId, or customerId');
        }

        // Determine stop type
        let stopType: TripStopType;
        if (orderId) {
            stopType = TripStopType.CUSTOMER;
            // Verify order belongs to tenant and is in PROCESSING status
            const order = await this.prisma.order.findFirst({
                where: { id: orderId, tenantId, status: OrderStatus.PROCESSING },
            });
            if (!order) {
                throw new BadRequestException('Order not found or not in PROCESSING status');
            }
        } else if (supplierId) {
            stopType = TripStopType.SUPPLIER;
            const supplier = await this.prisma.supplier.findFirst({
                where: { id: supplierId, tenantId },
            });
            if (!supplier) {
                throw new NotFoundException('Supplier not found');
            }
        } else if (customerId) {
            stopType = TripStopType.CUSTOMER;
            const customer = await this.prisma.customer.findFirst({
                where: { id: customerId, tenantId },
            });
            if (!customer) {
                throw new NotFoundException('Customer not found');
            }
        }

        // Create stop with next sequence number
        const sequence = trip.stops.length + 1;

        const stop = await this.prisma.tripStop.create({
            data: {
                tripId,
                orderId,
                supplierId,
                customerId,
                stopType,
                sequence,
            },
        });

        // Update trip total stops count with Optimistic Locking
        const result = await this.prisma.deliveryTrip.updateMany({
            where: { id: tripId, tenantId, version: trip.version },
            data: {
                totalStops: sequence,
                version: { increment: 1 }
            },
        });

        if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

        return stop;
    }

    async addPack(tenantId: string, tripId: string, packId: string) {
        const trip = await this.prisma.deliveryTrip.findFirst({
            where: { id: tripId, tenantId },
            include: { packs: true },
        });

        if (!trip) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Trip' }));
        }

        if (trip.status !== DeliveryTripStatus.PLANNED && trip.status !== DeliveryTripStatus.LOADING) {
            throw new BadRequestException('Can only add packs during PLANNED or LOADING status');
        }

        // Verify pack exists, is SEALED, and belongs to same branch
        const pack = await this.prisma.pack.findFirst({
            where: { id: packId },
            include: {
                pickList: {
                    select: {
                        tenantId: true,
                        branchId: true,
                    },
                },
                tripPack: true,
            },
        });

        if (!pack) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Pack' }));
        }

        if (pack.pickList.tenantId !== tenantId) {
            throw new BadRequestException('Pack does not belong to this tenant');
        }

        if (pack.pickList.branchId !== trip.branchId) {
            throw new BadRequestException('Pack must be from the same branch as the trip');
        }

        if (pack.status !== PackStatus.SEALED) {
            throw new BadRequestException('Only SEALED packs can be added to a trip');
        }

        // Check if pack is already assigned to a trip
        if (pack.tripPack) {
            throw new BadRequestException('Pack is already assigned to a trip');
        }

        // Create trip pack
        const tripPack = await this.prisma.tripPack.create({
            data: {
                tripId,
                packId,
            },
            include: {
                pack: {
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
            },
        });

        // Update trip total packs count with Optimistic Locking
        const result = await this.prisma.deliveryTrip.updateMany({
            where: { id: tripId, tenantId, version: trip.version },
            data: {
                totalPacks: trip.packs.length + 1,
                version: { increment: 1 }
            },
        });

        if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

        return tripPack;
    }

    async startLoading(tenantId: string, tripId: string) {
        const trip = await this.prisma.deliveryTrip.findFirst({
            where: { id: tripId, tenantId },
        });

        if (!trip) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Trip' }));

        // ✅ FSM Gate: Strictly enforce transition
        assertTransition('DeliveryTrip', tripId, trip.status, DeliveryTripStatus.LOADING, DELIVERY_TRIP_TRANSITIONS);


        // Loading phase only applies to INTERNAL_FLEET
        if (trip.mode !== FulfillmentMode.INTERNAL_FLEET) {
            throw new BadRequestException('Loading phase only applies to INTERNAL_FLEET mode');
        }

        const result = await this.prisma.deliveryTrip.updateMany({
            where: { id: tripId, tenantId, version: trip.version },
            data: {
                status: DeliveryTripStatus.LOADING,
                version: { increment: 1 }
            },
        });

        if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

        return this.prisma.deliveryTrip.findFirst({
            where: { id: tripId, tenantId },
        });
    }

    async startTrip(tenantId: string, tripId: string) {
        const trip = await this.prisma.deliveryTrip.findFirst({
            where: { id: tripId, tenantId },
            include: { packs: true, stops: true },
        });

        if (!trip) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Trip' }));

        // ✅ FSM Gate: Strictly enforce transition
        assertTransition('DeliveryTrip', tripId, trip.status, DeliveryTripStatus.IN_TRANSIT, DELIVERY_TRIP_TRANSITIONS);


        if (trip.packs.length === 0) {
            throw new BadRequestException('Trip must have at least one pack');
        }

        if (trip.stops.length === 0) {
            throw new BadRequestException('Trip must have at least one stop');
        }

        // Update order statuses based on mode
        const orderIds = trip.stops
            .filter((stop) => stop.orderId)
            .map((stop) => stop.orderId);

        if (orderIds.length > 0) {
            const orderStatus = trip.mode === FulfillmentMode.CUSTOMER_PICKUP
                ? OrderStatus.READY_FOR_PICKUP
                : OrderStatus.OUT_FOR_DELIVERY;

            await this.prisma.order.updateMany({
                where: { id: { in: orderIds } },
                data: { status: orderStatus },
            });
        }

        const result = await this.prisma.deliveryTrip.updateMany({
            where: { id: tripId, tenantId, version: trip.version },
            data: {
                status: DeliveryTripStatus.IN_TRANSIT,
                startedAt: new Date(),
                version: { increment: 1 }
            },
        });

        if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

        return this.prisma.deliveryTrip.findFirst({
            where: { id: tripId, tenantId },
        });
    }

    async arriveAtStop(tenantId: string, stopId: string) {
        const stop = await this.prisma.tripStop.findFirst({
            where: { id: stopId },
            include: {
                trip: true,
            },
        });

        if (!stop) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Stop' }));
        }

        if (stop.trip.tenantId !== tenantId) {
            throw new BadRequestException('Stop does not belong to this tenant');
        }

        if (stop.trip.status !== DeliveryTripStatus.IN_TRANSIT) {
            throw new BadRequestException('Trip must be IN_TRANSIT');
        }

        if (stop.status !== TripStopStatus.PENDING) {
            throw new BadRequestException('Stop must be PENDING');
        }

        return this.prisma.tripStop.update({
            where: { id: stopId },
            data: {
                status: TripStopStatus.ARRIVED,
                arrivalTime: new Date(),
            },
        });
    }

    // Manual arrival for external couriers/admin updates
    async manualArrival(tenantId: string, stopId: string) {
        return this.arriveAtStop(tenantId, stopId);
    }

    // Manual delivery for external couriers/admin updates
    async manualDelivery(tenantId: string, stopId: string, success: boolean, userId: string, notes?: string) {
        return this.completeStop(tenantId, stopId, success, userId);
    }

    async completeStop(tenantId: string, stopId: string, success: boolean, userId: string) {
        const stop = await this.prisma.tripStop.findFirst({
            where: { id: stopId },
            include: {
                trip: {
                    include: {
                        stops: true,
                    },
                },
            },
        });

        if (!stop) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Stop' }));
        }

        if (stop.trip.tenantId !== tenantId) {
            throw new BadRequestException('Stop does not belong to this tenant');
        }

        if (stop.status !== TripStopStatus.ARRIVED) {
            throw new BadRequestException('Stop must be ARRIVED');
        }

        const newStatus = success ? TripStopStatus.DELIVERED : TripStopStatus.FAILED;

        // Update stop
        const updatedStop = await this.prisma.tripStop.update({
            where: { id: stopId },
            data: {
                status: newStatus,
                completionTime: new Date(),
            },
        });

        // Audit stop completion
        await this.auditService.logAction(
            tenantId,
            userId,
            'COMPLETE_STOP',
            'TripStop',
            stopId,
            { status: stop.status },
            { status: newStatus, success }
        );

        // Update order status if this stop has an order
        if (stop.orderId) {
            const orderStatus = success ? OrderStatus.DELIVERED : OrderStatus.DELIVERY_FAILED;
            await this.prisma.order.update({
                where: { id: stop.orderId },
                data: {
                    status: orderStatus,
                    ...(success && { deliveredAt: new Date() }),
                },
            });
        }

        // Check if all stops are delivered - auto-complete trip
        const allStopsDelivered = stop.trip.stops.every(
            (s) => s.id === stopId ? newStatus === TripStopStatus.DELIVERED : s.status === TripStopStatus.DELIVERED,
        );

        if (allStopsDelivered) {
            await this.completeTrip(tenantId, stop.tripId, userId);
        }

        return updatedStop;
    }

    async completeTrip(tenantId: string, tripId: string, userId: string) {
        return this.prisma.$transaction(async (tx) => {
            const trip = await tx.deliveryTrip.findFirst({
                where: { id: tripId, tenantId },
                include: {
                    stops: {
                        include: {
                            order: {
                                include: {
                                    items: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!trip) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Trip' }));

            // ✅ FSM Gate: Strictly enforce transition
            assertTransition('DeliveryTrip', tripId, trip.status, DeliveryTripStatus.COMPLETED, DELIVERY_TRIP_TRANSITIONS);


            // 1. Release driver and vehicle
            if (trip.driverId) {
                await tx.driver.update({
                    where: { id: trip.driverId },
                    data: { currentTripId: null },
                });
            }

            if (trip.vehicleId) {
                await tx.vehicle.update({
                    where: { id: trip.vehicleId },
                    data: { currentTripId: null },
                });
            }

            // 2. HC-5 FIX: Commit inventory ONLY for DELIVERED stops (not FAILED ones)
            for (const stop of trip.stops) {
                // Only commit stock that was actually delivered
                if (stop.status !== TripStopStatus.DELIVERED) continue;

                const order = stop.order;
                if (order && order.items && order.items.length > 0) {
                    await this.inventorySafetyService.commit(
                        tenantId,
                        trip.branchId,
                        order.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
                        InventoryReferenceType.DELIVERY_TRIP,
                        trip.id,
                        userId,
                        tx,
                    );
                }
            }

            // 3. Update Trip Status with Optimistic Locking
            const result = await tx.deliveryTrip.updateMany({
                where: { id: tripId, tenantId, version: trip.version },
                data: {
                    status: DeliveryTripStatus.COMPLETED,
                    completedAt: new Date(),
                    version: { increment: 1 }
                },
            });

            if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

            // HC-2/HC-4: Audit log for trip completion
            const deliveredCount = trip.stops.filter((s) => s.status === TripStopStatus.DELIVERED).length;
            const failedCount = trip.stops.filter((s) => s.status === TripStopStatus.FAILED).length;
            await this.auditService.logAction(
                tenantId,
                userId,
                'COMPLETE_TRIP',
                'DeliveryTrip',
                tripId,
                { status: trip.status },
                { status: DeliveryTripStatus.COMPLETED, deliveredStops: deliveredCount, failedStops: failedCount },
            );

            return tx.deliveryTrip.findUnique({
                where: { id: tripId },
                include: {
                    driver: true,
                    vehicle: true,
                    fulfillmentProvider: true,
                    stops: true,
                    packs: true,
                },
            });
        });
    }

    async failTrip(tenantId: string, tripId: string, reason: string) {
        const trip = await this.prisma.deliveryTrip.findFirst({
            where: { id: tripId, tenantId },
        });

        if (!trip) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Trip' }));

        // ✅ FSM Gate: Strictly enforce transition
        assertTransition('DeliveryTrip', tripId, trip.status, DeliveryTripStatus.FAILED, DELIVERY_TRIP_TRANSITIONS);

        // Build transaction steps
        const transactionSteps = [];

        // Release driver and vehicle only if they exist
        if (trip.driverId) {
            transactionSteps.push(
                this.prisma.driver.update({
                    where: { id: trip.driverId },
                    data: { currentTripId: null },
                }),
            );
        }

        if (trip.vehicleId) {
            transactionSteps.push(
                this.prisma.vehicle.update({
                    where: { id: trip.vehicleId },
                    data: { currentTripId: null },
                }),
            );
        }

        transactionSteps.push(
            this.prisma.deliveryTrip.update({
                where: { id: tripId },
                data: {
                    status: DeliveryTripStatus.FAILED,
                    completedAt: new Date(),
                },
            }),
        );

        await this.prisma.$transaction(transactionSteps);

        // HC-2/HC-4: Audit log for trip failure
        await this.auditService.logAction(
            tenantId,
            trip.id,          // No userId available at this call site — use tripId as placeholder
            'FAIL_TRIP',
            'DeliveryTrip',
            tripId,
            { status: trip.status },
            { status: DeliveryTripStatus.FAILED, reason },
        );

        return this.prisma.deliveryTrip.findUnique({
            where: { id: tripId },
        });
    }

    async findAll(tenantId: string, branchId?: string, status?: DeliveryTripStatus) {
        return this.prisma.deliveryTrip.findMany({
            where: {
                tenantId,
                ...(branchId && { branchId }),
                ...(status && { status }),
            },
            include: {
                driver: true,
                vehicle: true,
                fulfillmentProvider: true,
                stops: {
                    include: {
                        order: {
                            select: {
                                orderNumber: true,
                                businessClient: {
                                    select: {
                                        businessName: true,
                                    },
                                },
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        packs: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}

