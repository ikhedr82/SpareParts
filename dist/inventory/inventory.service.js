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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const tenant_aware_prisma_service_1 = require("../prisma/tenant-aware-prisma.service");
const inventory_ledger_service_1 = require("./inventory-ledger.service");
const translation_service_1 = require("../i18n/translation.service");
const plan_enforcement_service_1 = require("../tenant-admin/plan-enforcement.service");
const usage_tracking_service_1 = require("../tenant-admin/usage-tracking.service");
let InventoryService = class InventoryService {
    constructor(prisma, inventoryLedgerService, t, planEnforcement, usageTracking) {
        this.prisma = prisma;
        this.inventoryLedgerService = inventoryLedgerService;
        this.t = t;
        this.planEnforcement = planEnforcement;
        this.usageTracking = usageTracking;
    }
    async create(userId, createInventoryDto) {
        const { productId, branchId, quantity, sellingPrice, barcode } = createInventoryDto;
        const branch = await this.prisma.client.branch.findUnique({ where: { id: branchId } });
        if (!branch)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Branch' }));
        const existing = await this.prisma.client.inventory.findUnique({
            where: { branchId_productId: { branchId, productId } }
        });
        if (!existing) {
            await this.planEnforcement.checkProductLimit(branch.tenantId);
        }
        const inventory = await this.prisma.client.inventory.upsert({
            where: { branchId_productId: { branchId, productId } },
            update: {
                sellingPrice,
                barcode,
            },
            create: {
                tenantId: branch.tenantId,
                branchId,
                productId,
                quantity: 0,
                sellingPrice,
                barcode,
                costPrice: 0,
            },
            include: {
                product: true,
                branch: true
            }
        });
        const productCountGroup = await this.prisma.client.inventory.groupBy({
            by: ['productId'],
            where: { tenantId: branch.tenantId }
        });
        await this.usageTracking.recordMetric(branch.tenantId, 'PRODUCTS', productCountGroup.length);
        if (quantity > 0) {
            await this.inventoryLedgerService.recordTransaction({
                tenantId: branch.tenantId,
                branchId,
                productId,
                type: 'ADJUSTMENT',
                quantityChange: quantity,
                referenceType: 'ADJUSTMENT',
                referenceId: 'Initial Stock',
                userId,
                unitCost: 0,
            });
            return this.prisma.client.inventory.findUnique({
                where: { id: inventory.id },
                include: { product: true, branch: true }
            });
        }
        return inventory;
    }
    async findAll(branchId) {
        const where = {};
        if (branchId) {
            where.branchId = branchId;
        }
        return this.prisma.client.inventory.findMany({
            where,
            include: {
                product: {
                    include: {
                        brand: true,
                        category: true
                    }
                },
                branch: true
            }
        });
    }
    async findOne(id) {
        const item = await this.prisma.client.inventory.findFirst({
            where: { id },
            include: {
                product: true,
                branch: true
            }
        });
        if (!item) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Inventory item' }));
        }
        return item;
    }
    async update(id, dto) {
        const item = await this.prisma.client.inventory.findFirst({
            where: { id },
        });
        if (!item) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Inventory item' }));
        }
        if (dto.quantity !== undefined) {
            throw new common_1.BadRequestException('Cannot update quantity directly. Use /inventory/adjust endpoint.');
        }
        return this.prisma.client.inventory.update({
            where: { id: item.id },
            data: dto,
        });
    }
    async remove(id) {
        const item = await this.prisma.client.inventory.findFirst({
            where: { id },
        });
        if (!item) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Inventory item' }));
        }
        return this.prisma.client.inventory.delete({
            where: { id: item.id },
        });
    }
    async adjustStock(userId, dto) {
        const { branchId, productId, quantityChange, reason, unitCost } = dto;
        const branch = await this.prisma.client.branch.findUnique({ where: { id: branchId } });
        if (!branch)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Branch' }));
        return this.inventoryLedgerService.recordTransaction({
            tenantId: branch.tenantId,
            branchId,
            productId,
            type: 'ADJUSTMENT',
            quantityChange,
            referenceType: 'ADJUSTMENT',
            referenceId: reason,
            userId,
            unitCost
        });
    }
    async getLedger(productId, branchId) {
        if (!branchId) {
            throw new common_1.BadRequestException('Branch ID is required to view ledger');
        }
        return this.inventoryLedgerService.getLedger(branchId, productId);
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_aware_prisma_service_1.TenantAwarePrismaService,
        inventory_ledger_service_1.InventoryLedgerService,
        translation_service_1.TranslationService,
        plan_enforcement_service_1.PlanEnforcementService,
        usage_tracking_service_1.UsageTrackingService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map