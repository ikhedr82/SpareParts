import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../shared/audit.service';
import { EventBus } from '../shared/event-bus.service';
import { OutboxService } from '../shared/outbox.service';
import { TranslationService } from '../i18n/translation.service';
import { PickItemDto } from './dtos/pick-item.dto';

@Injectable()
export class WarehouseService {
    constructor(
        private prisma: PrismaService,
        private auditService: AuditService,
        private outbox: OutboxService,
        private t: TranslationService,
    ) { }

    async pickItem(tenantId: string, userId: string, pickListId: string, itemId: string, dto: PickItemDto) {
        return this.prisma.$transaction(async (tx) => {
            const pickList = await tx.pickList.findUnique({ where: { id: pickListId }, include: { items: true } });
            if (!pickList || pickList.tenantId !== tenantId) throw new NotFoundException(this.t.translate('errors.warehouse.picklist_not_found', 'EN'));

            const item = pickList.items.find(i => i.id === itemId);
            if (!item) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Pick List Item' }));

            if (item.status === 'PICKED') throw new BadRequestException('Item already picked');

            // Verify Product Barcode (Mock check as Access to Product table needed)
            // const product = await tx.product.findUnique({ where: { id: item.productId } });
            // if (product.barcode !== dto.scannedBarcode) throw new BadRequestException('Invalid barcode');

            if (dto.quantity > (item.requiredQty - item.pickedQty)) {
                throw new BadRequestException(this.t.translate('errors.warehouse.quantity_exceeds_requested', 'EN'));
            }

            // Update Pick Item
            const updatedItem = await tx.pickListItem.update({
                where: { id: itemId },
                data: {
                    pickedQty: { increment: dto.quantity },
                    status: (item.pickedQty + dto.quantity) >= item.requiredQty ? 'PICKED' : 'PENDING',
                    binLocation: dto.binLocation // Record actual bin picked from
                }
            });

            // Check if entire list is picked
            const allItems = await tx.pickListItem.findMany({ where: { pickListId } });
            const allPicked = allItems.every(i => i.status === 'PICKED');

            if (allPicked) {
                await tx.pickList.update({
                    where: { id: pickListId },
                    data: { status: 'PICKED', completedAt: new Date() }
                });
            }

            // Logical Inventory Move: From Bin -> Pack Station (Optional, depending on complexity)
            // Strictly speaking, inventory is still in warehouse but state changed.

            await this.auditService.logAction(
                tenantId,
                userId,
                'PICK_ITEM',
                'PickListItem',
                itemId,
                { pickedQty: item.pickedQty },
                { pickedQty: updatedItem.pickedQty },
                undefined,
                undefined,
                tx,
            );

            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'item.picked',
                payload: { pickListId, itemId, quantity: dto.quantity },
            });

            return { pickListStatus: allPicked ? 'PICKED' : 'PICKING', item: updatedItem };
        });
    }
}
