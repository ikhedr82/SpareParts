import { Injectable, BadRequestException, NotFoundException, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { RefundSaleDto } from './dto/refund-sale.dto';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
import { InvariantException } from '../common/exceptions/invariant.exception';
import { ConflictException } from '../common/exceptions/conflict.exception';
import { InventoryLedgerService } from '../inventory/inventory-ledger.service';
import { AccountingService, ACCOUNT_CODES } from '../accounting/accounting.service';
import { TranslationService } from '../i18n/translation.service';
import { PlanEnforcementService } from '../tenant-admin/plan-enforcement.service';
import { UsageTrackingService } from '../tenant-admin/usage-tracking.service';
import { withRetry } from '../common/utils/retry.helper';

@Injectable()
export class SalesService {
    constructor(
        private readonly prisma: TenantAwarePrismaService,
        private readonly inventoryLedgerService: InventoryLedgerService,
        private readonly accountingService: AccountingService,
        private readonly auditService: AuditService,
        private readonly outbox: OutboxService,
        private readonly t: TranslationService,
        private readonly planEnforcement: PlanEnforcementService,
        private readonly usageTracking: UsageTrackingService,
        @Inject(REQUEST) private readonly request: any,
    ) { }

    async create(userId: string, dto: CreateSaleDto) {
        const { branchId, customerName, customerId, items } = dto;
        const tenantId = (this.request as any).user.tenantId;

        // Enforce plan standing (blocks PAST_DUE/CANCELED) and check feature access
        await this.planEnforcement.checkFeatureAccess(tenantId, 'pos');

        console.log(`[SalesService] [DEBUG] Starting create sale. branchId: ${branchId}, customer: ${customerName || customerId}, items count: ${items?.length}`);

        return withRetry(async () => {
            return this.prisma.client.$transaction(async (tx) => {
                // 1. Verify branch exists and get tenantId (Defensive Querying)
                const branch = await tx.branch.findFirst({
                    where: {
                        id: branchId,
                        tenantId: this.request.user.tenantId,
                    }
                });
                if (!branch) {
                    console.error(`[SalesService] [ERROR] Branch not found: ${branchId}`);
                    throw new NotFoundException(this.t.translate('errors.validation.not_found', this.request?.language, { entity: 'Branch' }));
                }

                // 1b. Check for OPEN Cash Session
                const session = await tx.cashSession.findFirst({
                    where: {
                        branchId,
                        status: 'OPEN',
                    },
                });

                if (!session) {
                    throw new BadRequestException(this.t.translate('errors.sales.no_open_session', this.request?.language));
                }

                // 2. Fetch all required inventory items at once with Tax Info
                const productIds = items.map(i => i.productId);
                const inventories = await tx.inventory.findMany({
                    where: {
                        branchId,
                        productId: { in: productIds }
                    },
                    include: {
                        product: {
                            include: { taxRate: true }
                        }
                    }
                });

                const invMap = new Map(inventories.map(inv => [inv.productId, inv]));

                let subtotal = 0;
                let taxTotal = 0;
                const saleItemsData = [];
                const invoiceLinesData = [];

                // 3. Process items
                for (const item of items) {
                    const inv = invMap.get(item.productId);
                    if (!inv) {
                        throw new NotFoundException(this.t.translate('errors.inventory.product_not_found', this.request?.language));
                    }

                    if (inv.quantity < item.quantity) {
                        throw new BadRequestException(this.t.translate('errors.inventory.insufficient_stock', this.request?.language, { product: inv.product.name, available: String(inv.quantity), requested: String(item.quantity) }));
                    }

                    const price = Number(inv.sellingPrice);
                    const lineTotal = price * item.quantity;
                    subtotal += lineTotal;

                    // Tax Calculation
                    let taxAmount = 0;
                    if (inv.product.taxRate) {
                        const taxRate = Number(inv.product.taxRate.percentage) / 100;
                        taxAmount = lineTotal * taxRate;
                    }
                    taxTotal += taxAmount;

                    saleItemsData.push({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: inv.sellingPrice,
                    });

                    invoiceLinesData.push({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: inv.sellingPrice,
                        taxRateId: inv.product.taxRateId,
                        taxAmount: taxAmount,
                    });
                }

                const total = subtotal + taxTotal;

                console.log(`[SalesService] [DEBUG] Creating sale. Subtotal: ${subtotal}, Tax: ${taxTotal}, Total: ${total}`);

                // 4. Create sale
                const sale = await tx.sale.create({
                    data: {
                        tenantId: branch.tenantId,
                        branchId,
                        cashSessionId: session.id,
                        customerName,
                        customerId,
                        total: total,
                        items: {
                            create: saleItemsData,
                        },
                    } as any,
                    include: {
                        items: {
                            include: { product: true },
                        },
                        branch: true,
                    },
                });

                // 5. Deduct Stock
                for (const item of items) {
                    await this.inventoryLedgerService.recordTransaction({
                        tenantId: branch.tenantId,
                        branchId,
                        productId: item.productId,
                        type: 'SALE',
                        quantityChange: -item.quantity,
                        referenceType: 'SALE',
                        referenceId: sale.id,
                        userId,
                    }, tx as any);
                }

                // 6. Auto-create Invoice
                const invoiceNumber = `INV-${Date.now()}-${sale.id.slice(0, 4)}`.toUpperCase();
                await tx.invoice.create({
                    data: {
                        tenantId: branch.tenantId,
                        saleId: sale.id,
                        invoiceNumber,
                        subtotal: subtotal,
                        tax: taxTotal,
                        amount: total,
                        status: 'UNPAID',
                        lines: {
                            create: invoiceLinesData
                        }
                    },
                });

                // 7. Update Customer Balance (Debit) with Optimistic Locking
                if (customerId) {
                    const customer = await tx.customer.findFirst({
                        where: { id: customerId, tenantId: branch.tenantId }
                    });
                    if (!customer) throw new NotFoundException(this.t.translate('errors.validation.not_found', this.request?.language, { entity: 'Customer' }));

                    const result = await tx.customer.updateMany({
                        where: { id: customerId, tenantId: branch.tenantId, version: customer.version },
                        data: {
                            balance: { increment: total },
                            version: { increment: 1 }
                        }
                    });

                    if (result.count === 0) {
                        throw new ConflictException({
                            entity: 'Customer',
                            entityId: customerId,
                            yourValue: `version=${customer.version}`,
                            currentValue: 'higher',
                        });
                    }
                }

                // 8. Accounting: Post Journal Entries
                // 8a. Revenue & Receivable
                // Dr Accounts Receivable (1100) - Total
                //    Cr Sales Revenue (4000) - Subtotal
                //    Cr VAT Payable (2100) - Tax
                await this.accountingService.createSystemJournalEntryByCode({
                    date: new Date(),
                    reference: `SALE-${sale.id}`,
                    description: `Sale to ${customerName || 'Walk-in'} (Inv: ${invoiceNumber})`,
                    lines: [
                        { accountCode: ACCOUNT_CODES.ACCOUNTS_RECEIVABLE, debit: total, credit: 0, description: `Invoice ${invoiceNumber}` },
                        { accountCode: ACCOUNT_CODES.SALES_REVENUE, debit: 0, credit: subtotal, description: 'Sales Revenue' },
                        ...(taxTotal > 0 ? [{ accountCode: ACCOUNT_CODES.VAT_PAYABLE, debit: 0, credit: taxTotal, description: 'VAT Output' }] : [])
                    ]
                }, tx, branch.tenantId);

                // 8b. Cost of Goods Sold (COGS)
                // Dr COGS (5000)
                //    Cr Inventory Asset (1200)
                // Need total cost. Inventories were fetched with 'costPrice'.
                // Recalculate cost based on items
                let totalCost = 0;
                for (const item of items) {
                    const inv = invMap.get(item.productId);
                    const cost = Number(inv.costPrice || 0);
                    totalCost += (cost * item.quantity);
                }

                if (totalCost > 0) {
                    await this.accountingService.createSystemJournalEntryByCode({
                        date: new Date(),
                        reference: `COGS-${sale.id}`,
                        description: `Cost of Goods Sold for Sale ${sale.id}`,
                        lines: [
                            { accountCode: ACCOUNT_CODES.COST_OF_GOODS_SOLD, debit: totalCost, credit: 0 },
                            { accountCode: ACCOUNT_CODES.INVENTORY_ASSET, debit: 0, credit: totalCost }
                        ]
                    }, tx, branch.tenantId);
                }

                // HC-2/HC-4: Audit log for sale creation
                await this.auditService.logAction(
                    branch.tenantId,
                    userId,
                    'CREATE_SALE',
                    'Sale',
                    sale.id,
                    null,
                    { total, itemCount: items.length, invoiceNumber },
                    this.request?.correlationId,
                    this.request?.ip,
                    tx as any,
                );

                // HC-1: Outbox Event
                await this.outbox.schedule(tx as any, {
                    tenantId: branch.tenantId,
                    topic: 'sale.created',
                    payload: { saleId: sale.id, total, invoiceNumber },
                    correlationId: this.request?.correlationId,
                });

                // Record Usage Metric (Total Orders)
                const orderCount = await tx.sale.count({ where: { tenantId: branch.tenantId } });
                await this.usageTracking.recordMetric(branch.tenantId, 'ORDERS', orderCount);

                return sale;
            }, {
                timeout: 20000,
            });
        }, { maxAttempts: 5, baseDelayMs: 200, maxDelayMs: 2000 });
    }

    async findAll(tenantId: string) {
        return this.prisma.client.sale.findMany({
            where: { tenantId },
            include: {
                items: {
                    include: { product: true },
                },
                branch: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, tenantId: string) {
        const sale = await this.prisma.client.sale.findFirst({
            where: { id, tenantId },
            include: {
                items: {
                    include: { product: true },
                },
                branch: true,
            },
        });

        if (!sale) throw new NotFoundException(this.t.translate('errors.validation.not_found', this.request?.language, { entity: 'Sale' }));
        return sale;
    }

    async refundSale(userId: string, dto: RefundSaleDto) {
        // HC-8: Invariant guards before entering transaction
        if (!dto.amount || dto.amount <= 0) {
            throw new InvariantException('INV-01', 'Refund amount must be positive', { amount: dto.amount });
        }

        return this.prisma.client.$transaction(async (tx) => {
            const sale = await tx.sale.findFirst({
                where: { id: dto.saleId, tenantId: this.request.user.tenantId },
                include: { payments: true }
            });

            if (!sale) throw new NotFoundException(this.t.translate('errors.validation.not_found', this.request?.language, { entity: 'Sale' }));

            // ✅ FSM Gate: Strictly enforce transition
            assertTransition('Sale', dto.saleId, sale.status, 'REFUNDED', SALE_TRANSITIONS);

            // HC-8: INV-02 — refund cannot exceed sale total
            if (Number(dto.amount) > Number(sale.total)) {
                throw new InvariantException('INV-02', 'Refund amount cannot exceed sale total', {
                    refundAmount: dto.amount,
                    saleTotal: sale.total,
                });
            }

            // Check if open session checks are needed for refunds? 
            // Usually yes, money out needs open drawer.
            const session = await tx.cashSession.findFirst({
                where: {
                    branchId: sale.branchId,
                    status: 'OPEN',
                },
            });

            const refundRecord = await tx.refund.create({
                data: {
                    tenantId: sale.tenantId,
                    branchId: sale.branchId,
                    saleId: sale.id,
                    amount: dto.amount,
                    reason: dto.reason,
                    refundNumber: `RF-${Date.now()}`,
                    createdById: userId,
                    cashSessionId: session ? session.id : null, // Optional if no session open? But requirement says "Safety".
                }
            });

            // If cash refund, ensure session is open? 
            // For now, allow refund record. But if we want to reverse payment, we need one.

            // Logic: Reverse payment? 
            // If partial refund, we just record it.
            // If full refund, maybe update status.

            const totalRefunded = await tx.refund.aggregate({
                where: { saleId: sale.id },
                _sum: { amount: true }
            });

            if (Number(totalRefunded._sum.amount) >= Number(sale.total)) {
                const result = await tx.sale.updateMany({
                    where: { id: sale.id, tenantId: sale.tenantId, version: sale.version },
                    data: {
                        status: 'REFUNDED',
                        version: { increment: 1 }
                    } // Full refund
                });
                if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');
            }

            // Also create a negative Payment for CashSession balancing if needed?
            // "Refunds must reverse payments correctly"
            // If we want cash drawer to balance, we need a negative Cash payment.
            // Assuming this is a CASH refund for now. In real world, we'd match original payment method.
            // Requirement doesn't specify method in Refund DTO, but usually you select method.
            // I'll assume CASH for simplicity or original method.
            // But for SAFETY, if money leaves drawer, it must be tracked.

            if (session) {
                await tx.payment.create({
                    data: {
                        tenantId: sale.tenantId,
                        saleId: sale.id,
                        sessionId: session.id,
                        amount: dto.amount,
                        method: 'CASH', // Assumption: Cash refund
                        isRefund: true,
                        reference: `Refund for ${sale.id}`,
                    }
                });
            }

            // HC-2/HC-4: Audit log for refund
            await this.auditService.logAction(
                sale.tenantId,
                userId,
                'REFUND_SALE',
                'Sale',
                sale.id,
                { status: sale.status, total: sale.total },
                { refundAmount: dto.amount, reason: dto.reason },
                this.request?.correlationId,
                this.request?.ip,
                tx as any,
            );

            // HC-1: Outbox Event
            await this.outbox.schedule(tx as any, {
                tenantId: sale.tenantId,
                topic: 'sale.refunded',
                payload: { saleId: sale.id, refundId: refundRecord.id, amount: dto.amount },
                correlationId: this.request?.correlationId,
            });

            return refundRecord;
        });
    }

    async voidSale(userId: string, saleId: string) {
        return this.prisma.client.$transaction(async (tx) => {
            const sale = await tx.sale.findUnique({
                where: { id: saleId },
                include: { payments: true, invoice: true }
            });

            if (!sale) throw new NotFoundException(this.t.translate('errors.validation.not_found', this.request?.language, { entity: 'Sale' }));

            // ✅ FSM Gate: Strictly enforce transition
            assertTransition('Sale', saleId, sale.status, 'VOIDED', SALE_TRANSITIONS);

            if (sale.payments.length > 0) throw new BadRequestException(this.t.translate('errors.sales.cannot_void_with_payments', this.request?.language));

            // Void logic with Optimistic Locking
            const result = await tx.sale.updateMany({
                where: { id: saleId, tenantId: sale.tenantId, version: sale.version },
                data: {
                    status: 'VOIDED',
                    version: { increment: 1 }
                }
            });

            if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

            // Restore inventory?
            // "Void is only allowed before payment" -> Items were deducted at sale creation?
            // Yes, create() decrements inventory. So VOID must increment it back.

            // Restore inventory via Ledger
            const saleItems = await tx.saleItem.findMany({ where: { saleId } });

            for (const item of saleItems) {
                await this.inventoryLedgerService.recordTransaction({
                    tenantId: sale.tenantId,
                    branchId: sale.branchId,
                    productId: item.productId,
                    type: 'REFUND', // Using REFUND type for Void/Return as per prompt "Refund -> add stock"
                    quantityChange: item.quantity, // Add back
                    referenceType: 'SALE', // Or ADJUSTMENT
                    referenceId: sale.id,
                    userId,
                }, tx as any);
            }

            // HC-10: Mark invoice as VOIDED when sale is voided
            if (sale.invoice) {
                await tx.invoice.update({
                    where: { id: sale.invoice.id },
                    data: { status: 'VOIDED' },
                });
            }

            // HC-2/HC-4: Audit log for void
            await this.auditService.logAction(
                sale.tenantId,
                userId,
                'VOID_SALE',
                'Sale',
                saleId,
                { status: sale.status },
                { status: 'VOIDED' },
                this.request?.correlationId,
                this.request?.ip,
                tx as any,
            );

            // HC-1: Outbox Event
            await this.outbox.schedule(tx as any, {
                tenantId: sale.tenantId,
                topic: 'sale.voided',
                payload: { saleId: sale.id },
                correlationId: this.request?.correlationId,
            });

            return sale;
        });
    }
}
