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
exports.LogisticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../shared/audit.service");
const outbox_service_1 = require("../shared/outbox.service");
const translation_service_1 = require("../i18n/translation.service");
let LogisticsService = class LogisticsService {
    constructor(prisma, auditService, outbox, t) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.outbox = outbox;
        this.t = t;
    }
    async createTrip(tenantId, branchId, userId, dto) {
        return this.prisma.$transaction(async (tx) => {
            if (dto.driverId) {
                const driver = await tx.driver.findUnique({ where: { id: dto.driverId } });
                if (!driver || driver.currentTripId)
                    throw new common_1.ConflictException(this.t.translate('errors.logistics.driver_unavailable', 'EN'));
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
                            stopType: s.type,
                            sequence: s.sequence,
                            status: 'PENDING'
                        }))
                    }
                },
                include: { stops: true }
            });
            await this.auditService.logAction(tenantId, userId, 'CREATE_TRIP', 'DeliveryTrip', trip.id, null, trip, undefined, undefined, tx);
            return trip;
        });
    }
    async dispatchTrip(tenantId, userId, tripId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const trip = await tx.deliveryTrip.findUnique({ where: { id: tripId }, include: { stops: true } });
            if (!trip || trip.tenantId !== tenantId)
                throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Trip' }));
            if (trip.status !== 'PLANNED' && trip.status !== 'LOADING')
                throw new common_1.BadRequestException(this.t.translate('errors.logistics.invalid_trip_transition', 'EN', { from: trip.status, to: 'IN_TRANSIT' }));
            const driverId = dto.driverId || trip.driverId;
            const vehicleId = dto.vehicleId || trip.vehicleId;
            if (!driverId || !vehicleId)
                throw new common_1.BadRequestException(this.t.translate('errors.logistics.no_stops', 'EN'));
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
            await tx.driver.update({ where: { id: driverId }, data: { currentTripId: tripId } });
            await tx.vehicle.update({ where: { id: vehicleId }, data: { currentTripId: tripId } });
            await this.auditService.logAction(tenantId, userId, 'DISPATCH_TRIP', 'DeliveryTrip', tripId, { status: trip.status }, { status: 'IN_TRANSIT' }, undefined, undefined, tx);
            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'trip.dispatched',
                payload: { tripId, driverId, count: trip.stops.length },
            });
            return updatedTrip;
        });
    }
};
exports.LogisticsService = LogisticsService;
exports.LogisticsService = LogisticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        outbox_service_1.OutboxService,
        translation_service_1.TranslationService])
], LogisticsService);
//# sourceMappingURL=logistics.service.js.map