import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupplierInvoiceStatus } from '@prisma/client';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
import { InvariantException } from '../common/exceptions/invariant.exception';
import { TranslationService } from '../i18n/translation.service';

@Injectable()
export class SupplierInvoiceService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditService: AuditService,
        private readonly outbox: OutboxService,
        private readonly t: TranslationService,
    ) { }

    /**
     * UC-5: Create a supplier invoice and link to purchase order.
     */
    async createInvoice(
        tenantId: string, userId: string,
        dto: {
            purchaseOrderId: string; invoiceNumber: string; supplierId?: string;
            invoiceDate: string; amount: number; currency?: string;
            items: { productId: string; quantity: number; unitPrice: number }[];
        },
        correlationId?: string,
    ) {
        // Verify PO exists and belongs to tenant
        const po = await this.prisma.purchaseOrder.findFirst({
            where: { id: dto.purchaseOrderId, tenantId },
            include: { items: true },
        });
        if (!po) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Purchase Order' }));

        // Check for duplicate invoice number
        const existing = await this.prisma.supplierInvoice.findUnique({
            where: { tenantId_invoiceNumber: { tenantId, invoiceNumber: dto.invoiceNumber } },
        });
        if (existing) throw new BadRequestException(this.t.translate('errors.validation.already_exists', 'EN', { entity: 'Invoice' }));

        return this.prisma.$transaction(async (tx) => {
            const invoice = await tx.supplierInvoice.create({
                data: {
                    tenantId,
                    purchaseOrderId: dto.purchaseOrderId,
                    invoiceNumber: dto.invoiceNumber,
                    supplierId: dto.supplierId,
                    invoiceDate: new Date(dto.invoiceDate),
                    amount: dto.amount,
                    currency: dto.currency || 'USD',
                    items: {
                        create: dto.items.map(i => ({
                            productId: i.productId,
                            quantity: i.quantity,
                            unitPrice: i.unitPrice,
                            lineTotal: i.quantity * i.unitPrice,
                        })),
                    },
                },
                include: { items: true },
            });

            await this.auditService.logAction(
                tenantId, userId, 'CREATE_SUPPLIER_INVOICE', 'SupplierInvoice',
                invoice.id, null, { invoiceNumber: dto.invoiceNumber, amount: dto.amount },
                correlationId, undefined, tx as any,
            );

            return invoice;
        });
    }

    /**
     * 3-Way Match: PO + GRN + Supplier Invoice
     * Blocks posting if mismatch.
     */
    async matchInvoice(
        tenantId: string, invoiceId: string, userId: string,
        correlationId?: string,
    ) {
        const invoice = await this.prisma.supplierInvoice.findFirst({
            where: { id: invoiceId, tenantId },
            include: { items: true },
        });
        if (!invoice) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Invoice' }));

        if (invoice.status !== SupplierInvoiceStatus.PENDING) {
            throw new BadRequestException(this.t.translate('errors.procurement.po_already_received', 'EN'));
        }

        // Load PO
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id: invoice.purchaseOrderId },
            include: { items: true, receipts: { include: { items: true } } },
        });
        if (!po) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Purchase Order' }));

        // Aggregate GRN quantities
        const grnQtyMap: Record<string, number> = {};
        for (const receipt of po.receipts) {
            for (const ri of receipt.items) {
                grnQtyMap[ri.productId] = (grnQtyMap[ri.productId] || 0) + ri.quantity;
            }
        }

        // Compare: PO items vs Invoice items vs GRN
        const mismatches: any[] = [];

        for (const invItem of invoice.items) {
            const poItem = po.items.find(p => p.productId === invItem.productId);
            const grnQty = grnQtyMap[invItem.productId] || 0;

            if (!poItem) {
                mismatches.push({ productId: invItem.productId, type: 'NOT_ON_PO' });
                continue;
            }

            if (invItem.quantity !== poItem.quantity) {
                mismatches.push({
                    productId: invItem.productId, type: 'QTY_MISMATCH',
                    poQty: poItem.quantity, invoiceQty: invItem.quantity,
                });
            }

            if (Number(invItem.unitPrice) !== Number(poItem.unitCost)) {
                mismatches.push({
                    productId: invItem.productId, type: 'PRICE_MISMATCH',
                    poCost: Number(poItem.unitCost), invoicePrice: Number(invItem.unitPrice),
                });
            }

            if (grnQty < invItem.quantity) {
                mismatches.push({
                    productId: invItem.productId, type: 'GRN_SHORT',
                    grnQty, invoiceQty: invItem.quantity,
                });
            }
        }

        const matchStatus = mismatches.length === 0
            ? SupplierInvoiceStatus.MATCHED
            : SupplierInvoiceStatus.MISMATCHED;

        return this.prisma.$transaction(async (tx) => {
            const result = await tx.supplierInvoice.updateMany({
                where: { id: invoiceId, tenantId, version: invoice.version },
                data: {
                    status: matchStatus,
                    mismatchDetails: mismatches.length > 0 ? mismatches : undefined,
                    version: { increment: 1 },
                },
            });
            if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

            await this.auditService.logAction(
                tenantId, userId, 'MATCH_SUPPLIER_INVOICE', 'SupplierInvoice',
                invoiceId, { status: invoice.status },
                { status: matchStatus, mismatches },
                correlationId, undefined, tx as any,
            );

            return tx.supplierInvoice.findUnique({ where: { id: invoiceId }, include: { items: true } });
        });
    }

    /**
     * Post a matched invoice. Blocks if MISMATCHED.
     */
    async postInvoice(
        tenantId: string, invoiceId: string, userId: string,
        correlationId?: string,
    ) {
        const invoice = await this.prisma.supplierInvoice.findFirst({
            where: { id: invoiceId, tenantId },
        });
        if (!invoice) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Invoice' }));

        if (invoice.status !== SupplierInvoiceStatus.MATCHED) {
            throw new InvariantException('SI-01', this.t.translate('errors.procurement.po_not_editable', 'EN'), { status: invoice.status });
        }

        return this.prisma.$transaction(async (tx) => {
            const result = await tx.supplierInvoice.updateMany({
                where: { id: invoiceId, tenantId, version: invoice.version },
                data: {
                    status: SupplierInvoiceStatus.POSTED,
                    postedAt: new Date(),
                    version: { increment: 1 },
                },
            });
            if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

            await this.outbox.schedule(tx as any, {
                tenantId, topic: 'procurement.invoice.posted',
                payload: { invoiceId, amount: Number(invoice.amount) },
                correlationId,
            });

            await this.auditService.logAction(
                tenantId, userId, 'POST_SUPPLIER_INVOICE', 'SupplierInvoice',
                invoiceId, { status: invoice.status },
                { status: SupplierInvoiceStatus.POSTED },
                correlationId, undefined, tx as any,
            );

            return tx.supplierInvoice.findUnique({ where: { id: invoiceId }, include: { items: true } });
        });
    }

    async findAll(tenantId: string, status?: SupplierInvoiceStatus) {
        return this.prisma.supplierInvoice.findMany({
            where: { tenantId, ...(status && { status }) },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(tenantId: string, invoiceId: string) {
        const inv = await this.prisma.supplierInvoice.findFirst({
            where: { id: invoiceId, tenantId },
            include: { items: true },
        });
        if (!inv) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Supplier Invoice' }));
        return inv;
    }
}
