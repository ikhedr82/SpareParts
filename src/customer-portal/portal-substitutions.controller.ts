import { Controller, Get, Patch, Param, Body, Req, BadRequestException, NotFoundException, UseGuards } from '@nestjs/common';
import { PortalAuthGuard } from './portal-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { SubstitutionStatus } from '@prisma/client';

@Controller('portal/substitutions')
@UseGuards(PortalAuthGuard)
export class PortalSubstitutionsController {
    constructor(private prisma: PrismaService) { }

    @Get('pending')
    async getPending(@Req() req) {
        const { tenantId, businessClientId } = req.user;

        // We need to join Order to ensure it belongs to this client
        return this.prisma.substitution.findMany({
            where: {
                tenantId,
                status: SubstitutionStatus.PENDING,
                order: {
                    businessClientId
                }
            },
            include: {
                originalProduct: true,
                substituteProduct: true,
                order: { select: { orderNumber: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    @Patch(':id/approve')
    async approve(@Req() req, @Param('id') id: string) {
        const { tenantId, businessClientId, id: userId } = req.user;

        const substitution = await this.prisma.substitution.findFirst({
            where: { id, tenantId },
            include: { order: true }
        });

        if (!substitution) throw new NotFoundException('Substitution request not found');
        if (substitution.order.businessClientId !== businessClientId) throw new BadRequestException('Access denied');
        if (substitution.status !== SubstitutionStatus.PENDING) throw new BadRequestException('Already processed');

        return this.prisma.$transaction(async (tx) => {
            // 1. Update Substitution Status
            await tx.substitution.update({
                where: { id },
                data: {
                    status: SubstitutionStatus.APPROVED,
                    respondedAt: new Date(),
                    // reactedBy: userId // if we had this field
                }
            });

            // 2. Update Order Item
            // Replace product ID with substitute
            await tx.orderItem.update({
                where: { id: substitution.orderItemId },
                data: {
                    productId: substitution.substituteProductId,
                    // Price handling? 
                    // Ideally we should have negotiated price in Substitution model.
                    // For now, we keep original price or update to substitute price?
                    // Defaulting to keeping original price (customer expects to pay what they ordered unless told otherwise)
                    // OR we fetch new price. Let's assume price stays same for now for simplicity unless re-quoted.
                }
            });

            // 3. Update PickList Item if exists?
            // If pick list was already generated, we need to update it too.
            // Or if it was generated with "Pending" status waiting for this.

            return { success: true, message: 'Substitution approved' };
        });
    }

    @Patch(':id/reject')
    async reject(@Req() req, @Param('id') id: string) {
        const { tenantId, businessClientId } = req.user;

        const substitution = await this.prisma.substitution.findFirst({
            where: { id, tenantId },
            include: { order: true }
        });

        if (!substitution) throw new NotFoundException('Substitution request not found');
        if (substitution.order.businessClientId !== businessClientId) throw new BadRequestException('Access denied');
        if (substitution.status !== SubstitutionStatus.PENDING) throw new BadRequestException('Already processed');

        return this.prisma.$transaction(async (tx) => {
            // 1. Update Substitution Status
            await tx.substitution.update({
                where: { id },
                data: {
                    status: SubstitutionStatus.REJECTED,
                    respondedAt: new Date()
                }
            });

            // 2. Handle Rejection (Cancel Item)
            // Set quantity to 0 or remove item?
            // Setting quantity to 0 effectively cancels it.
            await tx.orderItem.update({
                where: { id: substitution.orderItemId },
                data: {
                    quantity: 0
                    // total/subtotal on Order might need recalc, but that's complex to trigger here without service.
                }
            });

            return { success: true, message: 'Substitution rejected, item cancelled' };
        });
    }
}
