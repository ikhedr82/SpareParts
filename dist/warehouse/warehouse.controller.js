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
exports.WarehouseController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../shared/auth.guard");
const warehouse_service_1 = require("./warehouse.service");
const pick_item_dto_1 = require("./dtos/pick-item.dto");
let WarehouseController = class WarehouseController {
    constructor(service) {
        this.service = service;
    }
    async pickItem(req, pickListId, itemId, dto) {
        return this.service.pickItem(req.user.tenantId, req.user.id, pickListId, itemId, dto);
    }
};
exports.WarehouseController = WarehouseController;
__decorate([
    (0, common_1.Post)(':id/items/:itemId/pick'),
    (0, auth_guard_1.Roles)('Warehouse Staff'),
    (0, auth_guard_1.Permissions)('PICK_ORDERS'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, pick_item_dto_1.PickItemDto]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "pickItem", null);
exports.WarehouseController = WarehouseController = __decorate([
    (0, common_1.Controller)('api/v1/wms/pick-lists'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [warehouse_service_1.WarehouseService])
], WarehouseController);
//# sourceMappingURL=warehouse.controller.js.map