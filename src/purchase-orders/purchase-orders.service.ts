import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { InventoryLedgerService } from '../inventory/inventory-ledger.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { AccountingService, ACCOUNT_CODES } from '../accounting/accounting.service';
import { assertTransition, PURCHASE_ORDER_TRANSITIONS } from '../common/guards/fsm.guard';
import { AuditService } from '../shared/audit.service';
import { TranslationService } from '../i18n/translation.service';
import { REQUEST } from '@nestjs/core';
import { Inject } from '@nestjs/common';
import { PlanEnforcementService } from '../tenant-admin/plan-enforcement.service';

@Injectable()
export class PurchaseOrdersService {
    constructor(
        private readonly prisma: TenantAwarePrismaService,
        private readonly inventoryLedgerService: InventoryLedgerService,
        private readonly accountingService: AccountingService,
        private readonly auditService: AuditService,
        private readonly t: TranslationService,
        private readonly planEnforcement: PlanEnforcementService,
        @Inject(REQUEST) private readonly request: any,
    ) { }

    async create(userId: string, dto: CreatePurchaseOrderDto) {
        const { branchId, supplierName, items } = dto;

        // Multi-currency check
        if (this.request.user?.tenantId) {
            await this.planEnforcement.checkFeatureAccess(this.request.user.tenantId, 'multiCurrency');
        }

        const branch = await this.prisma.client.branch.findFirst({
            where: {
                id: branchId,
                tenantId: this.request.user.tenantId
            }
        });

        if (!branch) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', this.request?.language, { entity: 'Branch' }));
        }

        // Calculate total
        const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

        const poResult = await this.prisma.client.purchaseOrder.create({
            data: {
                tenantId: branch.tenantId,
                branchId,
                supplierName,
                supplierId: dto.supplierId,
                status: 'DRAFT',
                totalCost,
                createdById: userId,
                items: {
                    create: items.map(i => ({
                        productId: i.productId,
                        quantity: i.quantity,
                        unitCost: i.unitCost
                    }))
                }
            },
            include: { items: true }
        });

        // ✅ Audit Gate
        await this.auditService.logAction(
            branch.tenantId,
            userId,
            'CREATE_PURCHASE_ORDER',
            'PurchaseOrder',
            poResult.id,
            null,
            { supplierName, totalCost, itemsCount: items.length },
            this.request?.correlationId
        );

