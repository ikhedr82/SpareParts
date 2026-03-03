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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const tenant_aware_prisma_service_1 = require("../prisma/tenant-aware-prisma.service");
const accounting_service_1 = require("../accounting/accounting.service");
const audit_service_1 = require("../shared/audit.service");
const translation_service_1 = require("../i18n/translation.service");
let PaymentsService = class PaymentsService {
    constructor(prisma, accountingService, auditService, t) {
        this.prisma = prisma;
        this.accountingService = accountingService;
        this.auditService = auditService;
        this.t = t;
    }
    async create(userId, correlationId, dto) {
        const sale = await this.prisma.client.sale.findFirst({
            where: { id: dto.saleId },
            include: { payments: true },
        });
        if (!sale)
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Sale' }));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const zReport = await this.prisma.client.zReport.findFirst({
            where: {
                branchId: sale.branchId,
                businessDate: today,
            },
        });
        if (zReport) {
            throw new common_1.BadRequestException(this.t.translate('errors.sales.session_already_closed', 'EN'));
        }
        const session = await this.prisma.client.cashSession.findFirst({
            where: {
                branchId: sale.branchId,
                status: 'OPEN',
            },
        });
        if (!session) {
            throw new common_1.BadRequestException(this.t.translate('errors.sales.no_open_session', 'EN'));
        }
        const totalPaid = sale.payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const remaining = Number(sale.total) - totalPaid;
        if (dto.amount > remaining) {
            throw new common_1.BadRequestException(this.t.translate('errors.sales.refund_exceeds_total', 'EN'));
        }
        return this.prisma.client.$transaction(async (tx) => {
            const payment = await tx.payment.create({
                data: {
                    tenantId: this.prisma.tenantId,
                    saleId: dto.saleId,
                    sessionId: session.id,
                    amount: dto.amount,
                    method: dto.method,
                    reference: dto.reference,
                },
            });
            const receiptNumber = `RCP-${Date.now()}-${payment.id.slice(0, 4)}`.toUpperCase();
            await tx.receipt.create({
                data: {
                    tenantId: this.prisma.tenantId,
                    paymentId: payment.id,
                    receiptNumber,
                    amount: dto.amount,
                },
            });
            const newTotalPaid = totalPaid + Number(dto.amount);
            if (newTotalPaid >= Number(sale.total)) {
                await tx.invoice.update({
                    where: { saleId: dto.saleId },
                    data: { status: 'PAID' },
                });
            }
            if (sale.customerId) {
                await tx.customer.update({
                    where: { id: sale.customerId },
                    data: {
                        balance: { decrement: dto.amount }
                    }
                });
            }
            const debitAccount = dto.method === 'CASH' ? accounting_service_1.ACCOUNT_CODES.CASH_ON_HAND :
                dto.method === 'TRANSFER' ? accounting_service_1.ACCOUNT_CODES.BANK_ACCOUNT :
                    dto.method === 'CARD' ? accounting_service_1.ACCOUNT_CODES.BANK_ACCOUNT : accounting_service_1.ACCOUNT_CODES.CASH_ON_HAND;
            await this.accountingService.createSystemJournalEntryByCode({
                date: new Date(),
                reference: `PAY-${payment.id}`,
                description: `Payment for Sale ${sale.id} (${dto.method})`,
                lines: [
                    { accountCode: debitAccount, debit: dto.amount, credit: 0 },
                    { accountCode: accounting_service_1.ACCOUNT_CODES.ACCOUNTS_RECEIVABLE, debit: 0, credit: dto.amount }
                ]
            }, tx, this.prisma.tenantId);
            await this.auditService.logAction(this.prisma.tenantId, userId, 'CREATE_PAYMENT', 'Payment', payment.id, null, { amount: dto.amount, method: dto.method, saleId: dto.saleId }, correlationId);
            return payment;
        });
    }
    async findBySale(saleId) {
        return this.prisma.client.payment.findMany({
            where: { saleId },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_aware_prisma_service_1.TenantAwarePrismaService,
        accounting_service_1.AccountingService,
        audit_service_1.AuditService,
        translation_service_1.TranslationService])
], PaymentsService);
//# sourceMappingURL=payment.service.js.map