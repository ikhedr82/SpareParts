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
exports.DeliveryExceptionsController = void 0;
const common_1 = require("@nestjs/common");
const delivery_exceptions_service_1 = require("./delivery-exceptions.service");
const exceptions_dto_1 = require("./dto/exceptions.dto");
let DeliveryExceptionsController = class DeliveryExceptionsController {
    constructor(service) {
        this.service = service;
    }
    async createException(req, dto) {
        const tenantId = req.user.tenantId;
        return this.service.createException(tenantId, dto.tripStopId, dto.exceptionType, dto.description, req.user.id);
    }
    async resolveException(req, id, dto) {
        const tenantId = req.user.tenantId;
        return this.service.resolveException(tenantId, id, dto.resolutionType, dto.resolutionNotes || '', req.user.id);
    }
    async findAll(req, resolved, tripId) {
        const tenantId = req.user.tenantId;
        const isResolved = resolved === 'true' ? true : resolved === 'false' ? false : undefined;
        return this.service.findAll(tenantId, isResolved, tripId);
    }
    async getUnresolvedCount(req) {
        const tenantId = req.user.tenantId;
        const count = await this.service.getUnresolvedCount(tenantId);
        return { count };
    }
};
exports.DeliveryExceptionsController = DeliveryExceptionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, exceptions_dto_1.CreateDeliveryExceptionDto]),
    __metadata("design:returntype", Promise)
], DeliveryExceptionsController.prototype, "createException", null);
__decorate([
    (0, common_1.Patch)(':id/resolve'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, exceptions_dto_1.ResolveExceptionDto]),
    __metadata("design:returntype", Promise)
], DeliveryExceptionsController.prototype, "resolveException", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('resolved')),
    __param(2, (0, common_1.Query)('tripId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], DeliveryExceptionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('unresolved/count'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DeliveryExceptionsController.prototype, "getUnresolvedCount", null);
exports.DeliveryExceptionsController = DeliveryExceptionsController = __decorate([
    (0, common_1.Controller)('logistics/exceptions'),
    __metadata("design:paramtypes", [delivery_exceptions_service_1.DeliveryExceptionsService])
], DeliveryExceptionsController);
//# sourceMappingURL=delivery-exceptions.controller.js.map