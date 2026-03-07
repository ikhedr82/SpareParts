import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { InventoryLedgerService } from './inventory-ledger.service';
import { TranslationService } from '../i18n/translation.service';
import { PlanEnforcementService } from '../tenant-admin/plan-enforcement.service';
import { UsageTrackingService } from '../tenant-admin/usage-tracking.service';
import { AuditService } from '../shared/audit.service';

@Injectable()
export class InventoryService {
    constructor(
        private readonly prisma: TenantAwarePrismaService,
        private readonly inventoryLedgerService: InventoryLedgerService,
        private readonly t: TranslationService,
        private readonly planEnforcement: PlanEnforcementService,
        private readonly usageTracking: UsageTrackingService,
        private readonly auditService: AuditService,
    ) { }

    async create(userId: string, createInventoryDto: CreateInventoryDto) {
        const { productId, branchId, quantity, sellingPrice, barcode } = createInventoryDto;

        const branch = await this.prisma.client.branch.findUnique({ where: { id: branchId } });
        if (!branch) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Branch' }));

        // Plan check: only if this is a NEW product for the tenant
        const existing = await this.prisma.client.inventory.findUnique({
            where: { branchId_productId: { branchId, productId } }
        });

        if (!existing) {
            await this.planEnforcement.checkProductLimit(branch.tenantId);
        }

        // Create or update metadata (price, barcode) but start with 0 qty if new
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
                quantity: 0, // Start with 0, adjust later
                sellingPrice,
                barcode,
                costPrice: 0,
            },
            include: {
                product: true,
                branch: true
            }
        });

        // Record Usage Metric (Unique Products)
        const productCountGroup = await this.prisma.client.inventory.groupBy({
            by: ['productId'],
            where: { tenantId: branch.tenantId }
        });
        await this.usageTracking.recordMetric(branch.tenantId, 'PRODUCTS', productCountGroup.length);

        // Add Initial Stock via Ledger if requested
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

            // HC-2/HC-4: Audit log for inventory creation with initial stock
            await this.auditService.logAction(
                branch.tenantId,
                userId,
                'CREATE_INVENTORY',
                'Inventory',
                inventory.id,
                null,
                { branchId, productId, quantity, sellingPrice, barcode },
            );

            // Refetch to return updated state
            return this.prisma.client.inventory.findUnique({
                where: { id: inventory.id },
                include: { product: true, branch: true }
            });
        }

        // HC-2/HC-4: Audit log for inventory creation
        await this.auditService.logAction(
            branch.tenantId,
            userId,
            'CREATE_INVENTORY',
            'Inventory',
            inventory.id,
            null,
            { branchId, productId, sellingPrice, barcode },
        );

        return inventory;
    }

    async findAll(params: {
        branchId?: string;
        search?: string;
        page?: number;
        limit?: number;
    } = {}) {
        const { branchId, search, page = 1, limit = 25 } = params;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};
        if (branchId) {
            where.branchId = branchId;
        }

        if (search) {
            where.OR = [
                { product: { name: { contains: search, mode: 'insensitive' } } },
                { product: { sku: { contains: search, mode: 'insensitive' } } },
                { branch: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [items, total] = await Promise.all([
            this.prisma.client.inventory.findMany({
                where,
                include: {
                    product: {
                        include: {
                            brand: true,
                            category: true
                        }
                    },
                    branch: true
                },
                orderBy: { product: { name: 'asc' } },
                skip,
                take: Number(limit),
            }),
            this.prisma.client.inventory.count({ where }),
        ]);

        return { items, total, page: Number(page), limit: Number(limit) };
    }

    async findOne(id: string) {
        const item = await this.prisma.client.inventory.findFirst({
            where: { id },
            include: {
                product: true,
                branch: true
            }
        });

        if (!item) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Inventory item' }));
        }

        return item;
    }

    async update(id: string, userId: string, dto: UpdateInventoryDto) {
        const item = await this.prisma.client.inventory.findFirst({
            where: { id },
        });

        if (!item) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Inventory item' }));
        }

        if ((dto as any).quantity !== undefined) {
            throw new BadRequestException('Cannot update quantity directly. Use /inventory/adjust endpoint.');
        }

        const updated = await this.prisma.client.inventory.update({
            where: { id: item.id },
            data: dto,
        });

        // HC-2/HC-4: Audit log for inventory update
        await this.auditService.logAction(
            item.tenantId,
            userId,
            'UPDATE_INVENTORY',
            'Inventory',
            item.id,
            item,
            dto,
        );

        return updated;
    }

    async remove(id: string, userId: string) {
        const item = await this.prisma.client.inventory.findFirst({
            where: { id },
        });

        if (!item) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Inventory item' }));
        }

        const deleted = await this.prisma.client.inventory.delete({
            where: { id: item.id },
        });

        // HC-2/HC-4: Audit log for inventory deletion
        await this.auditService.logAction(
            item.tenantId,
            userId,
            'DELETE_INVENTORY',
            'Inventory',
            item.id,
            item,
            null,
        );

        return deleted;
    }

    async adjustStock(userId: string, dto: AdjustInventoryDto) {
        const { branchId, productId, quantityChange, reason, unitCost } = dto;

        const branch = await this.prisma.client.branch.findUnique({ where: { id: branchId } });
        if (!branch) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Branch' }));

        // Fetch current inventory state for before/after audit log
        const inventoryBefore = await this.prisma.client.inventory.findFirst({
            where: { branchId, productId },
        });

        const result = await this.inventoryLedgerService.recordTransaction({
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

        // HC-2/HC-4: Audit log for stock adjustment
        await this.auditService.logAction(
            branch.tenantId,
            userId,
            'ADJUST_STOCK',
            'Inventory',
            inventoryBefore?.id || `${branchId}_${productId}`,
            { quantity: inventoryBefore?.quantity, reason: 'Before adjustment' },
            { quantityChange, reason, unitCost, newQuantity: (inventoryBefore?.quantity ?? 0) + quantityChange },
        );

        return result;
    }

    async getLedger(productId: string, branchId?: string) {
        if (!branchId) {
            throw new BadRequestException('Branch ID is required to view ledger');
        }
        return this.inventoryLedgerService.getLedger(branchId, productId);
    }
}
