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
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const billing_service_1 = require("./billing.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let BillingController = class BillingController {
    constructor(billingService) {
        this.billingService = billingService;
    }
    async getInvoice(id) {
        return this.billingService.generateInvoice(id);
    }
    async pay(dto) {
        return this.billingService.applyPayment(dto.subscriptionId, dto.amount);
    }
    async upgrade(req, dto) {
        return this.billingService.handlePlanChange(req.user.tenantId, dto.planId, dto.cycle);
    }
    async createCheckoutSession(req, dto) {
        const successUrl = `${process.env.frontend_url || 'http://localhost:3000'}/tenant/billing?success=true`;
        const cancelUrl = `${process.env.frontend_url || 'http://localhost:3000'}/tenant/billing?canceled=true`;
        return this.billingService.createStripeCheckout(req.user.tenantId, dto.priceId, successUrl, cancelUrl);
    }
    async getPortal(req) {
        const returnUrl = `${process.env.frontend_url || 'http://localhost:3000'}/tenant/billing`;
        return this.billingService.createStripePortal(req.user.tenantId, returnUrl);
    }
    async getHistory(req) {
        return this.billingService.getBillingHistory(req.user.tenantId);
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Get)('invoice/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getInvoice", null);
__decorate([
    (0, common_1.Post)('pay'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "pay", null);
__decorate([
    (0, common_1.Post)('upgrade'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "upgrade", null);
__decorate([
    (0, common_1.Post)('create-checkout-session'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createCheckoutSession", null);
__decorate([
    (0, common_1.Get)('portal'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getPortal", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getHistory", null);
exports.BillingController = BillingController = __decorate([
    (0, common_1.Controller)('api/tenant/billing'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [billing_service_1.BillingService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map