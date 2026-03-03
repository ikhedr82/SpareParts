import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { TranslationService } from '../i18n/translation.service';

@Injectable()
export class CartService {
    constructor(
        private readonly prisma: TenantAwarePrismaService,
        private readonly t: TranslationService,
    ) { }

    async getOrCreateCart(businessClientId: string) {
        // Verify business client exists and belongs to tenant
        const businessClient = await this.prisma.client.businessClient.findFirst({
            where: { id: businessClientId },
        });

        if (!businessClient) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Business client' }));
        }

        // Get or create cart
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

    async addItem(businessClientId: string, dto: AddToCartDto) {
        const cart = await this.getOrCreateCart(businessClientId);

        // Check if product exists and has stock
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
            throw new BadRequestException(this.t.translate('errors.inventory.insufficient_stock', 'EN'));
        }

        // Check if item already in cart
        const existingItem = await this.prisma.client.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId: dto.productId,
                },
            },
        });

        if (existingItem) {
            // Update quantity
            await this.prisma.client.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + dto.quantity },
            });
        } else {
            // Create new item
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

    async updateItem(businessClientId: string, productId: string, dto: UpdateCartItemDto) {
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
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Cart item' }));
        }

        if (dto.quantity === 0) {
            // Remove item
            await this.prisma.client.cartItem.delete({
                where: { id: cartItem.id },
            });
        } else {
            // Update quantity
            await this.prisma.client.cartItem.update({
                where: { id: cartItem.id },
                data: { quantity: dto.quantity },
            });
        }

        return this.getOrCreateCart(businessClientId);
    }

    async removeItem(businessClientId: string, productId: string) {
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
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Cart item' }));
        }

        await this.prisma.client.cartItem.delete({
            where: { id: cartItem.id },
        });

        return this.getOrCreateCart(businessClientId);
    }

    async clearCart(businessClientId: string) {
        const cart = await this.getOrCreateCart(businessClientId);

        await this.prisma.client.cartItem.deleteMany({
            where: { cartId: cart.id },
        });

        return this.getOrCreateCart(businessClientId);
    }

    private calculateCartTotals(cart: any) {
        let subtotal = 0;
        let tax = 0;

        for (const item of cart.items) {
            const inventory = item.product.inventory?.[0];
            const price = inventory ? Number(inventory.sellingPrice) : 0;
            const lineTotal = price * item.quantity;
            subtotal += lineTotal;

            if (item.product.taxRate) {
                const taxRate = Number(item.product.taxRate.percentage) / 100;
                tax += lineTotal * taxRate;
            }
        }

        const total = subtotal + tax;

        return {
            ...cart,
            subtotal,
            tax,
            total,
            itemCount: cart.items.length,
        };
    }
}
