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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryTripsController = void 0;
const common_1 = require("@nestjs/common");
const delivery_trips_service_1 = require("./delivery-trips.service");
const logistics_dto_1 = require("./dto/logistics.dto");
const fulfillment_dto_1 = require("./dto/fulfillment.dto");
const auth_guard_1 = require("../shared/auth.guard");
let DeliveryTripsController = class DeliveryTripsController {
    constructor(deliveryTripsService) {
        this.deliveryTripsService = deliveryTripsService;
    }
    async createTrip(req, dto) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.createTrip(tenantId, dto.branchId, dto.mode, dto.driverId, dto.vehicleId, dto.fulfillmentProviderId);
    }
    async assignProvider(req, tripId, dto) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.assignProvider(tenantId, tripId, dto.providerId);
    }
    async addPack(req, tripId, dto) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.addPack(tenantId, tripId, dto.packId);
    }
    async addStop(req, tripId, dto) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.addStop(tenantId, tripId, dto.orderId, dto.supplierId, dto.customerId);
    }
    async startLoading(req, tripId) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.startLoading(tenantId, tripId);
    }
    async startTrip(req, tripId) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.startTrip(tenantId, tripId);
    }
    async arriveAtStop(req, stopId) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.arriveAtStop(tenantId, stopId);
    }
    async manualArrival(req, stopId) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.manualArrival(tenantId, stopId);
    }
    async completeStop(req, stopId, dto) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.completeStop(tenantId, stopId, dto.success, req.user.id);
    }
    async manualDelivery(req, stopId, dto) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.manualDelivery(tenantId, stopId, dto.success, req.user.id, dto.notes);
    }
    async completeTrip(req, tripId) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.completeTrip(tenantId, tripId, req.user.id);
    }
    async failTrip(req, tripId, body) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.failTrip(tenantId, tripId, body.reason);
    }
    async findAll(req, branchId, status) {
        const tenantId = req.user.tenantId;
        const tripStatus = status;
        return this.deliveryTripsService.findAll(tenantId, branchId, tripStatus);
    }
};
exports.DeliveryTripsController = DeliveryTripsController;
__decorate([
    (0, common_1.Post)('trips'),
    (0, auth_guard_1.Roles)('Logistics Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('MANAGE_FLEET'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, logistics_dto_1.CreateTripDto]),
    __metadata("design:returntype", Promise)
], DeliveryTripsController.prototype, "createTrip", null);
__decorate([
    (0, common_1.Post)('trips/:id/assign-provider'),
    (0, auth_guard_1.Roles)('Logistics Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('MANAGE_FLEET'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, fulfillment_dto_1.AssignProviderDto]),
    __metadata("design:returntype", Promise)
], DeliveryTripsController.prototype, "assignProvider", null);
__decorate([
    (0, common_1.Post)('trips/:id/add-pack'),
    (0, auth_guard_1.Roles)('Logistics Manager', 'Warehouse Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('MANAGE_FLEET'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, logistics_dto_1.AddTripPackDto]),
    __metadata("design:returntype", Promise)
], DeliveryTripsController.prototype, "addPack", null);
__decorate([
    (0, common_1.Post)('trips/:id/add-stop'),
    (0, auth_guard_1.Roles)('Logistics Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('MANAGE_FLEET'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, logistics_dto_1.AddTripStopDto]),
    __metadata("design:returntype", Promise)
], DeliveryTripsController.prototype, "addStop", null);
__decorate([
    (0, common_1.Post)('trips/:id/start-loading'),
    (0, auth_guard_1.Roles)('Logistics Manager', 'Warehouse Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('MANAGE_FLEET'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DeliveryTripsController.prototype, "startLoading", null);
__decorate([
    (0, common_1.Post)('trips/:id/start'),
    (0, auth_guard_1.Roles)('Logistics Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('MANAGE_FLEET'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DeliveryTripsController.prototype, "startTrip", null);
__decorate([
    (0, common_1.Post)('stops/:id/arrive'),
    (0, auth_guard_1.Roles)('Driver', 'Logistics Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('COMPLETE_DELIVERY'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DeliveryTripsController.prototype, "arriveAtStop", null);
__decorate([
    (0, common_1.Post)('stops/:id/manual-arrival'),
    (0, auth_guard_1.Roles)('Logistics Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('MANAGE_FLEET'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DeliveryTripsController.prototype, "manualArrival", null);
__decorate([
    (0, common_1.Post)('stops/:id/complete'),
    (0, auth_guard_1.Roles)('Driver', 'Logistics Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('COMPLETE_DELIVERY'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, logistics_dto_1.CompleteStopDto]),
    __metadata("design:returntype", Promise)
], DeliveryTripsController.prototype, "completeStop", null);
__decorate([
    (0, common_1.Post)('stops/:id/manual-delivery'),
    (0, auth_guard_1.Roles)('Logistics Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('MANAGE_FLEET'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, fulfillment_dto_1.ManualDeliveryDto]),
    __metadata("design:returntype", Promise)
], DeliveryTripsController.prototype, "manualDelivery", null);
__decorate([
    (0, common_1.Post)('trips/:id/complete'),
    (0, auth_guard_1.Roles)('Logistics Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('MANAGE_FLEET'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DeliveryTripsController.prototype, "completeTrip", null);
__decorate([
    (0, common_1.Post)('trips/:id/fail'),
    (0, auth_guard_1.Roles)('Logistics Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('MANAGE_FLEET'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], DeliveryTripsController.prototype, "failTrip", null);
__decorate([
    (0, common_1.Get)('trips'),
    (0, auth_guard_1.Roles)('Logistics Manager', 'Admin', 'Driver'),
    (0, auth_guard_1.Permissions)('VIEW_FLEET'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], DeliveryTripsController.prototype, "findAll", null);
exports.DeliveryTripsController = DeliveryTripsController = __decorate([
    (0, common_1.Controller)('logistics'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [delivery_trips_service_1.DeliveryTripsService])
], DeliveryTripsController);
//# sourceMappingURL=delivery-trips.controller.js.map