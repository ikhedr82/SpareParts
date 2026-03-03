import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { InventoryLedgerService } from './inventory-ledger.service';
import { TranslationService } from '../i18n/translation.service';
import { PlanEnforcementService } from '../tenant-admin/plan-enforcement.service';
import { UsageTrackingService } from '../tenant-admin/usage-tracking.service';

@Injectable()
export class InventoryService {
    constructor(
        private readonly prisma: TenantAwarePrismaService,
        private readonly inventoryLedgerService: InventoryLedgerService,
        private readonly t: TranslationService,
        private readonly planEnforcement: PlanEnforcementService,
        private readonly usageTracking: UsageTrackingService,
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
                // Quantity handling: do not overwrite existing quantity here
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
                unitCost: 0, // Assumption: Initial stock cost is 0 if not provided. Ideally should be provided.
            });

            // Refetch to return updated state
            return this.prisma.client.inventory.findUnique({
                where: { id: inventory.id },
                include: { product: true, branch: true }
            });
        }

        return inventory;
    }

    async findAll(branchId?: string) {
        const where: any = {};
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

    async update(id: string, dto: UpdateInventoryDto) {
        const item = await this.prisma.client.inventory.findFirst({
            where: { id },
        });

        if (!item) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Inventory item' }));
        }

        if (dto.quantity !== undefined) {
            throw new BadRequestException('Cannot update quantity directly. Use /inventory/adjust endpoint.');
        }

        return this.prisma.client.inventory.update({
            where: { id: item.id },
            data: dto,
        });
    }

    async remove(id: string) {
        const item = await this.prisma.client.inventory.findFirst({
            where: { id },
        });

        if (!item) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Inventory item' }));
        }

        // Should we allow deleting inventory with stock?
        // Business rule: Probably not, or ledger should record "TRANSFER_OUT" / "ADJUSTMENT"?
        // For now, allow delete but it orphans ledger entries potentially?
        // Ledger has relation to Product/Branch but not specific Inventory ID (it links by branchId+productId).
        // If we delete Inventory record, Ledger entries remain (history).
        // This is acceptable for history preservation.

        return this.prisma.client.inventory.delete({
            where: { id: item.id },
        });
    }

    async adjustStock(userId: string, dto: AdjustInventoryDto) {
        const { branchId, productId, quantityChange, reason, unitCost } = dto;

        const branch = await this.prisma.client.branch.findUnique({ where: { id: branchId } });
        if (!branch) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Branch' }));

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

    async getLedger(productId: string, branchId?: string) {
        if (!branchId) {
            throw new BadRequestException('Branch ID is required to view ledger');
        }
        return this.inventoryLedgerService.getLedger(branchId, productId);
    }
}
