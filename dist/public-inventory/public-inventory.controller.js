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
exports.PublicInventoryController = void 0;
const common_1 = require("@nestjs/common");
const public_inventory_service_1 = require("./public-inventory.service");
let PublicInventoryController = class PublicInventoryController {
    constructor(publicInventoryService) {
        this.publicInventoryService = publicInventoryService;
    }
    findAll(tenantId, page, limit, branchId, categoryId, brandId, search) {
        return this.publicInventoryService.findAll(tenantId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20, branchId, categoryId, brandId, search);
    }
    findByProduct(tenantId, productId) {
        return this.publicInventoryService.findByProduct(tenantId, productId);
    }
    search(tenantId, query, limit) {
        return this.publicInventoryService.search(tenantId, query, limit ? parseInt(limit, 10) : 20);
    }
    getCategories(tenantId) {
        return this.publicInventoryService.getCategories(tenantId);
    }
    getBrands(tenantId) {
        return this.publicInventoryService.getBrands(tenantId);
    }
};
exports.PublicInventoryController = PublicInventoryController;
__decorate([
    (0, common_1.Get)(':tenantId'),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('branchId')),
    __param(4, (0, common_1.Query)('categoryId')),
    __param(5, (0, common_1.Query)('brandId')),
    __param(6, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], PublicInventoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':tenantId/product/:productId'),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PublicInventoryController.prototype, "findByProduct", null);
__decorate([
    (0, common_1.Get)(':tenantId/search'),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Query)('q')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PublicInventoryController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':tenantId/categories'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicInventoryController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)(':tenantId/brands'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicInventoryController.prototype, "getBrands", null);
exports.PublicInventoryController = PublicInventoryController = __decorate([
    (0, common_1.Controller)('public/inventory'),
    __metadata("design:paramtypes", [public_inventory_service_1.PublicInventoryService])
], PublicInventoryController);
//# sourceMappingURL=public-inventory.controller.js.map