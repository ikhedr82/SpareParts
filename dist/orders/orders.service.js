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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const tenant_aware_prisma_service_1 = require("../prisma/tenant-aware-prisma.service");
const client_1 = require("@prisma/client");
const picklists_service_1 = require("../warehouse/picklists.service");
const inventory_safety_service_1 = require("../warehouse/inventory-safety.service");
const audit_service_1 = require("../shared/audit.service");
const conflict_exception_1 = require("../common/exceptions/conflict.exception");
const fsm_guard_1 = require("../common/guards/fsm.guard");
const translation_service_1 = require("../i18n/translation.service");
let OrdersService = class OrdersService {
    constructor(prisma, pickListsService, inventorySafetyService, auditService, t, request) {
        this.prisma = prisma;
        this.pickListsService = pickListsService;
        this.inventorySafetyService = inventorySafetyService;
        this.auditService = auditService;
        this.t = t;
        this.request = request;
    }
    async create(dto) {
        return this.prisma.client.$transaction(async (tx) => {
            var _a, _b, _c, _d, _e;
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
                throw new common_1.BadRequestException(this.t.translate('errors.orders.no_items', (_a = this.request) === null || _a === void 0 ? void 0 : _a.language));
            }
            const branchId = await this.findOptimalBranch(cart.items, tx);
            if (!branchId) {
                throw new common_1.BadRequestException(this.t.translate('errors.inventory.insufficient_stock', (_b = this.request) === null || _b === void 0 ? void 0 : _b.language, { product: 'all items', available: '0', requested: 'N/A' }));
            }
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
                    throw new common_1.BadRequestException(this.t.translate('errors.inventory.product_not_found', (_c = this.request) === null || _c === void 0 ? void 0 : _c.language));
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
            const availableCredit = Number(cart.businessClient.creditLimit) - Number(cart.businessClient.currentBalance);
            if (total > availableCredit) {
                throw new common_1.BadRequestException(`Order total (${total}) exceeds available credit (${availableCredit})`);
            }
            if (dto.deliveryAddressId) {
                const address = await tx.businessClientAddress.findFirst({
                    where: {
                        id: dto.deliveryAddressId,
                        businessClientId: dto.businessClientId,
                    },
                });
                if (!address) {
                    throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', (_d = this.request) === null || _d === void 0 ? void 0 : _d.language, { entity: 'Delivery address' }));
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
                    throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', (_e = this.request) === null || _e === void 0 ? void 0 : _e.language, { entity: 'Contact' }));
                }
            }
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
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
            return order;
        });
    }
    async findAll(businessClientId, status) {
        const where = {};
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
    async findOne(id) {
        var _a;
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
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', (_a = this.request) === null || _a === void 0 ? void 0 : _a.language, { entity: 'Order' }));
        }
        return order;
    }
    async updateStatus(tenantId, id, dto, userId) {
        const order = await this.findOne(id);
        (0, fsm_guard_1.assertTransition)('Order', id, order.status, dto.status, fsm_guard_1.ORDER_TRANSITIONS);
        return this.prisma.client.$transaction(async (tx) => {
            var _a, _b, _c;
            const now = new Date();
            if (dto.expectedVersion !== undefined) {
                const result = await tx.order.updateMany({
                    where: { id, version: dto.expectedVersion },
                    data: { version: { increment: 1 } },
                });
                if (result.count === 0) {
                    const current = await tx.order.findUnique({ where: { id } });
                    throw new conflict_exception_1.ConflictException({
                        entity: 'Order',
                        entityId: id,
                        yourValue: `status=${dto.status}, version=${dto.expectedVersion}`,
                        currentValue: `status=${current === null || current === void 0 ? void 0 : current.status}, version=${current === null || current === void 0 ? void 0 : current['version']}`,
                        updatedAt: (_a = current === null || current === void 0 ? void 0 : current.updatedAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
                        updatedBy: 'another session',
                    });
                }
            }
            const updateData = { status: dto.status };
            switch (dto.status) {
                case 'CONFIRMED':
                    updateData.confirmedAt = now;
                    await this.inventorySafetyService.allocate(tenantId, order.branchId, order.items.map((item) => ({ productId: item.productId, quantity: item.quantity })), client_1.InventoryReferenceType.ORDER, order.id, userId, tx);
                    await tx.businessClient.update({
                        where: { id: order.businessClientId },
                        data: {
                            currentBalance: { increment: Number(order.total) },
                        },
                    });
                    await this.pickListsService.createPickListForOrder(order.id);
                    break;
                case 'PROCESSING':
                    const pickList = await tx.pickList.findUnique({
                        where: { orderId: id },
                    });
                    if (!pickList) {
                        throw new common_1.BadRequestException('Order cannot move to PROCESSING: No PickList found');
                    }
                    if (pickList.status !== client_1.PickListStatus.PACKED) {
                        throw new common_1.BadRequestException(`Order cannot move to PROCESSING until picking and packing is complete. PickList status: ${pickList.status}`);
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
                    if (order.status === 'CONFIRMED' || order.status === 'PROCESSING') {
                        await this.inventorySafetyService.deallocate(tenantId, order.branchId, order.items.map((item) => ({ productId: item.productId, quantity: item.quantity })), client_1.InventoryReferenceType.ORDER, order.id, userId, tx);
                    }
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
            await this.auditService.logAction(tenantId, userId, 'UPDATE_ORDER_STATUS', 'Order', id, { status: order.status }, { status: dto.status }, (_b = this.request) === null || _b === void 0 ? void 0 : _b.correlationId, (_c = this.request) === null || _c === void 0 ? void 0 : _c.ip);
            return updated;
        });
    }
    async cancel(tenantId, id, userId) {
        return this.updateStatus(tenantId, id, { status: 'CANCELLED' }, userId);
    }
    async findOptimalBranch(cartItems, tx) {
        const branches = await tx.branch.findMany({
            where: { tenantId: this.prisma.tenantId },
        });
        let bestBranch = null;
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
        return (bestBranch === null || bestBranch === void 0 ? void 0 : bestBranch.id) || null;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, common_1.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [tenant_aware_prisma_service_1.TenantAwarePrismaService,
        picklists_service_1.PickListsService,
        inventory_safety_service_1.InventorySafetyService,
        audit_service_1.AuditService,
        translation_service_1.TranslationService, Object])
], OrdersService);
//# sourceMappingURL=orders.service.js.map