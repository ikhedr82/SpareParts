import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus, PickListStatus, InventoryReferenceType } from '@prisma/client';
import { PickListsService } from '../warehouse/picklists.service';
import { InventorySafetyService } from '../warehouse/inventory-safety.service';
import { AuditService } from '../shared/audit.service';
import { ConflictException } from '../common/exceptions/conflict.exception';
import { assertTransition, ORDER_TRANSITIONS } from '../common/guards/fsm.guard';
import { TranslationService } from '../i18n/translation.service';

@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: TenantAwarePrismaService,
        private readonly pickListsService: PickListsService,
        private readonly inventorySafetyService: InventorySafetyService,
        private readonly auditService: AuditService,
        private readonly t: TranslationService,
        @Inject(REQUEST) private readonly request: any,
    ) { }

    async create(dto: CreateOrderDto) {
        return this.prisma.client.$transaction(async (tx) => {
            // 1. Get cart
            const cart = await tx.cart.findUnique({
                where: {
                    tenantId_businessClientId: {
                        tenantId: this.prisma.tenantId,
                        businessClientId: dto.businessClientId,
                    },
                },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    taxRate: true,
                                },
                            },
                        },
                    },
                    businessClient: true,
                },
            });

            if (!cart || cart.items.length === 0) {
                throw new BadRequestException(this.t.translate('errors.orders.no_items', this.request?.language));
            }

            // 2. Find optimal fulfillment branch
            const branchId = await this.findOptimalBranch(cart.items, tx);
            if (!branchId) {
                throw new BadRequestException(this.t.translate('errors.inventory.insufficient_stock', this.request?.language, { product: 'all items', available: '0', requested: 'N/A' }));
            }

            // 3. Calculate totals
            let subtotal = 0;
            let tax = 0;
            const orderItems = [];

            for (const item of cart.items) {
                const inventory = await tx.inventory.findFirst({
                    where: {
                        branchId,
                        productId: item.productId,
                    },
                });

                if (!inventory) {
                    throw new BadRequestException(this.t.translate('errors.inventory.product_not_found', this.request?.language));
                }

                const price = Number(inventory.sellingPrice);
                const lineTotal = price * item.quantity;
                subtotal += lineTotal;

                if (item.product.taxRate) {
                    const taxRate = Number(item.product.taxRate.percentage) / 100;
                    tax += lineTotal * taxRate;
                }

                orderItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: inventory.sellingPrice,
                });
            }

            const total = subtotal + tax;

            // 4. Check credit limit
            const availableCredit =
                Number(cart.businessClient.creditLimit) - Number(cart.businessClient.currentBalance);

            if (total > availableCredit) {
                throw new BadRequestException(
                    `Order total (${total}) exceeds available credit (${availableCredit})`
                );
            }

            // 5. Validate delivery address and contact if provided
            if (dto.deliveryAddressId) {
                const address = await tx.businessClientAddress.findFirst({
                    where: {
                        id: dto.deliveryAddressId,
                        businessClientId: dto.businessClientId,
                    },
                });
                if (!address) {
                    throw new NotFoundException(this.t.translate('errors.validation.not_found', this.request?.language, { entity: 'Delivery address' }));
                }
            }

            if (dto.contactId) {
                const contact = await tx.businessClientContact.findFirst({
                    where: {
                        id: dto.contactId,
                        businessClientId: dto.businessClientId,
                    },
                });
                if (!contact) {
                    throw new NotFoundException(this.t.translate('errors.validation.not_found', this.request?.language, { entity: 'Contact' }));
                }
            }

            // 6. Create order
            const orderNumber = `ORD-${Date.now()}-${dto.businessClientId.slice(0, 4)}`.toUpperCase();

            const order = await tx.order.create({
                data: {
                    tenantId: this.prisma.tenantId,
                    businessClientId: dto.businessClientId,
                    branchId,
                    orderNumber,
                    deliveryAddressId: dto.deliveryAddressId,
                    contactId: dto.contactId,
                    subtotal,
                    tax,
                    total,
                    status: 'PENDING',
                    notes: dto.notes,
                    items: {
                        create: orderItems,
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    businessClient: true,
                    branch: true,
                    deliveryAddress: true,
                    contact: true,
                },
            });

            // 7. Clear cart
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });

            return order;
        });
    }

    async findAll(businessClientId?: string, status?: OrderStatus) {
        const where: any = {};

        if (businessClientId) {
            where.businessClientId = businessClientId;
        }

        if (status) {
            where.status = status;
        }

        return this.prisma.client.order.findMany({
            where,
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                businessClient: true,
                branch: true,
                deliveryAddress: true,
                contact: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        const order = await this.prisma.client.order.findFirst({
            where: { id },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                brand: true,
                                category: true,
                            },
                        },
                    },
                },
                businessClient: {
                    include: {
                        contacts: true,
                        addresses: true,
                    },
                },
                branch: true,
                deliveryAddress: true,
                contact: true,
            },
        });

        if (!order) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', this.request?.language, { entity: 'Order' }));
        }

        return order;
    }

    async updateStatus(tenantId: string, id: string, dto: UpdateOrderStatusDto, userId: string) {
        const order = await this.findOne(id);

        // HC-7: FSM state transition guard — throws 409 if invalid
        assertTransition('Order', id, order.status, dto.status, ORDER_TRANSITIONS);

        return this.prisma.client.$transaction(async (tx) => {
            const now = new Date();

            // HC-3: Optimistic concurrency check
            if (dto.expectedVersion !== undefined) {
                const result = await tx.order.updateMany({
                    where: { id, version: dto.expectedVersion },
                    data: { version: { increment: 1 } },
                });
                if (result.count === 0) {
                    const current = await tx.order.findUnique({ where: { id } });
                    throw new ConflictException({
                        entity: 'Order',
                        entityId: id,
                        yourValue: `status=${dto.status}, version=${dto.expectedVersion}`,
                        currentValue: `status=${current?.status}, version=${current?.['version']}`,
                        updatedAt: current?.updatedAt?.toISOString(),
                        updatedBy: 'another session',
                    });
                }
            }

            const updateData: any = { status: dto.status };

            // Set timestamp fields based on status
            switch (dto.status) {
                case 'CONFIRMED':
                    updateData.confirmedAt = now;
                    // Reserve stock using Safety Service
                    await this.inventorySafetyService.allocate(
                        tenantId,
                        order.branchId,
                        order.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
                        InventoryReferenceType.ORDER,
                        order.id,
                        userId,
                        tx,
                    );

                    // Update business client balance
                    await tx.businessClient.update({
                        where: { id: order.businessClientId },
                        data: {
                            currentBalance: { increment: Number(order.total) },
                        },
                    });

                    // Create PickList automatically
                    await this.pickListsService.createPickListForOrder(order.id);
                    break;

                case 'PROCESSING':
                    // Validate PickList is PACKED before allowing PROCESSING
                    const pickList = await tx.pickList.findUnique({
                        where: { orderId: id },
                    });

                    if (!pickList) {
                        throw new BadRequestException(
                            'Order cannot move to PROCESSING: No PickList found',
                        );
                    }

                    if (pickList.status !== PickListStatus.PACKED) {
                        throw new BadRequestException(
                            `Order cannot move to PROCESSING until picking and packing is complete. PickList status: ${pickList.status}`,
                        );
                    }
                    break;

                case 'SHIPPED':
                    updateData.shippedAt = now;
                    break;

                case 'DELIVERED':
                    updateData.deliveredAt = now;
                    break;

                case 'CANCELLED':
                    updateData.cancelledAt = now;
                    // Restore stock if it was already reserved
                    if (order.status === 'CONFIRMED' || order.status === 'PROCESSING') {
                        await this.inventorySafetyService.deallocate(
                            tenantId,
                            order.branchId,
                            order.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
                            InventoryReferenceType.ORDER,
                            order.id,
                            userId,
                            tx,
                        );
                    }    // Restore business client balance
                    await tx.businessClient.update({
                        where: { id: order.businessClientId },
                        data: {
                            currentBalance: { decrement: Number(order.total) },
                        },
                    });
                    break;
            }

            const updated = await tx.order.update({
                where: { id },
                data: updateData,
                include: {
                    items: { include: { product: true } },
                    businessClient: true,
                    branch: true,
                    deliveryAddress: true,
                    contact: true,
                },
            });

            // HC-2/HC-4: Audit every order status transition
            await this.auditService.logAction(
                tenantId,
                userId,
                'UPDATE_ORDER_STATUS',
                'Order',
                id,
                { status: order.status },
                { status: dto.status },
                this.request?.correlationId,
                this.request?.ip,
            );

            return updated;
        });
    }

    async cancel(tenantId: string, id: string, userId: string) {
        return this.updateStatus(tenantId, id, { status: 'CANCELLED' }, userId);
    }

    /**
     * Find optimal branch for order fulfillment
     * Priority:
     * 1. Branch has all items in sufficient quantity
     * 2. Branch with highest total stock levels
     */
    private async findOptimalBranch(cartItems: any[], tx: any): Promise<string | null> {
        // Get all branches for this tenant
        const branches = await tx.branch.findMany({
            where: { tenantId: this.prisma.tenantId },
        });

        let bestBranch: { id: string; totalStock: number } | null = null;

        for (const branch of branches) {
            let hasAllItems = true;
            let totalStock = 0;

            for (const cartItem of cartItems) {
                const inventory = await tx.inventory.findFirst({
                    where: {
                        branchId: branch.id,
                        productId: cartItem.productId,
                    },
                });

                if (!inventory || (inventory.quantity - inventory.allocated) < cartItem.quantity) {
                    hasAllItems = false;
                    break;
                }

                totalStock += (inventory.quantity - inventory.allocated);
            }

            if (hasAllItems) {
                if (!bestBranch || totalStock > bestBranch.totalStock) {
                    bestBranch = { id: branch.id, totalStock };
                }
            }
        }

        return bestBranch?.id || null;
    }
}
