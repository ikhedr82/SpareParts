import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { PortalAuthGuard } from './portal-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { InventorySafetyService } from '../warehouse/inventory-safety.service';

@Controller('portal/inventory')
@UseGuards(PortalAuthGuard)
export class PortalInventoryController {
    constructor(
        private prisma: PrismaService,
        private inventorySafety: InventorySafetyService
    ) { }

    @Get()
    async search(@Req() req, @Query('q') query: string, @Query('category') categoryId: string) {
        const { tenantId } = req.user;

        // 1. Fetch Products with public fields
        const products = await this.prisma.product.findMany({
            where: {
                name: { contains: query, mode: 'insensitive' },
                ...(categoryId && { categoryId }),
                status: 'ACTIVE',
                // Also need to check if they are available in the tenant's catalog/inventory?
                // Assuming strict tenant separation in Product? No, Products are usually shared or tenant-linked?
                // Looking at schema: Product has NO tenantId?
                // Wait, Product is global? OR Products are tenant scoped?
                // Schema at L353: Product does NOT have tenantId.
                // But Inventory DOES have tenantId.
                // So we must join with Inventory to see what this Tenant sells.
                inventory: {
                    some: { tenantId }
                }
            },
            include: {
                inventory: {
                    where: { tenantId },
                    select: {
                        sellingPrice: true,
                        quantity: true,
                        allocated: true,
                        branchId: true
                    }
                },
                category: true,
                brand: true
            },
            take: 50
        });

        // 2. Transform result to hide sensitive info and aggregate availability
        return products.map(p => {
            const totalQty = p.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
            const totalAllocated = p.inventory.reduce((sum, inv) => sum + inv.allocated, 0);
            const available = Math.max(0, totalQty - totalAllocated);

            // Price: simplistic logic, take the first valid price found or average
            const price = p.inventory.find(i => Number(i.sellingPrice) > 0)?.sellingPrice || 0;

            return {
                id: p.id,
                name: p.name,
                description: p.description,
                brand: p.brand.name,
                category: p.category.name,
                sku: p.name, // Assuming name is SKU or similar
                price,
                available, // Real-time availability
                unitOfMeasure: p.unitOfMeasure,
                images: p.images
            };
        });
    }
}
