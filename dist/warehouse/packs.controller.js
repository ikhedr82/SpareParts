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
exports.PacksController = void 0;
const common_1 = require("@nestjs/common");
const packs_service_1 = require("./packs.service");
const warehouse_dto_1 = require("./dto/warehouse.dto");
const auth_guard_1 = require("../shared/auth.guard");
let PacksController = class PacksController {
    constructor(packsService) {
        this.packsService = packsService;
    }
    async createPack(pickListId) {
        return this.packsService.createPack(pickListId);
    }
    async addItem(packId, dto) {
        return this.packsService.addItemToPack(packId, dto.productId, dto.quantity);
    }
    async seal(packId, dto) {
        return this.packsService.sealPack(packId, dto.weight);
    }
    async findByPickList(pickListId) {
        return this.packsService.findByPickList(pickListId);
    }
};
exports.PacksController = PacksController;
__decorate([
    (0, common_1.Post)('picklists/:id/create-pack'),
    (0, auth_guard_1.Roles)('Warehouse Staff', 'Warehouse Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('PACK_ORDERS'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PacksController.prototype, "createPack", null);
__decorate([
    (0, common_1.Post)('packs/:id/add-item'),
    (0, auth_guard_1.Roles)('Warehouse Staff', 'Warehouse Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('PACK_ORDERS'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, warehouse_dto_1.AddPackItemDto]),
    __metadata("design:returntype", Promise)
], PacksController.prototype, "addItem", null);
__decorate([
    (0, common_1.Post)('packs/:id/seal'),
    (0, auth_guard_1.Roles)('Warehouse Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('SEAL_PACK'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, warehouse_dto_1.SealPackDto]),
    __metadata("design:returntype", Promise)
], PacksController.prototype, "seal", null);
__decorate([
    (0, common_1.Get)('picklists/:id/packs'),
    (0, auth_guard_1.Roles)('Warehouse Staff', 'Warehouse Manager', 'Logistics Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('VIEW_PICKLISTS'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PacksController.prototype, "findByPickList", null);
exports.PacksController = PacksController = __decorate([
    (0, common_1.Controller)('warehouse'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [packs_service_1.PacksService])
], PacksController);
//# sourceMappingURL=packs.controller.js.map