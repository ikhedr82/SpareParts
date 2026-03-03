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
exports.ReturnToWarehouseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const inventory_safety_service_1 = require("../warehouse/inventory-safety.service");
const audit_service_1 = require("../shared/audit.service");
const outbox_service_1 = require("../shared/outbox.service");
const fsm_guard_1 = require("../common/guards/fsm.guard");
const invariant_exception_1 = require("../common/exceptions/invariant.exception");
let ReturnToWarehouseService = class ReturnToWarehouseService {
    constructor(prisma, inventorySafety, auditService, outbox) {
        this.prisma = prisma;
        this.inventorySafety = inventorySafety;
        this.auditService = auditService;
        this.outbox = outbox;
    }
    async returnToWarehouse(tenantId, tripId, stopId, reason, userId, correlationId) {
        return this.prisma.$transaction(async (tx) => {
            var _a, _b;
            const stop = await tx.tripStop.findFirst({
                where: { id: stopId, tripId },
                include: {
                    trip: true,
                    order: { include: { items: true } },
                },
            });
            if (!stop)
                throw new common_1.NotFoundException('Stop not found');
            if (stop.trip.tenantId !== tenantId) {
                throw new common_1.BadRequestException('Stop does not belong to this tenant');
            }
            if (stop.status !== client_1.TripStopStatus.FAILED) {
                throw new invariant_exception_1.InvariantException('RTW-01', 'Can only RTW a FAILED stop', { currentStatus: stop.status });
            }
            (0, fsm_guard_1.assertTransition)('DeliveryTrip', tripId, stop.trip.status, client_1.DeliveryTripStatus.RETURNED, fsm_guard_1.DELIVERY_TRIP_TRANSITIONS);
            const existing = await tx.returnToWarehouse.findUnique({
                where: { stopId },
            });
            if (existing)
                return existing;
            const rtw = await tx.returnToWarehouse.create({
                data: {
                    tenantId,
                    tripId,
                    stopId,
                    branchId: stop.trip.branchId,
                    reason,
                },
            });
            if ((_b = (_a = stop.order) === null || _a === void 0 ? void 0 : _a.items) === null || _b === void 0 ? void 0 : _b.length) {
                for (const item of stop.order.items) {
                    await this.inventorySafety.deallocate(tenantId, stop.trip.branchId, [{ productId: item.productId, quantity: item.quantity }], client_1.InventoryReferenceType.RETURN, rtw.id, userId, tx);
                }
            }
            const result = await tx.deliveryTrip.updateMany({
                where: { id: tripId, tenantId, version: stop.trip.version },
                data: {
                    status: client_1.DeliveryTripStatus.RETURNED,
                    version: { increment: 1 },
                },
            });
            if (result.count === 0)
                throw new Error('CONCURRENCY_CONFLICT');
            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'logistics.rtw.completed',
                payload: { rtwId: rtw.id, tripId, stopId },
                correlationId,
            });
            await this.auditService.logAction(tenantId, userId, 'RTW_COMPLETED', 'ReturnToWarehouse', rtw.id, { tripStatus: stop.trip.status, stopStatus: stop.status }, { tripStatus: client_1.DeliveryTripStatus.RETURNED, reason }, correlationId, undefined, tx);
            return rtw;
        });
    }
    async findAll(tenantId, branchId) {
        return this.prisma.returnToWarehouse.findMany({
            where: Object.assign({ tenantId }, (branchId && { branchId })),
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.ReturnToWarehouseService = ReturnToWarehouseService;
exports.ReturnToWarehouseService = ReturnToWarehouseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_safety_service_1.InventorySafetyService,
        audit_service_1.AuditService,
        outbox_service_1.OutboxService])
], ReturnToWarehouseService);
//# sourceMappingURL=rtw.service.js.map