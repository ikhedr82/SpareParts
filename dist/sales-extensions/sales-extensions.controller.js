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
exports.SalesExtensionsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../shared/auth.guard");
const sales_extensions_service_1 = require("./sales-extensions.service");
const quote_service_1 = require("./quote.service");
const void_sale_dto_1 = require("./dtos/void-sale.dto");
const create_quote_dto_1 = require("./dtos/create-quote.dto");
class RejectQuoteDto {
}
let SalesExtensionsController = class SalesExtensionsController {
    constructor(salesService, quoteService) {
        this.salesService = salesService;
        this.quoteService = quoteService;
    }
    async voidSale(req, saleId, dto) {
        return this.salesService.voidSale(req.user.tenantId, req.user.id, saleId, dto);
    }
    async listQuotes(req) {
        return this.quoteService.findAll(req.user.tenantId);
    }
    async getQuote(req, id) {
        return this.quoteService.findOne(req.user.tenantId, id);
    }
    async createQuote(req, dto) {
        return this.quoteService.createQuote(req.user.tenantId, req.user.id, dto);
    }
    async sendQuote(req, id) {
        return this.quoteService.sendQuote(req.user.tenantId, req.user.id, id);
    }
    async acceptQuote(req, id) {
        return this.quoteService.acceptQuote(req.user.tenantId, req.user.id, id);
    }
    async rejectQuote(req, id, dto) {
        return this.quoteService.rejectQuote(req.user.tenantId, req.user.id, id, dto.reason);
    }
    async convertToOrder(req, id) {
        return this.quoteService.convertToOrder(req.user.tenantId, req.user.id, id);
    }
};
exports.SalesExtensionsController = SalesExtensionsController;
__decorate([
    (0, common_1.Post)('sales/:id/void'),
    (0, auth_guard_1.Roles)('Manager', 'Admin'),
    (0, auth_guard_1.Permissions)('VOID_SALE'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, void_sale_dto_1.VoidSaleDto]),
    __metadata("design:returntype", Promise)
], SalesExtensionsController.prototype, "voidSale", null);
__decorate([
    (0, common_1.Get)('quotes'),
    (0, auth_guard_1.Roles)('Sales', 'Admin', 'Manager'),
    (0, auth_guard_1.Permissions)('MANAGE_QUOTES'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SalesExtensionsController.prototype, "listQuotes", null);
__decorate([
    (0, common_1.Get)('quotes/:id'),
    (0, auth_guard_1.Roles)('Sales', 'Admin', 'Manager'),
    (0, auth_guard_1.Permissions)('MANAGE_QUOTES'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SalesExtensionsController.prototype, "getQuote", null);
__decorate([
    (0, common_1.Post)('quotes'),
    (0, auth_guard_1.Roles)('Sales', 'Admin'),
    (0, auth_guard_1.Permissions)('MANAGE_QUOTES'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_quote_dto_1.CreateQuoteDto]),
    __metadata("design:returntype", Promise)
], SalesExtensionsController.prototype, "createQuote", null);
__decorate([
    (0, common_1.Post)('quotes/:id/send'),
    (0, auth_guard_1.Roles)('Sales', 'Admin'),
    (0, auth_guard_1.Permissions)('MANAGE_QUOTES'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SalesExtensionsController.prototype, "sendQuote", null);
__decorate([
    (0, common_1.Post)('quotes/:id/accept'),
    (0, auth_guard_1.Roles)('Sales', 'Admin', 'Manager'),
    (0, auth_guard_1.Permissions)('MANAGE_QUOTES'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SalesExtensionsController.prototype, "acceptQuote", null);
__decorate([
    (0, common_1.Post)('quotes/:id/reject'),
    (0, auth_guard_1.Roles)('Admin', 'Manager', 'Sales'),
    (0, auth_guard_1.Permissions)('MANAGE_QUOTES'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, RejectQuoteDto]),
    __metadata("design:returntype", Promise)
], SalesExtensionsController.prototype, "rejectQuote", null);
__decorate([
    (0, common_1.Post)('quotes/:id/convert'),
    (0, auth_guard_1.Roles)('Sales', 'Admin'),
    (0, auth_guard_1.Permissions)('MANAGE_QUOTES'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SalesExtensionsController.prototype, "convertToOrder", null);
exports.SalesExtensionsController = SalesExtensionsController = __decorate([
    (0, common_1.Controller)('api/v1/sales-extensions'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [sales_extensions_service_1.SalesExtensionsService,
        quote_service_1.QuoteService])
], SalesExtensionsController);
//# sourceMappingURL=sales-extensions.controller.js.map