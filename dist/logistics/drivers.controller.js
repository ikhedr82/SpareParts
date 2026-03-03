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
exports.DriversController = void 0;
const common_1 = require("@nestjs/common");
const drivers_service_1 = require("./drivers.service");
const logistics_dto_1 = require("./dto/logistics.dto");
let DriversController = class DriversController {
    constructor(driversService) {
        this.driversService = driversService;
    }
    async create(req, dto) {
        const tenantId = req.user.tenantId;
        return this.driversService.create(tenantId, dto.branchId, dto.name, dto.phone);
    }
    async findAll(req, branchId, isActive) {
        const tenantId = req.user.tenantId;
        const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.driversService.findAll(tenantId, branchId, isActiveBool);
    }
    async activate(req, id) {
        const tenantId = req.user.tenantId;
        return this.driversService.activate(tenantId, id);
    }
    async deactivate(req, id) {
        const tenantId = req.user.tenantId;
        return this.driversService.deactivate(tenantId, id);
    }
};
exports.DriversController = DriversController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, logistics_dto_1.CreateDriverDto]),
    __metadata("design:returntype", Promise)
], DriversController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], DriversController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DriversController.prototype, "activate", null);
__decorate([
    (0, common_1.Patch)(':id/deactivate'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DriversController.prototype, "deactivate", null);
exports.DriversController = DriversController = __decorate([
    (0, common_1.Controller)('logistics/drivers'),
    __metadata("design:paramtypes", [drivers_service_1.DriversService])
], DriversController);
//# sourceMappingURL=drivers.controller.js.map