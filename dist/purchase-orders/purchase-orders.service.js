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
exports.PurchaseOrdersService = void 0;
const common_1 = require("@nestjs/common");
const tenant_aware_prisma_service_1 = require("../prisma/tenant-aware-prisma.service");
const inventory_ledger_service_1 = require("../inventory/inventory-ledger.service");
const accounting_service_1 = require("../accounting/accounting.service");
const fsm_guard_1 = require("../common/guards/fsm.guard");
const audit_service_1 = require("../shared/audit.service");
const translation_service_1 = require("../i18n/translation.service");
const core_1 = require("@nestjs/core");
const common_2 = require("@nestjs/common");
const plan_enforcement_service_1 = require("../tenant-admin/plan-enforcement.service");
let PurchaseOrdersService = class PurchaseOrdersService {
    constructor(prisma, inventoryLedgerService, accountingService, auditService, t, planEnforcement, request) {
        this.prisma = prisma;
        this.inventoryLedgerService = inventoryLedgerService;
        this.accountingService = accountingService;
        this.auditService = auditService;
        this.t = t;
        this.planEnforcement = planEnforcement;
        this.request = request;
    }
    async create(userId, dto) {
        var _a, _b, _c;
        const { branchId, supplierName, items } = dto;
        if ((_a = this.request.user) === null || _a === void 0 ? void 0 : _a.tenantId) {
            await this.planEnforcement.checkFeatureAccess(this.request.user.tenantId, 'multiCurrency');
        }
        const branch = await this.prisma.client.branch.findFirst({
            where: {
                id: branchId,
                tenantId: this.request.user.tenantId
            }
        });
        if (!branch) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', (_b = this.request) === null || _b === void 0 ? void 0 : _b.language, { entity: 'Branch' }));
        }
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
        await this.auditService.logAction(branch.tenantId, userId, 'CREATE_PURCHASE_ORDER', 'PurchaseOrder', poResult.id, null, { supplierName, totalCost, itemsCount: items.length }, (_c = this.request) === null || _c === void 0 ? void 0 : _c.correlationId);
        return poResult;
    }
    async findAll(tenantId, branchId) {
        return this.prisma.client.purchaseOrder.findMany({
            where: Object.assign({ tenantId }, (branchId && { branchId })),
            orderBy: { createdAt: 'desc' },
            include: { items: true, createdBy: true }
        });
    }
    async findOne(id, tenantId) {
        var _a;
        const result = await this.prisma.client.purchaseOrder.findFirst({
            where: { id, tenantId },
            include: {
                items: { include: { product: true } },
                receipts: { include: { items: true } },
                createdBy: true,
                supplier: true
            }
        });
        if (!result)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', (_a = this.request) === null || _a === void 0 ? void 0 : _a.language, { entity: 'Purchase Order' }));
        return result;
    }
    async receive(userId, id, items, freightCost = 0) {
        return this.prisma.client.$transaction(async (tx) => {
            var _a, _b, _c, _d, _e;
            const po = await tx.purchaseOrder.findFirst({
                where: { id, tenantId: this.request.user.tenantId },
                include: {
                    items: true,
                    receipts: { include: { items: true } }
                }
            });
            if (!po)
                throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', (_a = this.request) === null || _a === void 0 ? void 0 : _a.language, { entity: 'Purchase Order' }));
            (0, fsm_guard_1.assertTransition)('PurchaseOrder', id, po.status, 'RECEIVED', fsm_guard_1.PURCHASE_ORDER_TRANSITIONS);
            for (const item of items) {
                const orderedItem = po.items.find(i => i.productId === item.productId);
                if (!orderedItem)
                    throw new common_1.BadRequestException(this.t.translate('errors.inventory.product_not_found', (_b = this.request) === null || _b === void 0 ? void 0 : _b.language));
                const previouslyReceived = po.receipts.reduce((sum, r) => {
                    const rItem = r.items.find(ri => ri.productId === item.productId);
                    return sum + ((rItem === null || rItem === void 0 ? void 0 : rItem.quantity) || 0);
                }, 0);
                if (previouslyReceived + item.quantity > orderedItem.quantity) {
                    throw new common_1.BadRequestException(this.t.translate('errors.procurement.receive_exceeds_ordered', (_c = this.request) === null || _c === void 0 ? void 0 : _c.language));
                }
            }
            const receiptValue = items.reduce((sum, item) => {
                const orderedItem = po.items.find(i => i.productId === item.productId);
                return sum + (Number(orderedItem.unitCost) * item.quantity);
            }, 0);
            const receipt = await tx.purchaseOrderReceipt.create({
                data: {
                    tenantId: po.tenantId,
                    purchaseOrderId: po.id,
                    receiptNumber: `GRN-${Date.now()}`,
                    receivedById: userId,
                    items: {
                        create: items.map(item => {
                            const orderedItem = po.items.find(i => i.productId === item.productId);
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
            for (const rItem of receipt.items) {
                await this.inventoryLedgerService.recordTransaction({
                    tenantId: po.tenantId,
                    branchId: po.branchId,
                    productId: rItem.productId,
                    type: 'PURCHASE',
                    quantityChange: rItem.quantity,
                    unitCost: Number(rItem.acceptedUnitCost),
                    referenceType: 'PURCHASE_ORDER',
                    referenceId: receipt.id,
                    userId,
                }, tx);
            }
            let allReceived = true;
            for (const orderedItem of po.items) {
                const totalReceived = po.receipts.reduce((sum, r) => {
                    const ri = r.items.find(i => i.productId === orderedItem.productId);
                    return sum + ((ri === null || ri === void 0 ? void 0 : ri.quantity) || 0);
                }, 0) + (((_d = items.find(i => i.productId === orderedItem.productId)) === null || _d === void 0 ? void 0 : _d.quantity) || 0);
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
            if (result.count === 0)
                throw new Error('CONCURRENCY_CONFLICT');
            const totalReceiptCost = items.reduce((sum, item) => {
                const orderedItem = po.items.find(i => i.productId === item.productId);
                return sum + (Number(orderedItem.unitCost) * item.quantity);
            }, 0) + freightCost;
            await this.accountingService.createSystemJournalEntryByCode({
                date: new Date(),
                reference: `GRN-${receipt.receiptNumber}`,
                description: `Received goods for PO ${po.id}`,
                lines: [
                    { accountCode: accounting_service_1.ACCOUNT_CODES.INVENTORY_ASSET, debit: totalReceiptCost, credit: 0 },
                    { accountCode: accounting_service_1.ACCOUNT_CODES.ACCOUNTS_PAYABLE, debit: 0, credit: totalReceiptCost }
                ]
            }, tx, po.tenantId);
            await this.auditService.logAction(po.tenantId, userId, 'RECEIVE_PO', 'PurchaseOrder', id, { status: po.status }, { status: newStatus, receiptId: receipt.id }, (_e = this.request) === null || _e === void 0 ? void 0 : _e.correlationId);
            return receipt;
        }, {
            timeout: 20000
        });
    }
};
exports.PurchaseOrdersService = PurchaseOrdersService;
exports.PurchaseOrdersService = PurchaseOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(6, (0, common_2.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [tenant_aware_prisma_service_1.TenantAwarePrismaService,
        inventory_ledger_service_1.InventoryLedgerService,
        accounting_service_1.AccountingService,
        audit_service_1.AuditService,
        translation_service_1.TranslationService,
        plan_enforcement_service_1.PlanEnforcementService, Object])
], PurchaseOrdersService);
//# sourceMappingURL=purchase-orders.service.js.map