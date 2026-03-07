import { Controller, Get, Post, Body, Param, UseGuards, Request, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('mobile/warehouse')
@UseGuards(JwtAuthGuard)
export class WarehouseMobileController {
    constructor(private prisma: PrismaService) { }

    @Get('tasks')
    async getTasks(@Request() req) {
        // Return Pick Lists assigned to this user (or unassigned if needed)
        return this.prisma.pickList.findMany({
            where: {
                tenantId: req.user.tenantId,
                status: 'CREATED',
                OR: [
                    { assignedToId: req.user.id },
                    { assignedToId: null } // Allow picking up unassigned tasks?
                ]
            },
            include: {
                order: {
                    select: { orderNumber: true, branchId: true }
                },
                items: {
                    include: { product: true }
                }
            }
        });
    }

    @Post('scan')
    async scanItem(@Request() req, @Body() body: { pickListId: string; productId: string; barcode: string; quantity: number }) {
        const { pickListId, productId, barcode, quantity } = body;

        // 1. Verify Barcode
        const product = await this.prisma.product.findUnique({
            where: { id: productId }
        });

        // In real app, we check if barcode matches. For now, assume scanner sends productId or we lookup.
        // If scanner sends raw barcode, we'd do: findFirst({ where: { sku: barcode } })

        if (!product) throw new NotFoundException('Product not found');

        // 2. Update Pick List Item
        return this.prisma.$transaction(async (tx) => {
            const item = await tx.pickListItem.findFirst({
                where: { pickListId, productId }
            });

            if (!item) throw new BadRequestException('Item not in pick list');

            const newPickedQty = item.pickedQty + quantity;

            if (newPickedQty > item.requiredQty) {
                throw new BadRequestException('Cannot pick more than requested');
            }

            await tx.pickListItem.update({
                where: { id: item.id },
                data: { pickedQty: newPickedQty }
            });

            // Check if Pick List is complete
            const allItems = await tx.pickListItem.findMany({ where: { pickListId } });
            const allPending = allItems.some(i => i.pickedQty < i.requiredQty);

            if (!allPending) {
                await tx.pickList.update({
                    where: { id: pickListId },
                    data: { status: 'PICKED' } // Assuming this status exists in enum
                });
                // Trigger Packing Workflow?
            }

            return { success: true, picked: newPickedQty, remaining: item.requiredQty - newPickedQty };
        });
    }

    @Post('tasks/:id/assign')
    async assignTask(@Request() req, @Param('id') id: string) {
        return this.prisma.pickList.update({
            where: { id },
            data: { assignedToId: req.user.id }
        });
    }
}
