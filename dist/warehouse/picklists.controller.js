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
exports.PickListsController = void 0;
const common_1 = require("@nestjs/common");
const picklists_service_1 = require("./picklists.service");
const warehouse_dto_1 = require("./dto/warehouse.dto");
const auth_guard_1 = require("../shared/auth.guard");
let PickListsController = class PickListsController {
    constructor(pickListsService) {
        this.pickListsService = pickListsService;
    }
    async findAll(req, branchId, status) {
        return this.pickListsService.findAll(req.user.tenantId, branchId, status);
    }
    async findOne(req, id) {
        return this.pickListsService.findOne(id, req.user.tenantId);
    }
    async startPicking(req, id) {
        return this.pickListsService.startPicking(id, req.user.id, req.correlationId, req.user.tenantId);
    }
    async pickItem(req, id, dto) {
        return this.pickListsService.pickItem(id, dto.pickListItemId, dto.pickedQty);
    }
    async cancel(req, id) {
        return this.pickListsService.cancelPickList(id, req.user.tenantId);
    }
};
exports.PickListsController = PickListsController;
__decorate([
    (0, common_1.Get)(),
    (0, auth_guard_1.Roles)('Warehouse Staff', 'Warehouse Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('VIEW_PICKLISTS'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PickListsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, auth_guard_1.Roles)('Warehouse Staff', 'Warehouse Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('VIEW_PICKLISTS'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PickListsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    (0, auth_guard_1.Roles)('Warehouse Staff', 'Warehouse Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('PICK_ORDERS'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PickListsController.prototype, "startPicking", null);
__decorate([
    (0, common_1.Post)(':id/pick-item'),
    (0, auth_guard_1.Roles)('Warehouse Staff', 'Warehouse Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('PICK_ORDERS'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, warehouse_dto_1.PickItemDto]),
    __metadata("design:returntype", Promise)
], PickListsController.prototype, "pickItem", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, auth_guard_1.Roles)('Warehouse Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('CANCEL_PICKLIST'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PickListsController.prototype, "cancel", null);
exports.PickListsController = PickListsController = __decorate([
    (0, common_1.Controller)('warehouse/picklists'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [picklists_service_1.PickListsService])
], PickListsController);
//# sourceMappingURL=picklists.controller.js.map