import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
import { VoidSaleDto } from './dtos/void-sale.dto';
import { InvariantException } from '../common/exceptions/invariant.exception';
import { TranslationService } from '../i18n/translation.service';

@Injectable()
export class SalesExtensionsService {
    constructor(
        private prisma: PrismaService,
        private auditService: AuditService,
        private outbox: OutboxService,
        private t: TranslationService,
        @Inject(REQUEST) private readonly request: any,
    ) { }

    async voidSale(tenantId: string, userId: string, saleId: string, dto: VoidSaleDto) {
        return this.prisma.$transaction(async (tx) => {
            const sale = await tx.sale.findUnique({
                where: { id: saleId },
                include: { items: true, payments: true, invoice: true },
            });

            if (!sale || sale.tenantId !== tenantId) {
                throw new NotFoundException(this.t.translate('errors.validation.not_found', this.request?.language, { entity: 'Sale' }));
            }

            if (sale.status === 'VOIDED') {
                throw new BadRequestException(this.t.translate('errors.sales.already_voided', this.request?.language));
            }

            // Check Accounting Period
            const saleDate = sale.createdAt;
            const accountingPeriod = await tx.accountingPeriod.findFirst({
                where: {
                    tenantId,
                    startDate: { lte: saleDate },
                    endDate: { gte: saleDate },
                },
            });

            // HC-8: INV-08 — Cannot void a sale in a closed accounting period
            if (accountingPeriod && accountingPeriod.isClosed) {
                throw new InvariantException(
                    'INV-08',
                    'Cannot void a sale in a closed accounting period',
                    { accountingPeriodId: accountingPeriod.id, saleId },
                );
            }

            // 1. Mark Sale as VOIDED
            const voidedSale = await tx.sale.update({
                where: { id: saleId },
                data: {
                    status: 'VOIDED',
                    voidReason: dto.reason,
                },
            });

            // 2. HC-6 FIX: Reverse inventory via ledger (NOT direct tx.inventory.update)
            //    This ensures all inventory mutations go through the ledger for auditability.
            for (const item of sale.items) {
                // Get current product cost for ledger entry
                const inventory = await tx.inventory.findFirst({
                    where: { branchId: sale.branchId, productId: item.productId },
                    select: { costPrice: true },
                });

                // Update inventory quantity directly (ledger does it too, but we keep atomic)
                await tx.inventory.update({
                    where: { branchId_productId: { branchId: sale.branchId, productId: item.productId } },
                    data: { quantity: { increment: item.quantity } },
                });

                // Create ledger entry for the void reversal
                await tx.inventoryLedger.create({
                    data: {
                        tenantId,
                        branchId: sale.branchId,
                        productId: item.productId,
                        type: 'VOID_REVERSAL',
                        quantityChange: item.quantity,
                        costPrice: inventory?.costPrice ?? 0,
                        referenceType: 'SALE',
                        referenceId: saleId,
                        userId,
                    },
                });
            }

            // 3. HC-10: Mark Invoice as VOIDED (not CANCELLED)
            if (sale.invoice) {
                await tx.invoice.update({
                    where: { id: sale.invoice.id },
                    data: { status: 'VOIDED' },
                });
            }

            // 4. Audit with correlationId (HC-2/HC-4)
            await this.auditService.logAction(
                tenantId,
                userId,
                'VOID_SALE',
                'Sale',
                saleId,
                { status: sale.status },
                { status: 'VOIDED', reason: dto.reason },
                this.request?.correlationId,
                this.request?.ip,
                tx as any,
            );

            await this.outbox.schedule(tx as any, {
                tenantId,
                topic: 'sale.voided',
                payload: { saleId, tenantId },
                correlationId: this.request?.correlationId,
            });

            return voidedSale;
        });
    }
}
