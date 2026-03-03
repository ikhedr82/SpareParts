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
exports.SalesExtensionsService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../shared/audit.service");
const outbox_service_1 = require("../shared/outbox.service");
const invariant_exception_1 = require("../common/exceptions/invariant.exception");
const translation_service_1 = require("../i18n/translation.service");
let SalesExtensionsService = class SalesExtensionsService {
    constructor(prisma, auditService, outbox, t, request) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.outbox = outbox;
        this.t = t;
        this.request = request;
    }
    async voidSale(tenantId, userId, saleId, dto) {
        return this.prisma.$transaction(async (tx) => {
            var _a, _b, _c, _d, _e, _f;
            const sale = await tx.sale.findUnique({
                where: { id: saleId },
                include: { items: true, payments: true, invoice: true },
            });
            if (!sale || sale.tenantId !== tenantId) {
                throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', (_a = this.request) === null || _a === void 0 ? void 0 : _a.language, { entity: 'Sale' }));
            }
            if (sale.status === 'VOIDED') {
                throw new common_1.BadRequestException(this.t.translate('errors.sales.already_voided', (_b = this.request) === null || _b === void 0 ? void 0 : _b.language));
            }
            const saleDate = sale.createdAt;
            const accountingPeriod = await tx.accountingPeriod.findFirst({
                where: {
                    tenantId,
                    startDate: { lte: saleDate },
                    endDate: { gte: saleDate },
                },
            });
            if (accountingPeriod && accountingPeriod.isClosed) {
                throw new invariant_exception_1.InvariantException('INV-08', 'Cannot void a sale in a closed accounting period', { accountingPeriodId: accountingPeriod.id, saleId });
            }
            const voidedSale = await tx.sale.update({
                where: { id: saleId },
                data: {
                    status: 'VOIDED',
                    voidReason: dto.reason,
                },
            });
            for (const item of sale.items) {
                const inventory = await tx.inventory.findFirst({
                    where: { branchId: sale.branchId, productId: item.productId },
                    select: { costPrice: true },
                });
                await tx.inventory.update({
                    where: { branchId_productId: { branchId: sale.branchId, productId: item.productId } },
                    data: { quantity: { increment: item.quantity } },
                });
                await tx.inventoryLedger.create({
                    data: {
                        tenantId,
                        branchId: sale.branchId,
                        productId: item.productId,
                        type: 'VOID_REVERSAL',
                        quantityChange: item.quantity,
                        costPrice: (_c = inventory === null || inventory === void 0 ? void 0 : inventory.costPrice) !== null && _c !== void 0 ? _c : 0,
                        referenceType: 'SALE',
                        referenceId: saleId,
                        userId,
                    },
                });
            }
            if (sale.invoice) {
                await tx.invoice.update({
                    where: { id: sale.invoice.id },
                    data: { status: 'VOIDED' },
                });
            }
            await this.auditService.logAction(tenantId, userId, 'VOID_SALE', 'Sale', saleId, { status: sale.status }, { status: 'VOIDED', reason: dto.reason }, (_d = this.request) === null || _d === void 0 ? void 0 : _d.correlationId, (_e = this.request) === null || _e === void 0 ? void 0 : _e.ip, tx);
            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'sale.voided',
                payload: { saleId, tenantId },
                correlationId: (_f = this.request) === null || _f === void 0 ? void 0 : _f.correlationId,
            });
            return voidedSale;
        });
    }
};
exports.SalesExtensionsService = SalesExtensionsService;
exports.SalesExtensionsService = SalesExtensionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        outbox_service_1.OutboxService,
        translation_service_1.TranslationService, Object])
], SalesExtensionsService);
//# sourceMappingURL=sales-extensions.service.js.map