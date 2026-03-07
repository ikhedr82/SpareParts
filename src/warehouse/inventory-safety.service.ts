import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    InventoryTransactionType,
    InventoryReferenceType
} from '@prisma/client';
import { TranslationService } from '../i18n/translation.service';

@Injectable()
export class InventorySafetyService {
    private readonly logger = new Logger(InventorySafetyService.name);

    constructor(
        private prisma: PrismaService,
        private readonly t: TranslationService,
    ) { }

    /**
     * Reserves stock for an order (Phase 1: ALLOCATE).
     * Throws if insufficient available stock (quantity - allocated).
     * Logs transaction to InventoryLedger.
     */
    async allocate(
        tenantId: string,
        branchId: string,
        items: { productId: string; quantity: number }[],
        referenceType: InventoryReferenceType,
        referenceId: string,
        userId: string,
        tx?: any, // Prisma.TransactionClient
    ) {
        const execute = async (prisma: any) => {
            for (const item of items) {
                const inventory = await prisma.inventory.findUnique({
                    where: {
                        branchId_productId: {
                            branchId,
                            productId: item.productId,
                        },
                    },
                });

                if (!inventory) {
                    throw new NotFoundException(this.t.translate('errors.inventory.product_not_found', 'EN'));
                }

                const available = inventory.quantity - inventory.allocated;
                if (available < item.quantity) {
                    throw new BadRequestException(
                        this.t.translate('errors.inventory.insufficient_stock', 'EN', { product: item.productId, available: String(available), requested: String(item.quantity) }),
                    );
                }

                // Increment Allocated
                await prisma.inventory.update({
                    where: { id: inventory.id },
                    data: {
                        allocated: { increment: item.quantity },
                    },
                });

                // Audit Log
                await this.logTransaction(prisma, {
                    tenantId,
                    branchId,
                    productId: item.productId,
                    quantityChange: item.quantity,
                    type: InventoryTransactionType.ALLOCATION,
                    referenceType,
                    referenceId,
                    userId,
                    costPrice: inventory.costPrice,
                });
            }
        };

        if (tx) {
            return execute(tx);
        } else {
            return this.prisma.$transaction(execute);
        }
    }

    /**
     * Commits stock deduction (Phase 2: COMMIT).
     * Triggered by Shipments/Deliveries.
     * Reduces both Quantity and Allocated.
     */
    async commit(
        tenantId: string,
        branchId: string,
        items: { productId: string; quantity: number }[],
        referenceType: InventoryReferenceType, // DELIVERY_TRIP or ORDER
        referenceId: string,
        userId: string,
        tx?: any,
    ) {
        const execute = async (prisma: any) => {
            // Law R2: Prepare for Revenue Recognition if Order
            let orderItemsMap = new Map<string, number>();
            if (referenceType === InventoryReferenceType.ORDER) {
                const order = await prisma.order.findUnique({
                    where: { id: referenceId },
                    include: { items: true },
                });
                if (order) {
                    order.items.forEach((i: any) => orderItemsMap.set(i.productId, Number(i.unitPrice)));
                }
            }

            for (const item of items) {
                const inventory = await prisma.inventory.findUnique({
                    where: {
                        branchId_productId: {
                            branchId,
                            productId: item.productId,
                        },
                    },
                });

                if (!inventory) {
                    throw new NotFoundException(this.t.translate('errors.inventory.product_not_found', 'EN'));
                }

                // Decrement Quantity AND Allocated (Assuming allocation preceded commit)
                await prisma.inventory.update({
                    where: { id: inventory.id },
                    data: {
                        quantity: { decrement: item.quantity },
                        allocated: { decrement: item.quantity },
                    },
                });

                // Calculate Revenue
                let revenueAmount = null;
                if (referenceType === InventoryReferenceType.ORDER) {
                    const price = orderItemsMap.get(item.productId);
                    if (price !== undefined) {
                        revenueAmount = price * item.quantity;
                    }
                }

                // Audit Log (Commit decreases quantity permanently)
                const ledger = await this.logTransaction(prisma, {
                    tenantId,
                    branchId,
                    productId: item.productId,
                    quantityChange: -item.quantity, // Negative change for stock reduction
                    type: InventoryTransactionType.COMMIT,
                    referenceType,
                    referenceId,
                    userId,
                    costPrice: inventory.costPrice,
                    revenueAmount,
                });

                // Law R2: Create Revenue Ledger Entry linked to Commit
                if (revenueAmount !== null && referenceType === InventoryReferenceType.ORDER) {
                    await prisma.revenueLedger.create({
                        data: {
                            tenantId,
                            branchId,
                            orderId: referenceId,
                            amount: revenueAmount,
                            commitLedgerId: ledger.id,
                        },
                    });
                }
            }
        };

        if (tx) {
            return execute(tx);
        } else {
            return this.prisma.$transaction(execute);
        }
    }

