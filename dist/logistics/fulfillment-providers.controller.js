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
exports.FulfillmentProvidersController = void 0;
const common_1 = require("@nestjs/common");
const fulfillment_providers_service_1 = require("./fulfillment-providers.service");
const fulfillment_dto_1 = require("./dto/fulfillment.dto");
let FulfillmentProvidersController = class FulfillmentProvidersController {
    constructor(fulfillmentProvidersService) {
        this.fulfillmentProvidersService = fulfillmentProvidersService;
    }
    async create(req, dto) {
        const tenantId = req.user.tenantId;
        return this.fulfillmentProvidersService.create(tenantId, dto.name, dto.mode, dto.phone, dto.apiEndpoint);
    }
    async findAll(req, mode, isActive) {
        const tenantId = req.user.tenantId;
        const fulfillmentMode = mode;
        const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.fulfillmentProvidersService.findAll(tenantId, fulfillmentMode, isActiveBool);
    }
    async activate(req, providerId) {
        const tenantId = req.user.tenantId;
        return this.fulfillmentProvidersService.activate(tenantId, providerId);
    }
    async deactivate(req, providerId) {
        const tenantId = req.user.tenantId;
        return this.fulfillmentProvidersService.deactivate(tenantId, providerId);
    }
};
exports.FulfillmentProvidersController = FulfillmentProvidersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, fulfillment_dto_1.CreateFulfillmentProviderDto]),
    __metadata("design:returntype", Promise)
], FulfillmentProvidersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('mode')),
    __param(2, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], FulfillmentProvidersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('providerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FulfillmentProvidersController.prototype, "activate", null);
__decorate([
    (0, common_1.Patch)(':id/deactivate'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('providerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FulfillmentProvidersController.prototype, "deactivate", null);
exports.FulfillmentProvidersController = FulfillmentProvidersController = __decorate([
    (0, common_1.Controller)('logistics/fulfillment-providers'),
    __metadata("design:paramtypes", [fulfillment_providers_service_1.FulfillmentProvidersService])
], FulfillmentProvidersController);
//# sourceMappingURL=fulfillment-providers.controller.js.map