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
exports.DeliveryTripsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const inventory_safety_service_1 = require("../warehouse/inventory-safety.service");
const audit_service_1 = require("../shared/audit.service");
const fsm_guard_1 = require("../common/guards/fsm.guard");
const translation_service_1 = require("../i18n/translation.service");
let DeliveryTripsService = class DeliveryTripsService {
    constructor(prisma, inventorySafetyService, auditService, t) {
        this.prisma = prisma;
        this.inventorySafetyService = inventorySafetyService;
        this.auditService = auditService;
        this.t = t;
    }
    async createTrip(tenantId, branchId, mode, driverId, vehicleId, fulfillmentProviderId) {
        if (mode === client_1.FulfillmentMode.INTERNAL_FLEET) {
            if (!driverId || !vehicleId) {
                throw new common_1.BadRequestException(this.t.translate('errors.logistics.driver_required', 'EN'));
            }
        }
        if (mode === client_1.FulfillmentMode.EXTERNAL_COURIER || mode === client_1.FulfillmentMode.THIRD_PARTY_DRIVER) {
            if (!fulfillmentProviderId) {
                throw new common_1.BadRequestException(this.t.translate('errors.logistics.provider_required', 'EN'));
            }
            const provider = await this.prisma.fulfillmentProvider.findFirst({
                where: { id: fulfillmentProviderId, tenantId, isActive: true },
            });
            if (!provider) {
                throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Fulfillment provider' }));
            }
        }
        let driver, vehicle;
        if (driverId && vehicleId) {
            driver = await this.prisma.driver.findFirst({
                where: { id: driverId, tenantId, branchId },
            });
            if (!driver) {
                throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Driver' }));
            }
            if (!driver.isActive) {
                throw new common_1.BadRequestException(this.t.translate('errors.logistics.driver_inactive', 'EN'));
            }
            if (driver.currentTripId) {
                throw new common_1.BadRequestException(this.t.translate('errors.logistics.driver_busy', 'EN'));
            }
            vehicle = await this.prisma.vehicle.findFirst({
                where: { id: vehicleId, tenantId, branchId },
            });
            if (!vehicle) {
                throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Vehicle' }));
            }
            if (!vehicle.isActive) {
                throw new common_1.BadRequestException(this.t.translate('errors.logistics.vehicle_inactive', 'EN'));
            }
            if (vehicle.currentTripId) {
                throw new common_1.BadRequestException(this.t.translate('errors.logistics.vehicle_busy', 'EN'));
            }
        }
        const trip = await this.prisma.deliveryTrip.create({
            data: {
                tenantId,
                branchId,
                mode,
                driverId,
                vehicleId,
                fulfillmentProviderId,
                status: client_1.DeliveryTripStatus.PLANNED,
            },
            include: {
                driver: true,
                vehicle: true,
                fulfillmentProvider: true,
            },
        });
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
    async assignProvider(tenantId, tripId, providerId) {
        const trip = await this.prisma.deliveryTrip.findFirst({
            where: { id: tripId, tenantId },
        });
        if (!trip) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Trip' }));
        }
        if (trip.status !== client_1.DeliveryTripStatus.PLANNED) {
            throw new common_1.BadRequestException('Can only assign provider to planned trips');
        }
        const provider = await this.prisma.fulfillmentProvider.findFirst({
            where: { id: providerId, tenantId, isActive: true },
        });
        if (!provider) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Fulfillment provider' }));
        }
        const result = await this.prisma.deliveryTrip.updateMany({
            where: { id: tripId, tenantId, version: trip.version },
            data: {
                fulfillmentProviderId: providerId,
                version: { increment: 1 }
            },
        });
        if (result.count === 0)
            throw new Error('CONCURRENCY_CONFLICT');
        return this.prisma.deliveryTrip.findFirst({
            where: { id: tripId, tenantId },
            include: { fulfillmentProvider: true },
        });
    }
    async addStop(tenantId, tripId, orderId, supplierId, customerId) {
        const trip = await this.prisma.deliveryTrip.findFirst({
            where: { id: tripId, tenantId },
            include: { stops: true },
        });
        if (!trip) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Trip' }));
        }
        if (trip.status !== client_1.DeliveryTripStatus.PLANNED) {
            throw new common_1.BadRequestException('Can only add stops to planned trips');
        }
        if (!orderId && !supplierId && !customerId) {
            throw new common_1.BadRequestException('Must provide orderId, supplierId, or customerId');
        }
        let stopType;
        if (orderId) {
            stopType = client_1.TripStopType.CUSTOMER;
            const order = await this.prisma.order.findFirst({
                where: { id: orderId, tenantId, status: client_1.OrderStatus.PROCESSING },
            });
            if (!order) {
                throw new common_1.BadRequestException('Order not found or not in PROCESSING status');
            }
        }
        else if (supplierId) {
            stopType = client_1.TripStopType.SUPPLIER;
            const supplier = await this.prisma.supplier.findFirst({
                where: { id: supplierId, tenantId },
            });
            if (!supplier) {
                throw new common_1.NotFoundException('Supplier not found');
            }
        }
        else if (customerId) {
            stopType = client_1.TripStopType.CUSTOMER;
            const customer = await this.prisma.customer.findFirst({
                where: { id: customerId, tenantId },
            });
            if (!customer) {
                throw new common_1.NotFoundException('Customer not found');
            }
        }
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
        const result = await this.prisma.deliveryTrip.updateMany({
            where: { id: tripId, tenantId, version: trip.version },
            data: {
                totalStops: sequence,
                version: { increment: 1 }
            },
        });
        if (result.count === 0)
            throw new Error('CONCURRENCY_CONFLICT');
        return stop;
    }
    async addPack(tenantId, tripId, packId) {
        const trip = await this.prisma.deliveryTrip.findFirst({
            where: { id: tripId, tenantId },
            include: { packs: true },
        });
        if (!trip) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Trip' }));
        }
        if (trip.status !== client_1.DeliveryTripStatus.PLANNED && trip.status !== client_1.DeliveryTripStatus.LOADING) {
            throw new common_1.BadRequestException('Can only add packs during PLANNED or LOADING status');
        }
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
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Pack' }));
        }
        if (pack.pickList.tenantId !== tenantId) {
            throw new common_1.BadRequestException('Pack does not belong to this tenant');
        }
        if (pack.pickList.branchId !== trip.branchId) {
            throw new common_1.BadRequestException('Pack must be from the same branch as the trip');
        }
        if (pack.status !== client_1.PackStatus.SEALED) {
            throw new common_1.BadRequestException('Only SEALED packs can be added to a trip');
        }
        if (pack.tripPack) {
            throw new common_1.BadRequestException('Pack is already assigned to a trip');
        }
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
        const result = await this.prisma.deliveryTrip.updateMany({
            where: { id: tripId, tenantId, version: trip.version },
            data: {
                totalPacks: trip.packs.length + 1,
                version: { increment: 1 }
            },
        });
        if (result.count === 0)
            throw new Error('CONCURRENCY_CONFLICT');
        return tripPack;
    }
    async startLoading(tenantId, tripId) {
        const trip = await this.prisma.deliveryTrip.findFirst({
            where: { id: tripId, tenantId },
        });
        if (!trip)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Trip' }));
        (0, fsm_guard_1.assertTransition)('DeliveryTrip', tripId, trip.status, client_1.DeliveryTripStatus.LOADING, fsm_guard_1.DELIVERY_TRIP_TRANSITIONS);
        if (trip.mode !== client_1.FulfillmentMode.INTERNAL_FLEET) {
            throw new common_1.BadRequestException('Loading phase only applies to INTERNAL_FLEET mode');
        }
        const result = await this.prisma.deliveryTrip.updateMany({
            where: { id: tripId, tenantId, version: trip.version },
            data: {
                status: client_1.DeliveryTripStatus.LOADING,
                version: { increment: 1 }
            },
        });
        if (result.count === 0)
            throw new Error('CONCURRENCY_CONFLICT');
        return this.prisma.deliveryTrip.findFirst({
            where: { id: tripId, tenantId },
        });
    }
    async startTrip(tenantId, tripId) {
        const trip = await this.prisma.deliveryTrip.findFirst({
            where: { id: tripId, tenantId },
            include: { packs: true, stops: true },
        });
        if (!trip)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Trip' }));
        (0, fsm_guard_1.assertTransition)('DeliveryTrip', tripId, trip.status, client_1.DeliveryTripStatus.IN_TRANSIT, fsm_guard_1.DELIVERY_TRIP_TRANSITIONS);
        if (trip.packs.length === 0) {
            throw new common_1.BadRequestException('Trip must have at least one pack');
        }
        if (trip.stops.length === 0) {
            throw new common_1.BadRequestException('Trip must have at least one stop');
        }
        const orderIds = trip.stops
            .filter((stop) => stop.orderId)
            .map((stop) => stop.orderId);
        if (orderIds.length > 0) {
            const orderStatus = trip.mode === client_1.FulfillmentMode.CUSTOMER_PICKUP
                ? client_1.OrderStatus.READY_FOR_PICKUP
                : client_1.OrderStatus.OUT_FOR_DELIVERY;
            await this.prisma.order.updateMany({
                where: { id: { in: orderIds } },
                data: { status: orderStatus },
            });
        }
        const result = await this.prisma.deliveryTrip.updateMany({
            where: { id: tripId, tenantId, version: trip.version },
            data: {
                status: client_1.DeliveryTripStatus.IN_TRANSIT,
                startedAt: new Date(),
                version: { increment: 1 }
            },
        });
        if (result.count === 0)
            throw new Error('CONCURRENCY_CONFLICT');
        return this.prisma.deliveryTrip.findFirst({
            where: { id: tripId, tenantId },
        });
    }
    async arriveAtStop(tenantId, stopId) {
        const stop = await this.prisma.tripStop.findFirst({
            where: { id: stopId },
            include: {
                trip: true,
            },
        });
        if (!stop) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Stop' }));
        }
        if (stop.trip.tenantId !== tenantId) {
            throw new common_1.BadRequestException('Stop does not belong to this tenant');
        }
        if (stop.trip.status !== client_1.DeliveryTripStatus.IN_TRANSIT) {
            throw new common_1.BadRequestException('Trip must be IN_TRANSIT');
        }
        if (stop.status !== client_1.TripStopStatus.PENDING) {
            throw new common_1.BadRequestException('Stop must be PENDING');
        }
        return this.prisma.tripStop.update({
            where: { id: stopId },
            data: {
                status: client_1.TripStopStatus.ARRIVED,
                arrivalTime: new Date(),
            },
        });
    }
    async manualArrival(tenantId, stopId) {
        return this.arriveAtStop(tenantId, stopId);
    }
    async manualDelivery(tenantId, stopId, success, userId, notes) {
        return this.completeStop(tenantId, stopId, success, userId);
    }
    async completeStop(tenantId, stopId, success, userId) {
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
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Stop' }));
        }
        if (stop.trip.tenantId !== tenantId) {
            throw new common_1.BadRequestException('Stop does not belong to this tenant');
        }
        if (stop.status !== client_1.TripStopStatus.ARRIVED) {
            throw new common_1.BadRequestException('Stop must be ARRIVED');
        }
        const newStatus = success ? client_1.TripStopStatus.DELIVERED : client_1.TripStopStatus.FAILED;
        const updatedStop = await this.prisma.tripStop.update({
            where: { id: stopId },
            data: {
                status: newStatus,
                completionTime: new Date(),
            },
        });
        await this.auditService.logAction(tenantId, userId, 'COMPLETE_STOP', 'TripStop', stopId, { status: stop.status }, { status: newStatus, success });
        if (stop.orderId) {
            const orderStatus = success ? client_1.OrderStatus.DELIVERED : client_1.OrderStatus.DELIVERY_FAILED;
            await this.prisma.order.update({
                where: { id: stop.orderId },
                data: Object.assign({ status: orderStatus }, (success && { deliveredAt: new Date() })),
            });
        }
        const allStopsDelivered = stop.trip.stops.every((s) => s.id === stopId ? newStatus === client_1.TripStopStatus.DELIVERED : s.status === client_1.TripStopStatus.DELIVERED);
        if (allStopsDelivered) {
            await this.completeTrip(tenantId, stop.tripId, userId);
        }
        return updatedStop;
    }
    async completeTrip(tenantId, tripId, userId) {
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
            if (!trip)
                throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Trip' }));
            (0, fsm_guard_1.assertTransition)('DeliveryTrip', tripId, trip.status, client_1.DeliveryTripStatus.COMPLETED, fsm_guard_1.DELIVERY_TRIP_TRANSITIONS);
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
            for (const stop of trip.stops) {
                if (stop.status !== client_1.TripStopStatus.DELIVERED)
                    continue;
                const order = stop.order;
                if (order && order.items && order.items.length > 0) {
                    await this.inventorySafetyService.commit(tenantId, trip.branchId, order.items.map((item) => ({ productId: item.productId, quantity: item.quantity })), client_1.InventoryReferenceType.DELIVERY_TRIP, trip.id, userId, tx);
                }
            }
            const result = await tx.deliveryTrip.updateMany({
                where: { id: tripId, tenantId, version: trip.version },
                data: {
                    status: client_1.DeliveryTripStatus.COMPLETED,
                    completedAt: new Date(),
                    version: { increment: 1 }
                },
            });
            if (result.count === 0)
                throw new Error('CONCURRENCY_CONFLICT');
            const deliveredCount = trip.stops.filter((s) => s.status === client_1.TripStopStatus.DELIVERED).length;
            const failedCount = trip.stops.filter((s) => s.status === client_1.TripStopStatus.FAILED).length;
            await this.auditService.logAction(tenantId, userId, 'COMPLETE_TRIP', 'DeliveryTrip', tripId, { status: trip.status }, { status: client_1.DeliveryTripStatus.COMPLETED, deliveredStops: deliveredCount, failedStops: failedCount });
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
    async failTrip(tenantId, tripId, reason) {
        const trip = await this.prisma.deliveryTrip.findFirst({
            where: { id: tripId, tenantId },
        });
        if (!trip)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Trip' }));
        (0, fsm_guard_1.assertTransition)('DeliveryTrip', tripId, trip.status, client_1.DeliveryTripStatus.FAILED, fsm_guard_1.DELIVERY_TRIP_TRANSITIONS);
        const transactionSteps = [];
        if (trip.driverId) {
            transactionSteps.push(this.prisma.driver.update({
                where: { id: trip.driverId },
                data: { currentTripId: null },
            }));
        }
        if (trip.vehicleId) {
            transactionSteps.push(this.prisma.vehicle.update({
                where: { id: trip.vehicleId },
                data: { currentTripId: null },
            }));
        }
        transactionSteps.push(this.prisma.deliveryTrip.update({
            where: { id: tripId },
            data: {
                status: client_1.DeliveryTripStatus.FAILED,
                completedAt: new Date(),
            },
        }));
        await this.prisma.$transaction(transactionSteps);
        await this.auditService.logAction(tenantId, trip.id, 'FAIL_TRIP', 'DeliveryTrip', tripId, { status: trip.status }, { status: client_1.DeliveryTripStatus.FAILED, reason });
        return this.prisma.deliveryTrip.findUnique({
            where: { id: tripId },
        });
    }
    async findAll(tenantId, branchId, status) {
        return this.prisma.deliveryTrip.findMany({
            where: Object.assign(Object.assign({ tenantId }, (branchId && { branchId })), (status && { status })),
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
};
exports.DeliveryTripsService = DeliveryTripsService;
exports.DeliveryTripsService = DeliveryTripsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_safety_service_1.InventorySafetyService,
        audit_service_1.AuditService,
        translation_service_1.TranslationService])
], DeliveryTripsService);
//# sourceMappingURL=delivery-trips.service.js.map