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
exports.InventoryLedgerService = void 0;
const common_1 = require("@nestjs/common");
const conflict_exception_1 = require("../common/exceptions/conflict.exception");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
const retry_helper_1 = require("../common/utils/retry.helper");
const translation_service_1 = require("../i18n/translation.service");
let InventoryLedgerService = class InventoryLedgerService {
    constructor(prisma, t) {
        this.prisma = prisma;
        this.t = t;
    }
    async recordTransaction(data, externalTx) {
        if (externalTx) {
            return this.executeInventoryLogic(data, externalTx);
        }
        return (0, retry_helper_1.withRetry)(async () => {
            return await this.prisma.$transaction(async (tx) => {
                return this.executeInventoryLogic(data, tx);
            }, {
                isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable,
            });
        }, { maxAttempts: 3, baseDelayMs: 100, maxDelayMs: 1000 });
    }
    async executeInventoryLogic(data, tx) {
        const { tenantId, branchId, productId, type, quantityChange, referenceType, referenceId, userId, } = data;
        let transactionUnitCost = data.unitCost ? new library_1.Decimal(data.unitCost) : undefined;
        const inventory = await tx.inventory.findFirst({
            where: {
                tenantId,
                branchId,
                productId,
            },
        });
        const currentQty = (inventory === null || inventory === void 0 ? void 0 : inventory.quantity) || 0;
        const currentCost = (inventory === null || inventory === void 0 ? void 0 : inventory.costPrice) || new library_1.Decimal(0);
        const newQty = currentQty + quantityChange;
        if (type === 'SALE' && newQty < 0) {
            throw new common_1.BadRequestException(this.t.translate('errors.inventory.insufficient_stock', 'EN', { product: productId, available: String(currentQty), requested: String(Math.abs(quantityChange)) }));
        }
        let newCost = currentCost;
        if (quantityChange > 0 && transactionUnitCost) {
            const effectiveCurrentQty = Math.max(0, currentQty);
            const oldTotalValue = currentCost.mul(effectiveCurrentQty);
            const addedValue = transactionUnitCost.mul(quantityChange);
            const newTotalValue = oldTotalValue.plus(addedValue);
            if (newQty > 0) {
                newCost = newTotalValue.div(newQty);
            }
        }
        else if (quantityChange < 0) {
            transactionUnitCost = currentCost;
        }
        if (inventory) {
            const currentInventory = inventory;
            const result = await tx.inventory.updateMany({
                where: {
                    id: currentInventory.id,
                    tenantId,
                    version: currentInventory.version,
                },
                data: {
                    quantity: newQty,
                    costPrice: newCost,
                    version: { increment: 1 },
                },
            });
            if (result.count === 0) {
                throw new conflict_exception_1.ConflictException({
                    entity: 'Inventory',
                    entityId: currentInventory.id,
                    yourValue: `version=${currentInventory.version}`,
                    currentValue: 'higher',
                });
            }
        }
        else {
            await tx.inventory.create({
                data: {
                    tenantId,
                    branchId,
                    productId,
                    quantity: newQty,
                    costPrice: newCost,
                    sellingPrice: new library_1.Decimal(0),
                    version: 0,
                },
            });
        }
        return tx.inventoryLedger.create({
            data: {
                tenantId,
                branchId,
                productId,
                type,
                quantityChange,
                costPrice: transactionUnitCost || newCost,
                referenceType,
                referenceId,
                userId,
            },
        });
    }
    async getLedger(branchId, productId) {
        return this.prisma.inventoryLedger.findMany({
            where: Object.assign({ branchId }, (productId && { productId })),
            orderBy: { createdAt: 'desc' },
            include: {
                product: true,
                user: true,
            },
        });
    }
};
exports.InventoryLedgerService = InventoryLedgerService;
exports.InventoryLedgerService = InventoryLedgerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        translation_service_1.TranslationService])
], InventoryLedgerService);
//# sourceMappingURL=inventory-ledger.service.js.map