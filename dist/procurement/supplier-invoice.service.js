"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierInvoiceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const audit_service_1 = require("../shared/audit.service");
const outbox_service_1 = require("../shared/outbox.service");
const invariant_exception_1 = require("../common/exceptions/invariant.exception");
const translation_service_1 = require("../i18n/translation.service");
let SupplierInvoiceService = class SupplierInvoiceService {
    constructor(prisma, auditService, outbox, t) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.outbox = outbox;
        this.t = t;
    }
    async createInvoice(tenantId, userId, dto, correlationId) {
        const po = await this.prisma.purchaseOrder.findFirst({
            where: { id: dto.purchaseOrderId, tenantId },
            include: { items: true },
        });
        if (!po)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Purchase Order' }));
        const existing = await this.prisma.supplierInvoice.findUnique({
            where: { tenantId_invoiceNumber: { tenantId, invoiceNumber: dto.invoiceNumber } },
        });
        if (existing)
            throw new common_1.BadRequestException(this.t.translate('errors.validation.already_exists', 'EN', { entity: 'Invoice' }));
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
            await this.auditService.logAction(tenantId, userId, 'CREATE_SUPPLIER_INVOICE', 'SupplierInvoice', invoice.id, null, { invoiceNumber: dto.invoiceNumber, amount: dto.amount }, correlationId, undefined, tx);
            return invoice;
        });
    }
    async matchInvoice(tenantId, invoiceId, userId, correlationId) {
        const invoice = await this.prisma.supplierInvoice.findFirst({
            where: { id: invoiceId, tenantId },
            include: { items: true },
        });
        if (!invoice)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Invoice' }));
        if (invoice.status !== client_1.SupplierInvoiceStatus.PENDING) {
            throw new common_1.BadRequestException(this.t.translate('errors.procurement.po_already_received', 'EN'));
        }
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id: invoice.purchaseOrderId },
            include: { items: true, receipts: { include: { items: true } } },
        });
        if (!po)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Purchase Order' }));
        const grnQtyMap = {};
        for (const receipt of po.receipts) {
            for (const ri of receipt.items) {
                grnQtyMap[ri.productId] = (grnQtyMap[ri.productId] || 0) + ri.quantity;
            }
        }
        const mismatches = [];
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
            ? client_1.SupplierInvoiceStatus.MATCHED
            : client_1.SupplierInvoiceStatus.MISMATCHED;
        return this.prisma.$transaction(async (tx) => {
            const result = await tx.supplierInvoice.updateMany({
                where: { id: invoiceId, tenantId, version: invoice.version },
                data: {
                    status: matchStatus,
                    mismatchDetails: mismatches.length > 0 ? mismatches : undefined,
                    version: { increment: 1 },
                },
            });
            if (result.count === 0)
                throw new Error('CONCURRENCY_CONFLICT');
            await this.auditService.logAction(tenantId, userId, 'MATCH_SUPPLIER_INVOICE', 'SupplierInvoice', invoiceId, { status: invoice.status }, { status: matchStatus, mismatches }, correlationId, undefined, tx);
            return tx.supplierInvoice.findUnique({ where: { id: invoiceId }, include: { items: true } });
        });
    }
    async postInvoice(tenantId, invoiceId, userId, correlationId) {
        const invoice = await this.prisma.supplierInvoice.findFirst({
            where: { id: invoiceId, tenantId },
        });
        if (!invoice)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Invoice' }));
        if (invoice.status !== client_1.SupplierInvoiceStatus.MATCHED) {
            throw new invariant_exception_1.InvariantException('SI-01', this.t.translate('errors.procurement.po_not_editable', 'EN'), { status: invoice.status });
        }
        return this.prisma.$transaction(async (tx) => {
            const result = await tx.supplierInvoice.updateMany({
                where: { id: invoiceId, tenantId, version: invoice.version },
                data: {
                    status: client_1.SupplierInvoiceStatus.POSTED,
                    postedAt: new Date(),
                    version: { increment: 1 },
                },
            });
            if (result.count === 0)
                throw new Error('CONCURRENCY_CONFLICT');
            await this.outbox.schedule(tx, {
                tenantId, topic: 'procurement.invoice.posted',
                payload: { invoiceId, amount: Number(invoice.amount) },
                correlationId,
            });
            await this.auditService.logAction(tenantId, userId, 'POST_SUPPLIER_INVOICE', 'SupplierInvoice', invoiceId, { status: invoice.status }, { status: client_1.SupplierInvoiceStatus.POSTED }, correlationId, undefined, tx);
            return tx.supplierInvoice.findUnique({ where: { id: invoiceId }, include: { items: true } });
        });
    }
    async findAll(tenantId, status) {
        return this.prisma.supplierInvoice.findMany({
            where: Object.assign({ tenantId }, (status && { status })),
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(tenantId, invoiceId) {
        const inv = await this.prisma.supplierInvoice.findFirst({
            where: { id: invoiceId, tenantId },
            include: { items: true },
        });
        if (!inv)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Supplier Invoice' }));
        return inv;
    }
};
exports.SupplierInvoiceService = SupplierInvoiceService;
exports.SupplierInvoiceService = SupplierInvoiceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        outbox_service_1.OutboxService,
        translation_service_1.TranslationService])
], SupplierInvoiceService);
//# sourceMappingURL=supplier-invoice.service.js.map