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
exports.PortalFinancialsController = void 0;
const common_1 = require("@nestjs/common");
const portal_auth_guard_1 = require("./portal-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
let PortalFinancialsController = class PortalFinancialsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBalance(req) {
        const { tenantId, businessClientId } = req.user;
        const client = await this.prisma.businessClient.findFirst({
            where: { id: businessClientId, tenantId }
        });
        if (!client)
            throw new common_1.BadRequestException('Client not found');
        return {
            currency: client.currency,
            creditLimit: client.creditLimit,
            currentBalance: client.currentBalance,
            availableCredit: Number(client.creditLimit) - Number(client.currentBalance),
            paymentTerms: client.paymentTerms
        };
    }
    async getInvoices(req) {
        const { tenantId, businessClientId } = req.user;
        return this.prisma.invoice.findMany({
            where: {
                tenantId,
                sale: {}
            },
        });
    }
};
exports.PortalFinancialsController = PortalFinancialsController;
__decorate([
    (0, common_1.Get)('balance'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PortalFinancialsController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('invoices'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PortalFinancialsController.prototype, "getInvoices", null);
exports.PortalFinancialsController = PortalFinancialsController = __decorate([
    (0, common_1.Controller)('portal/financials'),
    (0, common_1.UseGuards)(portal_auth_guard_1.PortalAuthGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PortalFinancialsController);
//# sourceMappingURL=portal-financials.controller.js.map