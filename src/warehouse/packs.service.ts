import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PackStatus, PickListStatus, OrderStatus } from '@prisma/client';
import { TranslationService } from '../i18n/translation.service';

@Injectable()
export class PacksService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly t: TranslationService,
    ) { }

    /**
     * Create a new pack for a picklist
     */
    async createPack(pickListId: string) {
        const pickList = await this.prisma.pickList.findUnique({
            where: { id: pickListId },
            include: {
                packs: true,
                order: true,
            },
        });

        if (!pickList) {
            throw new NotFoundException(this.t.translate('errors.warehouse.picklist_not_found', 'EN'));
        }

        if (pickList.status !== PickListStatus.PICKED) {
            throw new BadRequestException(
                `PickList must be in PICKED status before packing. Current status: ${pickList.status}`,
            );
        }

        // Generate pack number
        const packCount = pickList.packs.length + 1;
        const packNumber = `${packCount}`;

        return await this.prisma.pack.create({
            data: {
                pickListId,
                packNumber,
                status: PackStatus.OPEN,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }

    /**
     * Add item to a pack
     */
    async addItemToPack(packId: string, productId: string, quantity: number) {
        return await this.prisma.$transaction(async (tx) => {
            const pack = await tx.pack.findUnique({
                where: { id: packId },
                include: {
                    pickList: {
                        include: {
                            items: true,
                            order: true,
                        },
                    },
                },
            });

            if (!pack) {
                throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Pack' }));
            }

            if (pack.status !== PackStatus.OPEN) {
                throw new BadRequestException(this.t.translate('errors.warehouse.pack_already_sealed', 'EN'));
            }

            // Verify product exists in picklist
            const pickListItem = pack.pickList.items.find(
                (item) => item.productId === productId,
            );

            if (!pickListItem) {
                throw new BadRequestException(
                    `Product ${productId} is not in this PickList`,
                );
            }

            // Check if product already in pack - if so, update quantity
            const existingPackItem = await tx.packItem.findFirst({
                where: {
                    packId,
                    productId,
                },
            });

            if (existingPackItem) {
                await tx.packItem.update({
                    where: { id: existingPackItem.id },
                    data: {
                        quantity: existingPackItem.quantity + quantity,
                    },
                });
            } else {
                await tx.packItem.create({
                    data: {
                        packId,
                        productId,
                        quantity,
                    },
                });
            }

            // Check if all items are fully packed
            const allPackItems = await tx.packItem.findMany({
                where: {
                    pack: {
                        pickListId: pack.pickListId,
                    },
                },
            });

            // Calculate total packed quantity per product
            const packedQuantities = new Map<string, number>();
            for (const packItem of allPackItems) {
                const current = packedQuantities.get(packItem.productId) || 0;
                packedQuantities.set(packItem.productId, current + packItem.quantity);
            }

            // Check if all picklist items are fully packed
            const allFullyPacked = pack.pickList.items.every((item) => {
                const packed = packedQuantities.get(item.productId) || 0;
                return packed >= item.pickedQty;
            });

            // If all packed, update PickList status to PACKED and Order to PROCESSING
            if (allFullyPacked) {
                await tx.pickList.update({
                    where: { id: pack.pickListId },
                    data: {
                        status: PickListStatus.PACKED,
                    },
                });

                // Automatically move order to PROCESSING
                await tx.order.update({
                    where: { id: pack.pickList.orderId },
                    data: {
                        status: OrderStatus.PROCESSING,
                    },
                });
            }

            // Return updated pack
            return await tx.pack.findUnique({
                where: { id: packId },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    brand: true,
                                    category: true,
                                },
                            },
                        },
                    },
                    pickList: {
                        include: {
                            items: true,
                            order: true,
                        },
                    },
                },
            });
        });
    }

    /**
     * Seal a pack
     */
    async sealPack(packId: string, weight?: number) {
        const pack = await this.prisma.pack.findUnique({
            where: { id: packId },
        });

        if (!pack) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Pack' }));
        }

        if (pack.status === PackStatus.SEALED) {
            throw new BadRequestException(this.t.translate('errors.warehouse.pack_already_sealed', 'EN'));
        }

        return await this.prisma.pack.update({
            where: { id: packId },
            data: {
                status: PackStatus.SEALED,
                weight: weight || pack.weight,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }

    /**
     * Get all packs for a picklist
     */
    async findByPickList(pickListId: string) {
        return await this.prisma.pack.findMany({
            where: { pickListId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                brand: true,
                                category: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                packNumber: 'asc',
            },
        });
    }
}
