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
exports.StripePaymentsController = void 0;
const common_1 = require("@nestjs/common");
const stripe_payments_service_1 = require("./stripe-payments.service");
const create_intent_dto_1 = require("./dto/create-intent.dto");
let StripePaymentsController = class StripePaymentsController {
    constructor(stripePaymentsService) {
        this.stripePaymentsService = stripePaymentsService;
    }
    createIntent(dto) {
        return this.stripePaymentsService.createIntent(dto);
    }
    confirm(body) {
        return this.stripePaymentsService.confirm(body.paymentIntentId);
    }
    findBySale(saleId) {
        return this.stripePaymentsService.findBySale(saleId);
    }
};
exports.StripePaymentsController = StripePaymentsController;
__decorate([
    (0, common_1.Post)('create-intent'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_intent_dto_1.CreateIntentDto]),
    __metadata("design:returntype", void 0)
], StripePaymentsController.prototype, "createIntent", null);
__decorate([
    (0, common_1.Post)('confirm'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StripePaymentsController.prototype, "confirm", null);
__decorate([
    (0, common_1.Get)('sale/:saleId'),
    __param(0, (0, common_1.Param)('saleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StripePaymentsController.prototype, "findBySale", null);
exports.StripePaymentsController = StripePaymentsController = __decorate([
    (0, common_1.Controller)('stripe-payments'),
    __metadata("design:paramtypes", [stripe_payments_service_1.StripePaymentsService])
], StripePaymentsController);
//# sourceMappingURL=stripe-payments.controller.js.map