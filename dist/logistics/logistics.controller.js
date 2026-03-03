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
exports.LogisticsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../shared/auth.guard");
const logistics_service_1 = require("./logistics.service");
const create_trip_dto_1 = require("./dtos/create-trip.dto");
const dispatch_trip_dto_1 = require("./dtos/dispatch-trip.dto");
const plan_enforcement_service_1 = require("../tenant-admin/plan-enforcement.service");
let LogisticsController = class LogisticsController {
    constructor(service, planEnforcement) {
        this.service = service;
        this.planEnforcement = planEnforcement;
    }
    async createTrip(req, dto) {
        var _a;
        if ((_a = req.user) === null || _a === void 0 ? void 0 : _a.tenantId) {
            await this.planEnforcement.checkFeatureAccess(req.user.tenantId, 'logisticsEnabled');
        }
        return this.service.createTrip(req.user.tenantId, req.user.branchId, req.user.id, dto);
    }
    async dispatchTrip(req, tripId, dto) {
        return this.service.dispatchTrip(req.user.tenantId, req.user.id, tripId, dto);
    }
};
exports.LogisticsController = LogisticsController;
__decorate([
    (0, common_1.Post)(),
    (0, auth_guard_1.Roles)('Logistics Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('MANAGE_FLEET'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_trip_dto_1.CreateTripDto]),
    __metadata("design:returntype", Promise)
], LogisticsController.prototype, "createTrip", null);
__decorate([
    (0, common_1.Post)(':id/dispatch'),
    (0, auth_guard_1.Roles)('Logistics Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('MANAGE_FLEET'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dispatch_trip_dto_1.DispatchTripDto]),
    __metadata("design:returntype", Promise)
], LogisticsController.prototype, "dispatchTrip", null);
exports.LogisticsController = LogisticsController = __decorate([
    (0, common_1.Controller)('api/v1/logistics/trips'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [logistics_service_1.LogisticsService,
        plan_enforcement_service_1.PlanEnforcementService])
], LogisticsController);
//# sourceMappingURL=logistics.controller.js.map