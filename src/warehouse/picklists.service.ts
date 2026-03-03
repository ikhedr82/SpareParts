import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PickListStatus, PickListItemStatus } from '@prisma/client';
import { assertTransition, PICKLIST_TRANSITIONS } from '../common/guards/fsm.guard';
import { AuditService } from '../shared/audit.service';
import { TranslationService } from '../i18n/translation.service';

@Injectable()
export class PickListsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditService: AuditService,
        private readonly t: TranslationService,
    ) { }

    /**
     * Automatically create a PickList for a confirmed order
     */
    async createPickListForOrder(orderId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { product: true } } },
        });

        if (!order) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Order' }));

        const existing = await this.prisma.pickList.findUnique({ where: { orderId } });
        if (existing) return existing;

        return await this.prisma.$transaction(async (tx) => {
            const pickList = await tx.pickList.create({
                data: {
                    tenantId: order.tenantId,
                    branchId: order.branchId,
                    orderId: order.id,
                    status: PickListStatus.CREATED,
                },
            });

            for (const orderItem of order.items) {
                const inventory = await tx.inventory.findUnique({
                    where: {
                        branchId_productId: {
                            branchId: order.branchId,
                            productId: orderItem.productId,
                        },
                    },
                });

                if (!inventory) {
                    throw new BadRequestException(
                        this.t.translate('errors.inventory.product_not_found', 'EN'),
                    );
                }

                await tx.pickListItem.create({
                    data: {
                        pickListId: pickList.id,
                        productId: orderItem.productId,
                        inventoryId: inventory.id,
                        requiredQty: orderItem.quantity,
                        binLocation: inventory.binLocation,
                        status: PickListItemStatus.PENDING,
                    },
                });
            }

            return await tx.pickList.findUnique({
                where: { id: pickList.id },
                include: {
                    items: { include: { product: { include: { brand: true, category: true } } } },
                    branch: true,
                    order: true,
                },
            });
        });
    }

    async findAll(tenantId: string, branchId?: string, status?: PickListStatus) {
        const where: any = { tenantId };
        if (branchId) where.branchId = branchId;
        if (status) where.status = status;

        return await this.prisma.pickList.findMany({
            where,
            include: {
                branch: { select: { id: true, name: true } },
                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        businessClient: { select: { businessName: true } },
                    },
                },
                _count: { select: { items: true, packs: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, tenantId: string) {
        const pickList = await this.prisma.pickList.findFirst({
            where: { id, tenantId },
            include: {
                items: {
                    include: { product: { include: { brand: true, category: true } } },
                    orderBy: { binLocation: 'asc' },
                },
                branch: true,
                order: { include: { businessClient: true, deliveryAddress: true, contact: true } },
                packs: { include: { items: { include: { product: true } } } },
            },
        });

        if (!pickList) throw new NotFoundException(this.t.translate('errors.warehouse.picklist_not_found', 'EN'));
        return pickList;
    }

    // G-07: startPicking validates that associated trip is IN_TRANSIT (dispatched) if one exists
    async startPicking(id: string, userId: string, correlationId?: string, tenantId?: string) {
        const pickList = await this.findOne(id, tenantId!);
        if (!pickList) throw new NotFoundException(this.t.translate('errors.warehouse.picklist_not_found', 'EN'));

        // ✅ FSM Gate: Strictly enforce transition
        assertTransition('PickList', id, pickList.status, PickListStatus.PICKING, PICKLIST_TRANSITIONS);

        // G-07: if the order has an associated trip, ensure it is IN_TRANSIT before picking
        if (pickList.orderId) {
            const tripStop = await this.prisma.tripStop.findFirst({
                where: { orderId: pickList.orderId },
                include: { trip: { select: { id: true, status: true } } },
            });

            if (tripStop?.trip && !['IN_TRANSIT', 'COMPLETED'].includes(tripStop.trip.status)) {
                throw new BadRequestException(
                    `Cannot start picking: the associated delivery trip is ${tripStop.trip.status}. Dispatch the trip first.`
                );
            }
        }

        const updated = await this.prisma.pickList.update({
            where: { id },
            data: { status: PickListStatus.PICKING, startedAt: new Date() },
            include: { items: { include: { product: true } } },
        });

        // ✅ Audit Gate
        await this.auditService.logAction(
            pickList.tenantId,
            userId,
            'START_PICKING',
            'PickList',
            id,
            { status: pickList.status },
            { status: PickListStatus.PICKING },
            correlationId
        );

        return updated;
    }

    /**
     * Record picked quantity for an item
     * G-07: Validates that no FAILED/COMPLETED trip blocks picking
     */
    async pickItem(pickListId: string, pickListItemId: string, pickedQty: number) {
        return await this.prisma.$transaction(async (tx) => {
            const pickListItem = await tx.pickListItem.findUnique({
                where: { id: pickListItemId },
                include: { pickList: true },
            });

            if (!pickListItem) {
                throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'PickListItem' }));
            }

            if (pickListItem.pickListId !== pickListId) {
                throw new BadRequestException(
                    `PickListItem does not belong to PickList ${pickListId}`,
                );
            }

            // G-07: Fetch associated order's trip and ensure it's not already FAILED/COMPLETED
            const pickListForTrip = await tx.pickList.findUnique({ where: { id: pickListId } });
            if (pickListForTrip?.orderId) {
                const tripStop = await tx.tripStop.findFirst({
                    where: { orderId: pickListForTrip.orderId },
                    include: { trip: { select: { id: true, status: true } } },
                });
                if (tripStop?.trip && ['FAILED', 'COMPLETED'].includes(tripStop.trip.status)) {
                    throw new BadRequestException(
                        `Cannot pick: the delivery trip is ${tripStop.trip.status}. Create a new trip.`
                    );
                }
            }

            // Determine item status
            let itemStatus: PickListItemStatus;
            if (pickedQty >= pickListItem.requiredQty) {
                itemStatus = PickListItemStatus.PICKED;
            } else if (pickedQty > 0) {
                itemStatus = PickListItemStatus.SHORTAGE;
            } else {
                itemStatus = PickListItemStatus.PENDING;
            }

            await tx.pickListItem.update({
                where: { id: pickListItemId },
                data: { pickedQty, status: itemStatus },
            });

            const allItems = await tx.pickListItem.findMany({ where: { pickListId } });
            const allPicked = allItems.every(
                (item) => item.id === pickListItemId
                    ? itemStatus === PickListItemStatus.PICKED
                    : item.status === PickListItemStatus.PICKED,
            );

            if (allPicked) {
                await tx.pickList.update({
                    where: { id: pickListId },
                    data: { status: PickListStatus.PICKED, completedAt: new Date() },
                });
            }

            return await tx.pickList.findUnique({
                where: { id: pickListId },
                include: { items: { include: { product: true } } },
            });
        });
    }

    async cancelPickList(id: string, tenantId: string) {
        const pickList = await this.findOne(id, tenantId);

        // ✅ G-08: FSM Guard
        assertTransition('PickList', id, pickList.status, PickListStatus.CANCELLED, PICKLIST_TRANSITIONS);

        return await this.prisma.pickList.update({
            where: { id },
            data: { status: PickListStatus.CANCELLED },
        });
    }
}