    /**
     * Releases reserved stock (e.g. order cancelled).
     * Reduces Allocated only.
     */
    async deallocate(
        tenantId: string,
        branchId: string,
        items: { productId: string; quantity: number }[],
        referenceType: InventoryReferenceType,
        referenceId: string,
        userId: string,
        tx?: any,
    ) {
        const execute = async (prisma: any) => {
            for (const item of items) {
                const inventory = await prisma.inventory.findUnique({
                    where: {
                        branchId_productId: {
                            branchId,
                            productId: item.productId,
                        },
                    },
                });

                if (!inventory) continue; // Should we throw? Probably just log warning if cancelling non-existent allocation.

                await prisma.inventory.update({
                    where: { id: inventory.id },
                    data: {
                        allocated: { decrement: item.quantity },
                    },
                });

                // Audit Log (Deallocation reverses allocation impact on available stock)
                await this.logTransaction(prisma, {
                    tenantId,
                    branchId,
                    productId: item.productId,
                    quantityChange: -item.quantity, // Negative regarding allocation
                    type: InventoryTransactionType.DEALLOCATION,
                    referenceType,
                    referenceId,
                    userId,
                    costPrice: inventory.costPrice,
                });
            }
        };

        if (tx) {
            return execute(tx);
        } else {
            return this.prisma.$transaction(execute);
        }
    }

    /**
     * Adds stock (Returns, Adjustments, Purchase Receipts).
     * Increments Quantity.
     */
    async restock(
        tenantId: string,
        branchId: string,
        items: { productId: string; quantity: number }[],
        type: InventoryTransactionType, // RETURN, ADJUSTMENT, PURCHASE
        referenceType: InventoryReferenceType,
        referenceId: string,
        userId: string,
        tx?: any,
    ) {
        const execute = async (prisma: any) => {
            for (const item of items) {
                const inventory = await prisma.inventory.upsert({
                    where: {
                        branchId_productId: {
                            branchId,
                            productId: item.productId,
                        },
                    },
                    update: {
                        quantity: { increment: item.quantity },
                    },
                    create: {
                        tenantId,
                        branchId,
                        productId: item.productId,
                        quantity: item.quantity,
                        allocated: 0,
                        costPrice: 0, // Should be updated separately or passed in
                        sellingPrice: 0,
                    },
                });

                // Audit Log
                await this.logTransaction(prisma, {
                    tenantId,
                    branchId,
                    productId: item.productId,
                    quantityChange: item.quantity,
                    type,
                    referenceType,
                    referenceId,
                    userId,
                    costPrice: inventory.costPrice,
                });
            }
        };

        if (tx) {
            return execute(tx);
        } else {
            return this.prisma.$transaction(execute);
        }
    }

    /**
     * Checks availability without locking.
     */
    async checkAvailability(
        branchId: string,
        productId: string,
        requestedQuantity: number,
    ): Promise<boolean> {
        const inventory = await this.prisma.inventory.findUnique({
            where: {
                branchId_productId: {
                    branchId,
                    productId,
                },
            },
        });

        if (!inventory) return false;
        return (inventory.quantity - inventory.allocated) >= requestedQuantity;
    }

    private async logTransaction(tx: any, data: {
        tenantId: string;
        branchId: string;
        productId: string;
        quantityChange: number;
        type: InventoryTransactionType;
        referenceType: InventoryReferenceType;
        referenceId: string;
        userId: string;
        costPrice: any;
        revenueAmount?: number | null;
    }) {
        return tx.inventoryLedger.create({
            data: {
                tenantId: data.tenantId,
                branchId: data.branchId,
                productId: data.productId,
                type: data.type,
                quantityChange: data.quantityChange,
                costPrice: data.costPrice,
                revenueAmount: data.revenueAmount,
                referenceType: data.referenceType,
                referenceId: data.referenceId,
                userId: data.userId,
            },
        });
    }
}
