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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const tenant_aware_prisma_service_1 = require("../prisma/tenant-aware-prisma.service");
const audit_service_1 = require("../shared/audit.service");
const outbox_service_1 = require("../shared/outbox.service");
const invariant_exception_1 = require("../common/exceptions/invariant.exception");
const conflict_exception_1 = require("../common/exceptions/conflict.exception");
const inventory_ledger_service_1 = require("../inventory/inventory-ledger.service");
const accounting_service_1 = require("../accounting/accounting.service");
const translation_service_1 = require("../i18n/translation.service");
const plan_enforcement_service_1 = require("../tenant-admin/plan-enforcement.service");
const usage_tracking_service_1 = require("../tenant-admin/usage-tracking.service");
const retry_helper_1 = require("../common/utils/retry.helper");
const fsm_guard_1 = require("../common/guards/fsm.guard");
let SalesService = class SalesService {
    constructor(prisma, inventoryLedgerService, accountingService, auditService, outbox, t, planEnforcement, usageTracking, request) {
        this.prisma = prisma;
        this.inventoryLedgerService = inventoryLedgerService;
        this.accountingService = accountingService;
        this.auditService = auditService;
        this.outbox = outbox;
        this.t = t;
        this.planEnforcement = planEnforcement;
        this.usageTracking = usageTracking;
        this.request = request;
    }
    async create(userId, dto) {
        const { branchId, customerName, customerId, items } = dto;
        const tenantId = this.request.user.tenantId;
        await this.planEnforcement.checkFeatureAccess(tenantId, 'pos');
        console.log(`[SalesService] [DEBUG] Starting create sale. branchId: ${branchId}, customer: ${customerName || customerId}, items count: ${items === null || items === void 0 ? void 0 : items.length}`);
        return (0, retry_helper_1.withRetry)(async () => {
            return this.prisma.client.$transaction(async (tx) => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                const branch = await tx.branch.findFirst({
                    where: {
                        id: branchId,
                        tenantId: this.request.user.tenantId,
                    }
                });
                if (!branch) {
                    console.error(`[SalesService] [ERROR] Branch not found: ${branchId}`);
                    throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', (_a = this.request) === null || _a === void 0 ? void 0 : _a.language, { entity: 'Branch' }));
                }
                const session = await tx.cashSession.findFirst({
                    where: {
                        branchId,
                        status: 'OPEN',
                    },
                });
                if (!session) {
                    throw new common_1.BadRequestException(this.t.translate('errors.sales.no_open_session', (_b = this.request) === null || _b === void 0 ? void 0 : _b.language));
                }
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
                for (const item of items) {
                    const inv = invMap.get(item.productId);
                    if (!inv) {
                        throw new common_1.NotFoundException(this.t.translate('errors.inventory.product_not_found', (_c = this.request) === null || _c === void 0 ? void 0 : _c.language));
                    }
                    if (inv.quantity < item.quantity) {
                        throw new common_1.BadRequestException(this.t.translate('errors.inventory.insufficient_stock', (_d = this.request) === null || _d === void 0 ? void 0 : _d.language, { product: inv.product.name, available: String(inv.quantity), requested: String(item.quantity) }));
                    }
                    const price = Number(inv.sellingPrice);
                    const lineTotal = price * item.quantity;
                    subtotal += lineTotal;
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
                    },
                    include: {
                        items: {
                            include: { product: true },
                        },
                        branch: true,
                    },
                });
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
                    }, tx);
                }
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
                if (customerId) {
                    const customer = await tx.customer.findFirst({
                        where: { id: customerId, tenantId: branch.tenantId }
                    });
                    if (!customer)
                        throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', (_e = this.request) === null || _e === void 0 ? void 0 : _e.language, { entity: 'Customer' }));
                    const result = await tx.customer.updateMany({
                        where: { id: customerId, tenantId: branch.tenantId, version: customer.version },
                        data: {
                            balance: { increment: total },
                            version: { increment: 1 }
                        }
                    });
                    if (result.count === 0) {
                        throw new conflict_exception_1.ConflictException({
                            entity: 'Customer',
                            entityId: customerId,
                            yourValue: `version=${customer.version}`,
                            currentValue: 'higher',
                        });
                    }
                }
                await this.accountingService.createSystemJournalEntryByCode({
                    date: new Date(),
                    reference: `SALE-${sale.id}`,
                    description: `Sale to ${customerName || 'Walk-in'} (Inv: ${invoiceNumber})`,
                    lines: [
                        { accountCode: accounting_service_1.ACCOUNT_CODES.ACCOUNTS_RECEIVABLE, debit: total, credit: 0, description: `Invoice ${invoiceNumber}` },
                        { accountCode: accounting_service_1.ACCOUNT_CODES.SALES_REVENUE, debit: 0, credit: subtotal, description: 'Sales Revenue' },
                        ...(taxTotal > 0 ? [{ accountCode: accounting_service_1.ACCOUNT_CODES.VAT_PAYABLE, debit: 0, credit: taxTotal, description: 'VAT Output' }] : [])
                    ]
                }, tx, branch.tenantId);
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
                            { accountCode: accounting_service_1.ACCOUNT_CODES.COST_OF_GOODS_SOLD, debit: totalCost, credit: 0 },
                            { accountCode: accounting_service_1.ACCOUNT_CODES.INVENTORY_ASSET, debit: 0, credit: totalCost }
                        ]
                    }, tx, branch.tenantId);
                }
                await this.auditService.logAction(branch.tenantId, userId, 'CREATE_SALE', 'Sale', sale.id, null, { total, itemCount: items.length, invoiceNumber }, (_f = this.request) === null || _f === void 0 ? void 0 : _f.correlationId, (_g = this.request) === null || _g === void 0 ? void 0 : _g.ip, tx);
                await this.outbox.schedule(tx, {
                    tenantId: branch.tenantId,
                    topic: 'sale.created',
                    payload: { saleId: sale.id, total, invoiceNumber },
                    correlationId: (_h = this.request) === null || _h === void 0 ? void 0 : _h.correlationId,
                });
                const orderCount = await tx.sale.count({ where: { tenantId: branch.tenantId } });
                await this.usageTracking.recordMetric(branch.tenantId, 'ORDERS', orderCount);
                return sale;
            }, {
                timeout: 20000,
            });
        }, { maxAttempts: 5, baseDelayMs: 200, maxDelayMs: 2000 });
    }
    async findAll(tenantId) {
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
    async findOne(id, tenantId) {
        var _a;
        const sale = await this.prisma.client.sale.findFirst({
            where: { id, tenantId },
            include: {
                items: {
                    include: { product: true },
                },
                branch: true,
            },
        });
        if (!sale)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', (_a = this.request) === null || _a === void 0 ? void 0 : _a.language, { entity: 'Sale' }));
        return sale;
    }
    async refundSale(userId, dto) {
        if (!dto.amount || dto.amount <= 0) {
            throw new invariant_exception_1.InvariantException('INV-01', 'Refund amount must be positive', { amount: dto.amount });
        }
        return this.prisma.client.$transaction(async (tx) => {
            var _a, _b, _c, _d;
            const sale = await tx.sale.findFirst({
                where: { id: dto.saleId, tenantId: this.request.user.tenantId },
                include: { payments: true }
            });
            if (!sale)
                throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', (_a = this.request) === null || _a === void 0 ? void 0 : _a.language, { entity: 'Sale' }));
            (0, fsm_guard_1.assertTransition)('Sale', dto.saleId, sale.status, 'REFUNDED', fsm_guard_1.SALE_TRANSITIONS);
            if (Number(dto.amount) > Number(sale.total)) {
                throw new invariant_exception_1.InvariantException('INV-02', 'Refund amount cannot exceed sale total', {
                    refundAmount: dto.amount,
                    saleTotal: sale.total,
                });
            }
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
                    cashSessionId: session ? session.id : null,
                }
            });
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
                    }
                });
                if (result.count === 0)
                    throw new Error('CONCURRENCY_CONFLICT');
            }
            if (session) {
                await tx.payment.create({
                    data: {
                        tenantId: sale.tenantId,
                        saleId: sale.id,
                        sessionId: session.id,
                        amount: dto.amount,
                        method: 'CASH',
                        isRefund: true,
                        reference: `Refund for ${sale.id}`,
                    }
                });
            }
            await this.auditService.logAction(sale.tenantId, userId, 'REFUND_SALE', 'Sale', sale.id, { status: sale.status, total: sale.total }, { refundAmount: dto.amount, reason: dto.reason }, (_b = this.request) === null || _b === void 0 ? void 0 : _b.correlationId, (_c = this.request) === null || _c === void 0 ? void 0 : _c.ip, tx);
            await this.outbox.schedule(tx, {
                tenantId: sale.tenantId,
                topic: 'sale.refunded',
                payload: { saleId: sale.id, refundId: refundRecord.id, amount: dto.amount },
                correlationId: (_d = this.request) === null || _d === void 0 ? void 0 : _d.correlationId,
            });
            return refundRecord;
        });
    }
    async voidSale(userId, saleId) {
        return this.prisma.client.$transaction(async (tx) => {
            var _a, _b, _c, _d, _e;
            const sale = await tx.sale.findUnique({
                where: { id: saleId },
                include: { payments: true, invoice: true }
            });
            if (!sale)
                throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', (_a = this.request) === null || _a === void 0 ? void 0 : _a.language, { entity: 'Sale' }));
            (0, fsm_guard_1.assertTransition)('Sale', saleId, sale.status, 'VOIDED', fsm_guard_1.SALE_TRANSITIONS);
            if (sale.payments.length > 0)
                throw new common_1.BadRequestException(this.t.translate('errors.sales.cannot_void_with_payments', (_b = this.request) === null || _b === void 0 ? void 0 : _b.language));
            const result = await tx.sale.updateMany({
                where: { id: saleId, tenantId: sale.tenantId, version: sale.version },
                data: {
                    status: 'VOIDED',
                    version: { increment: 1 }
                }
            });
            if (result.count === 0)
                throw new Error('CONCURRENCY_CONFLICT');
            const saleItems = await tx.saleItem.findMany({ where: { saleId } });
            for (const item of saleItems) {
                await this.inventoryLedgerService.recordTransaction({
                    tenantId: sale.tenantId,
                    branchId: sale.branchId,
                    productId: item.productId,
                    type: 'REFUND',
                    quantityChange: item.quantity,
                    referenceType: 'SALE',
                    referenceId: sale.id,
                    userId,
                }, tx);
            }
            if (sale.invoice) {
                await tx.invoice.update({
                    where: { id: sale.invoice.id },
                    data: { status: 'VOIDED' },
                });
            }
            await this.auditService.logAction(sale.tenantId, userId, 'VOID_SALE', 'Sale', saleId, { status: sale.status }, { status: 'VOIDED' }, (_c = this.request) === null || _c === void 0 ? void 0 : _c.correlationId, (_d = this.request) === null || _d === void 0 ? void 0 : _d.ip, tx);
            await this.outbox.schedule(tx, {
                tenantId: sale.tenantId,
                topic: 'sale.voided',
                payload: { saleId: sale.id },
                correlationId: (_e = this.request) === null || _e === void 0 ? void 0 : _e.correlationId,
            });
            return sale;
        });
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __param(8, (0, common_1.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [tenant_aware_prisma_service_1.TenantAwarePrismaService,
        inventory_ledger_service_1.InventoryLedgerService,
        accounting_service_1.AccountingService,
        audit_service_1.AuditService,
        outbox_service_1.OutboxService,
        translation_service_1.TranslationService,
        plan_enforcement_service_1.PlanEnforcementService,
        usage_tracking_service_1.UsageTrackingService, Object])
], SalesService);
//# sourceMappingURL=sales.service.js.map