        return poResult;
    }

    async findAll(tenantId: string, branchId?: string) {
        return this.prisma.client.purchaseOrder.findMany({
            where: {
                tenantId,
                ...(branchId && { branchId })
            },
            orderBy: { createdAt: 'desc' },
            include: { items: true, createdBy: true }
        });
    }

    async findOne(id: string, tenantId: string) {
        const result = await this.prisma.client.purchaseOrder.findFirst({
            where: { id, tenantId },
            include: {
                items: { include: { product: true } },
                receipts: { include: { items: true } },
                createdBy: true,
                supplier: true
            }
        });
        if (!result) throw new NotFoundException(this.t.translate('errors.validation.not_found', this.request?.language, { entity: 'Purchase Order' }));
        return result;
    }

    async receive(userId: string, id: string, items: { productId: string; quantity: number }[], freightCost: number = 0) {
        return this.prisma.client.$transaction(async (tx) => {
            const po = await tx.purchaseOrder.findFirst({
                where: { id, tenantId: this.request.user.tenantId },
                include: {
                    items: true,
                    receipts: { include: { items: true } }
                }
            });

            if (!po) throw new NotFoundException(this.t.translate('errors.validation.not_found', this.request?.language, { entity: 'Purchase Order' }));

            // ✅ FSM Gate: Strictly enforce transition
            assertTransition('PurchaseOrder', id, po.status, 'RECEIVED', PURCHASE_ORDER_TRANSITIONS);

            // 1. Validate Received Quantities
            // Check if receiving more than ordered (or previously received)
            for (const item of items) {
                const orderedItem = po.items.find(i => i.productId === item.productId);
                if (!orderedItem) throw new BadRequestException(this.t.translate('errors.inventory.product_not_found', this.request?.language));

                const previouslyReceived = po.receipts.reduce((sum, r) => {
                    const rItem = r.items.find(ri => ri.productId === item.productId);
                    return sum + (rItem?.quantity || 0);
                }, 0);

                if (previouslyReceived + item.quantity > orderedItem.quantity) {
                    throw new BadRequestException(this.t.translate('errors.procurement.receive_exceeds_ordered', this.request?.language));
                }
            }

            // 2. Calculate Landed Cost (Weighted Average of Freight)
            // Total value of THIS receipt
            const receiptValue = items.reduce((sum, item) => {
                const orderedItem = po.items.find(i => i.productId === item.productId);
                return sum + (Number(orderedItem.unitCost) * item.quantity);
            }, 0);

            // 3. Create Receipt (GRN)
            const receipt = await tx.purchaseOrderReceipt.create({
                data: {
                    tenantId: po.tenantId,
                    purchaseOrderId: po.id,
                    receiptNumber: `GRN-${Date.now()}`, // Simple generator for now
                    receivedById: userId,
                    items: {
                        create: items.map(item => {
                            const orderedItem = po.items.find(i => i.productId === item.productId);

                            // Distribute Freight
                            let landedUnitCost = Number(orderedItem.unitCost);
                            if (freightCost > 0 && receiptValue > 0) {
                                const itemValue = Number(orderedItem.unitCost) * item.quantity;
                                const ratio = itemValue / receiptValue;
                                const allocatedFreight = freightCost * ratio;
                                landedUnitCost += (allocatedFreight / item.quantity);
                            }

                            return {
                                productId: item.productId,
                                quantity: item.quantity,
                                acceptedUnitCost: landedUnitCost
                            };
                        })
                    }
                },
                include: { items: true }
            });

            // 4. Update Inventory & Ledger (using Landed Cost)
            for (const rItem of receipt.items) {
                await this.inventoryLedgerService.recordTransaction({
                    tenantId: po.tenantId,
                    branchId: po.branchId,
                    productId: rItem.productId,
                    type: 'PURCHASE',
                    quantityChange: rItem.quantity,
                    unitCost: Number(rItem.acceptedUnitCost), // IMPORTANT: Use Landed Cost
                    referenceType: 'PURCHASE_ORDER',
                    referenceId: receipt.id, // Reference the GRN, not just PO
                    userId,
                }, tx as any);
            }

            // 5. Update PO Status
            // Check if fully received
            let allReceived = true;
            for (const orderedItem of po.items) {
                const totalReceived = po.receipts.reduce((sum, r) => {
                    const ri = r.items.find(i => i.productId === orderedItem.productId);
                    return sum + (ri?.quantity || 0);
                }, 0) + (items.find(i => i.productId === orderedItem.productId)?.quantity || 0);

                if (totalReceived < orderedItem.quantity) {
                    allReceived = false;
                    break;
                }
            }

            const newStatus = allReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED';
            const result = await tx.purchaseOrder.updateMany({
                where: { id, tenantId: po.tenantId, version: po.version },
                data: {
                    status: newStatus,
                    version: { increment: 1 }
                }
            });

            if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

            // 6. Financial Accounting (Journal)
            // Dr Inventory (Total Value including Freight)
            // Cr Accounts Payable (Goods Value)
            // Cr Bank/Payable (Freight Provider? Or same supplier?)
            // Simplified: Dr Inventory, Cr Accounts Payable (assuming freight billed by supplier)

            const totalReceiptCost = items.reduce((sum, item) => {
                const orderedItem = po.items.find(i => i.productId === item.productId);
                return sum + (Number(orderedItem.unitCost) * item.quantity);
            }, 0) + freightCost;

            await this.accountingService.createSystemJournalEntryByCode({
                date: new Date(),
                reference: `GRN-${receipt.receiptNumber}`,
                description: `Received goods for PO ${po.id}`,
                lines: [
                    { accountCode: ACCOUNT_CODES.INVENTORY_ASSET, debit: totalReceiptCost, credit: 0 },
                    { accountCode: ACCOUNT_CODES.ACCOUNTS_PAYABLE, debit: 0, credit: totalReceiptCost }
                ]
            }, tx, po.tenantId);

            // ✅ Audit Gate
            await this.auditService.logAction(
                po.tenantId,
                userId,
                'RECEIVE_PO',
                'PurchaseOrder',
                id,
                { status: po.status },
                { status: newStatus, receiptId: receipt.id },
                this.request?.correlationId,
            );

            return receipt;

        }, {
            timeout: 20000
        });
    }
}
