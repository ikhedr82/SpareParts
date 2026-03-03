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
exports.StripeWebhookController = void 0;
const common_1 = require("@nestjs/common");
const stripe_service_1 = require("./stripe.service");
const billing_service_1 = require("./billing.service");
let StripeWebhookController = class StripeWebhookController {
    constructor(stripeService, billingService) {
        this.stripeService = stripeService;
        this.billingService = billingService;
    }
    async handleWebhook(signature, req) {
        if (!signature) {
            throw new common_1.BadRequestException('Missing stripe-signature header');
        }
        const rawBody = req.rawBody;
        let event;
        try {
            event = await this.stripeService.constructEvent(rawBody, signature);
        }
        catch (err) {
            throw new common_1.BadRequestException(`Webhook Error: ${err.message}`);
        }
        switch (event.type) {
            case 'invoice.payment_succeeded':
                await this.billingService.processStripePaymentSuccess(event.data.object);
                break;
            case 'invoice.payment_failed':
                await this.billingService.processStripePaymentFailure(event.data.object);
                break;
            case 'customer.subscription.updated':
                await this.billingService.processStripeSubscriptionUpdate(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await this.billingService.processStripeSubscriptionDeleted(event.data.object);
                break;
        }
        return { received: true };
    }
};
exports.StripeWebhookController = StripeWebhookController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Headers)('stripe-signature')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StripeWebhookController.prototype, "handleWebhook", null);
exports.StripeWebhookController = StripeWebhookController = __decorate([
    (0, common_1.Controller)('api/webhooks/stripe'),
    __metadata("design:paramtypes", [stripe_service_1.StripeService,
        billing_service_1.BillingService])
], StripeWebhookController);
//# sourceMappingURL=stripe-webhook.controller.js.map