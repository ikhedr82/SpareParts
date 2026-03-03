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
var InventorySafetyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventorySafetyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const translation_service_1 = require("../i18n/translation.service");
let InventorySafetyService = InventorySafetyService_1 = class InventorySafetyService {
    constructor(prisma, t) {
        this.prisma = prisma;
        this.t = t;
        this.logger = new common_1.Logger(InventorySafetyService_1.name);
    }
    async allocate(tenantId, branchId, items, referenceType, referenceId, userId, tx) {
        const execute = async (prisma) => {
            for (const item of items) {
                const inventory = await prisma.inventory.findUnique({
                    where: {
                        branchId_productId: {
                            branchId,
                            productId: item.productId,
                        },
                    },
                });
                if (!inventory) {
                    throw new common_1.NotFoundException(this.t.translate('errors.inventory.product_not_found', 'EN'));
                }
                const available = inventory.quantity - inventory.allocated;
                if (available < item.quantity) {
                    throw new common_1.BadRequestException(this.t.translate('errors.inventory.insufficient_stock', 'EN', { product: item.productId, available: String(available), requested: String(item.quantity) }));
                }
                await prisma.inventory.update({
                    where: { id: inventory.id },
                    data: {
                        allocated: { increment: item.quantity },
                    },
                });
                await this.logTransaction(prisma, {
                    tenantId,
                    branchId,
                    productId: item.productId,
                    quantityChange: item.quantity,
                    type: client_1.InventoryTransactionType.ALLOCATION,
                    referenceType,
                    referenceId,
                    userId,
                    costPrice: inventory.costPrice,
                });
            }
        };
        if (tx) {
            return execute(tx);
        }
        else {
            return this.prisma.$transaction(execute);
        }
    }
    async commit(tenantId, branchId, items, referenceType, referenceId, userId, tx) {
        const execute = async (prisma) => {
            let orderItemsMap = new Map();
            if (referenceType === client_1.InventoryReferenceType.ORDER) {
                const order = await prisma.order.findUnique({
                    where: { id: referenceId },
                    include: { items: true },
                });
                if (order) {
                    order.items.forEach((i) => orderItemsMap.set(i.productId, Number(i.unitPrice)));
                }
            }
            for (const item of items) {
                const inventory = await prisma.inventory.findUnique({
                    where: {
                        branchId_productId: {
                            branchId,
                            productId: item.productId,
                        },
                    },
                });
                if (!inventory) {
                    throw new common_1.NotFoundException(this.t.translate('errors.inventory.product_not_found', 'EN'));
                }
                await prisma.inventory.update({
                    where: { id: inventory.id },
                    data: {
                        quantity: { decrement: item.quantity },
                        allocated: { decrement: item.quantity },
                    },
                });
                let revenueAmount = null;
                if (referenceType === client_1.InventoryReferenceType.ORDER) {
                    const price = orderItemsMap.get(item.productId);
                    if (price !== undefined) {
                        revenueAmount = price * item.quantity;
                    }
                }
                const ledger = await this.logTransaction(prisma, {
                    tenantId,
                    branchId,
                    productId: item.productId,
                    quantityChange: -item.quantity,
                    type: client_1.InventoryTransactionType.COMMIT,
                    referenceType,
                    referenceId,
                    userId,
                    costPrice: inventory.costPrice,
                    revenueAmount,
                });
                if (revenueAmount !== null && referenceType === client_1.InventoryReferenceType.ORDER) {
                    await prisma.revenueLedger.create({
                        data: {
                            tenantId,
                            branchId,
                            orderId: referenceId,
                            amount: revenueAmount,
                            commitLedgerId: ledger.id,
                        },
                    });
                }
            }
        };
        if (tx) {
            return execute(tx);
        }
        else {
            return this.prisma.$transaction(execute);
        }
    }
    async deallocate(tenantId, branchId, items, referenceType, referenceId, userId, tx) {
        const execute = async (prisma) => {
            for (const item of items) {
                const inventory = await prisma.inventory.findUnique({
                    where: {
                        branchId_productId: {
                            branchId,
                            productId: item.productId,
                        },
                    },
                });
                if (!inventory)
                    continue;
                await prisma.inventory.update({
                    where: { id: inventory.id },
                    data: {
                        allocated: { decrement: item.quantity },
                    },
                });
                await this.logTransaction(prisma, {
                    tenantId,
                    branchId,
                    productId: item.productId,
                    quantityChange: -item.quantity,
                    type: client_1.InventoryTransactionType.DEALLOCATION,
                    referenceType,
                    referenceId,
                    userId,
                    costPrice: inventory.costPrice,
                });
            }
        };
        if (tx) {
            return execute(tx);
        }
        else {
            return this.prisma.$transaction(execute);
        }
    }
    async restock(tenantId, branchId, items, type, referenceType, referenceId, userId, tx) {
        const execute = async (prisma) => {
            for (const item of items) {
                const inventory = await prisma.inventory.upsert({
                    where: {
                        branchId_productId: {
                            branchId,
                            productId: item.productId,
                        },
                    },
                    update: {
                        quantity: { increment: item.quantity },
                    },
                    create: {
                        tenantId,
                        branchId,
                        productId: item.productId,
                        quantity: item.quantity,
                        allocated: 0,
                        costPrice: 0,
                        sellingPrice: 0,
                    },
                });
                await this.logTransaction(prisma, {
                    tenantId,
                    branchId,
                    productId: item.productId,
                    quantityChange: item.quantity,
                    type,
                    referenceType,
                    referenceId,
                    userId,
                    costPrice: inventory.costPrice,
                });
            }
        };
        if (tx) {
            return execute(tx);
        }
        else {
            return this.prisma.$transaction(execute);
        }
    }
    async checkAvailability(branchId, productId, requestedQuantity) {
        const inventory = await this.prisma.inventory.findUnique({
            where: {
                branchId_productId: {
                    branchId,
                    productId,
                },
            },
        });
        if (!inventory)
            return false;
        return (inventory.quantity - inventory.allocated) >= requestedQuantity;
    }
    async logTransaction(tx, data) {
        return tx.inventoryLedger.create({
            data: {
                tenantId: data.tenantId,
                branchId: data.branchId,
                productId: data.productId,
                type: data.type,
                quantityChange: data.quantityChange,
                costPrice: data.costPrice,
                revenueAmount: data.revenueAmount,
                referenceType: data.referenceType,
                referenceId: data.referenceId,
                userId: data.userId,
            },
        });
    }
};
exports.InventorySafetyService = InventorySafetyService;
exports.InventorySafetyService = InventorySafetyService = InventorySafetyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        translation_service_1.TranslationService])
], InventorySafetyService);
//# sourceMappingURL=inventory-safety.service.js.map