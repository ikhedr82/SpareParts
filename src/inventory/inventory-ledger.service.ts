import { Injectable, BadRequestException } from '@nestjs/common';
import { ConflictException } from '../common/exceptions/conflict.exception';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryTransactionType, InventoryReferenceType, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { withRetry } from '../common/utils/retry.helper';
import { RecordTransactionDto } from './dto/record-transaction.dto';
import { TranslationService } from '../i18n/translation.service';

@Injectable()
export class InventoryLedgerService {
    constructor(
        private prisma: PrismaService,
        private t: TranslationService,
    ) { }

    async recordTransaction(data: RecordTransactionDto, externalTx?: Prisma.TransactionClient) {
        if (externalTx) {
            return this.executeInventoryLogic(data, externalTx);
        }

        return withRetry(
            async () => {
                return await this.prisma.$transaction(async (tx) => {
                    return this.executeInventoryLogic(data, tx);
                }, {
                    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
                });
            },
            { maxAttempts: 3, baseDelayMs: 100, maxDelayMs: 1000 },
        );
    }

    private async executeInventoryLogic(data: RecordTransactionDto, tx: Prisma.TransactionClient) {
        const {
            tenantId,
            branchId,
            productId,
            type,
            quantityChange,
            referenceType,
            referenceId,
            userId,
        } = data;

        let transactionUnitCost = data.unitCost ? new Decimal(data.unitCost) : undefined;

        // 1. Fetch current inventory (Defensive Querying: findFirst with tenantId)
        const inventory = await tx.inventory.findFirst({
            where: {
                tenantId,
                branchId,
                productId,
            },
        });

        const currentQty = inventory?.quantity || 0;
        const currentCost = inventory?.costPrice || new Decimal(0);
        const newQty = currentQty + quantityChange;

        if (type === 'SALE' && newQty < 0) {
            throw new BadRequestException(this.t.translate('errors.inventory.insufficient_stock', 'EN', { product: productId, available: String(currentQty), requested: String(Math.abs(quantityChange)) }));
        }

        let newCost = currentCost;

        if (quantityChange > 0 && transactionUnitCost) {
            const effectiveCurrentQty = Math.max(0, currentQty);
            const oldTotalValue = currentCost.mul(effectiveCurrentQty);
            const addedValue = transactionUnitCost.mul(quantityChange);
            const newTotalValue = oldTotalValue.plus(addedValue);

            if (newQty > 0) {
                newCost = newTotalValue.div(newQty);
            }
        } else if (quantityChange < 0) {
            transactionUnitCost = currentCost;
        }

        // 3. Update Inventory with Optimistic Locking
        if (inventory) {
            const currentInventory = inventory as any;
            // @ts-ignore
            const result = await tx.inventory.updateMany({
                where: {
                    id: currentInventory.id,
                    tenantId,
                    version: currentInventory.version,
                },
                data: {
                    quantity: newQty,
                    costPrice: newCost,
                    // @ts-ignore
                    version: { increment: 1 },
                },
            });

            if (result.count === 0) {
                throw new ConflictException({
                    entity: 'Inventory',
                    entityId: currentInventory.id,
                    yourValue: `version=${currentInventory.version}`,
                    currentValue: 'higher',
                });
            }
        } else {
            // Create new inventory
            // @ts-ignore
            await tx.inventory.create({
                data: {
                    tenantId,
                    branchId,
                    productId,
                    quantity: newQty,
                    costPrice: newCost,
                    sellingPrice: new Decimal(0),
                    version: 0,
                },
            });
        }

        // 4. Create Ledger Entry
        return tx.inventoryLedger.create({
            data: {
                tenantId,
                branchId,
                productId,
                type,
                quantityChange,
                costPrice: transactionUnitCost || newCost,
                referenceType,
                referenceId,
                userId,
            },
        });
    }

    async getLedger(branchId: string, productId?: string) {
        return this.prisma.inventoryLedger.findMany({
            where: {
                branchId,
                ...(productId && { productId }),
            },
            orderBy: { createdAt: 'desc' },
            include: {
                product: true,
                user: true,
            },
        });
    }
}
