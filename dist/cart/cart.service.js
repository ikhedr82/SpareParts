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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const tenant_aware_prisma_service_1 = require("../prisma/tenant-aware-prisma.service");
const translation_service_1 = require("../i18n/translation.service");
let CartService = class CartService {
    constructor(prisma, t) {
        this.prisma = prisma;
        this.t = t;
    }
    async getOrCreateCart(businessClientId) {
        const businessClient = await this.prisma.client.businessClient.findFirst({
            where: { id: businessClientId },
        });
        if (!businessClient) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Business client' }));
        }
        let cart = await this.prisma.client.cart.findUnique({
            where: {
                tenantId_businessClientId: {
                    tenantId: this.prisma.tenantId,
                    businessClientId,
                },
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                brand: true,
                                category: true,
                                taxRate: true,
                            },
                        },
                    },
                },
            },
        });
        if (!cart) {
            cart = await this.prisma.client.cart.create({
                data: {
                    tenantId: this.prisma.tenantId,
                    businessClientId,
                },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    brand: true,
                                    category: true,
                                    taxRate: true,
                                },
                            },
                        },
                    },
                },
            });
        }
        return this.calculateCartTotals(cart);
    }
    async addItem(businessClientId, dto) {
        const cart = await this.getOrCreateCart(businessClientId);
        const inventory = await this.prisma.client.inventory.findFirst({
            where: {
                productId: dto.productId,
                quantity: { gte: dto.quantity },
            },
            include: {
                product: true,
            },
        });
        if (!inventory) {
            throw new common_1.BadRequestException(this.t.translate('errors.inventory.insufficient_stock', 'EN'));
        }
        const existingItem = await this.prisma.client.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId: dto.productId,
                },
            },
        });
        if (existingItem) {
            await this.prisma.client.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + dto.quantity },
            });
        }
        else {
            await this.prisma.client.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: dto.productId,
                    quantity: dto.quantity,
                },
            });
        }
        return this.getOrCreateCart(businessClientId);
    }
    async updateItem(businessClientId, productId, dto) {
        const cart = await this.getOrCreateCart(businessClientId);
        const cartItem = await this.prisma.client.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId,
                },
            },
        });
        if (!cartItem) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Cart item' }));
        }
        if (dto.quantity === 0) {
            await this.prisma.client.cartItem.delete({
                where: { id: cartItem.id },
            });
        }
        else {
            await this.prisma.client.cartItem.update({
                where: { id: cartItem.id },
                data: { quantity: dto.quantity },
            });
        }
        return this.getOrCreateCart(businessClientId);
    }
    async removeItem(businessClientId, productId) {
        const cart = await this.getOrCreateCart(businessClientId);
        const cartItem = await this.prisma.client.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId,
                },
            },
        });
        if (!cartItem) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Cart item' }));
        }
        await this.prisma.client.cartItem.delete({
            where: { id: cartItem.id },
        });
        return this.getOrCreateCart(businessClientId);
    }
    async clearCart(businessClientId) {
        const cart = await this.getOrCreateCart(businessClientId);
        await this.prisma.client.cartItem.deleteMany({
            where: { cartId: cart.id },
        });
        return this.getOrCreateCart(businessClientId);
    }
    calculateCartTotals(cart) {
        var _a;
        let subtotal = 0;
        let tax = 0;
        for (const item of cart.items) {
            const inventory = (_a = item.product.inventory) === null || _a === void 0 ? void 0 : _a[0];
            const price = inventory ? Number(inventory.sellingPrice) : 0;
            const lineTotal = price * item.quantity;
            subtotal += lineTotal;
            if (item.product.taxRate) {
                const taxRate = Number(item.product.taxRate.percentage) / 100;
                tax += lineTotal * taxRate;
            }
        }
        const total = subtotal + tax;
        return Object.assign(Object.assign({}, cart), { subtotal,
            tax,
            total, itemCount: cart.items.length });
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_aware_prisma_service_1.TenantAwarePrismaService,
        translation_service_1.TranslationService])
], CartService);
//# sourceMappingURL=cart.service.js.map