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
exports.ACCOUNT_CODES = exports.AccountingService = void 0;
const common_1 = require("@nestjs/common");
const tenant_aware_prisma_service_1 = require("../prisma/tenant-aware-prisma.service");
const audit_service_1 = require("./audit.service");
const translation_service_1 = require("../i18n/translation.service");
let AccountingService = class AccountingService {
    constructor(prisma, auditService, t) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.t = t;
    }
    async createAccount(dto) {
        return this.prisma.client.chartOfAccount.create({
            data: dto,
        });
    }
    async getChartOfAccounts() {
        console.log('AccountingService.getChartOfAccounts called');
        const client = this.prisma.client;
        console.log('Client chartOfAccount present:', !!client.chartOfAccount);
        return client.chartOfAccount.findMany({
            orderBy: { code: 'asc' },
        });
    }
    async createJournalEntry(dto) {
        const totalDebit = dto.lines.reduce((sum, line) => sum + Number(line.debit), 0);
        const totalCredit = dto.lines.reduce((sum, line) => sum + Number(line.credit), 0);
        if (totalDebit !== totalCredit) {
            throw new common_1.BadRequestException(this.t.translate('errors.accounting.unbalanced_entry', 'EN', { debits: String(totalDebit), credits: String(totalCredit) }));
        }
        const date = new Date(dto.date);
        return this.prisma.client.journalEntry.create({
            data: {
                date,
                reference: dto.reference,
                description: dto.description,
                totalAmount: totalDebit,
                createdById: this.prisma.user.id,
                lines: {
                    create: dto.lines.map((line) => ({
                        accountId: line.accountId,
                        debit: line.debit,
                        credit: line.credit,
                        description: line.description,
                    })),
                },
            },
            include: {
                lines: {
                    include: { account: true }
                }
            }
        });
    }
    async getLedger(accountId) {
        return this.prisma.client.journalLine.findMany({
            where: {
                accountId,
                journalEntry: {
                    tenantId: this.prisma.tenantId
                }
            },
            include: {
                journalEntry: true
            },
            orderBy: {
                journalEntry: {
                    date: 'desc'
                }
            }
        });
    }
    async createSystemJournalEntry(dto, tx) {
        var _a;
        const client = tx || this.prisma.client;
        const tenantId = tx ? tx.tenantId || this.prisma.tenantId : this.prisma.tenantId;
        const totalDebit = dto.lines.reduce((sum, line) => sum + Number(line.debit), 0);
        const totalCredit = dto.lines.reduce((sum, line) => sum + Number(line.credit), 0);
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new common_1.BadRequestException(this.t.translate('errors.accounting.unbalanced_entry', 'EN', { debits: String(totalDebit), credits: String(totalCredit) }));
        }
        const accountCodes = [...new Set(dto.lines.map(l => l.accountId))];
        return tx.journalEntry.create({
            data: {
                tenantId,
                date: dto.date,
                reference: dto.reference,
                description: dto.description,
                totalAmount: totalDebit,
                createdById: ((_a = this.prisma.user) === null || _a === void 0 ? void 0 : _a.id) || 'SYSTEM',
                lines: {
                    create: dto.lines.map(line => ({
                        accountId: line.accountId,
                        debit: line.debit,
                        credit: line.credit,
                        description: line.description
                    }))
                }
            }
        });
    }
    async createSystemJournalEntryByCode(dto, tx, tenantId) {
        var _a;
        const codes = [...new Set(dto.lines.map(l => l.accountCode))];
        const accounts = await tx.chartOfAccount.findMany({
            where: {
                tenantId,
                code: { in: codes }
            }
        });
        const accountMap = new Map(accounts.map(a => [a.code, a.id]));
        const linesWithIds = dto.lines.map(line => {
            const id = accountMap.get(line.accountCode);
            if (!id) {
                throw new Error(this.t.translate('errors.accounting.account_not_found', 'EN', { code: line.accountCode }));
            }
            return {
                accountId: id,
                debit: line.debit,
                credit: line.credit,
                description: line.description
            };
        });
        return tx.journalEntry.create({
            data: {
                tenantId,
                date: dto.date,
                reference: dto.reference,
                description: dto.description,
                totalAmount: dto.lines.reduce((sum, l) => sum + Number(l.debit), 0),
                createdById: ((_a = this.prisma.user) === null || _a === void 0 ? void 0 : _a.id) || 'SYSTEM',
                lines: {
                    create: linesWithIds
                }
            }
        });
    }
    async postJournalEntry(id) {
        var _a;
        const entry = await this.prisma.client.journalEntry.findUnique({
            where: { id },
            include: { lines: true },
        });
        if (!entry) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Journal Entry' }));
        }
        if (entry.isPosted) {
            throw new common_1.BadRequestException(this.t.translate('errors.accounting.entry_already_posted', 'EN'));
        }
        const totalDebit = entry.lines.reduce((sum, l) => sum + Number(l.debit), 0);
        const totalCredit = entry.lines.reduce((sum, l) => sum + Number(l.credit), 0);
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new common_1.BadRequestException(this.t.translate('errors.accounting.unbalanced_entry', 'EN', { debits: String(totalDebit), credits: String(totalCredit) }));
        }
        const period = await this.prisma.client.accountingPeriod.findFirst({
            where: {
                tenantId: this.prisma.tenantId,
                startDate: { lte: entry.date },
                endDate: { gte: entry.date },
                isClosed: true,
            },
        });
        if (period) {
            throw new common_1.ForbiddenException(this.t.translate('errors.accounting.period_closed', 'EN'));
        }
        const updated = await this.prisma.client.journalEntry.update({
            where: { id },
            data: {
                isPosted: true,
                postedAt: new Date(),
                postedById: (_a = this.prisma.user) === null || _a === void 0 ? void 0 : _a.id,
            },
            include: { lines: { include: { account: true } } },
        });
        await this.auditService.logAction({
            action: 'POST_JOURNAL',
            entityType: 'JournalEntry',
            entityId: id,
            oldValue: { isPosted: false },
            newValue: { isPosted: true, postedAt: updated.postedAt },
        });
        console.log(`[AccountingService] Posted Journal Entry ${id}`);
        return updated;
    }
    async reverseJournalEntry(id, reason) {
        var _a, _b;
        const original = await this.prisma.client.journalEntry.findUnique({
            where: { id },
            include: { lines: { include: { account: true } } },
        });
        if (!original) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Journal Entry' }));
        }
        if (!original.isPosted) {
            throw new common_1.BadRequestException(this.t.translate('errors.accounting.entry_not_posted', 'EN'));
        }
        const existingReversal = await this.prisma.client.journalEntry.findFirst({
            where: { reversesId: id },
        });
        if (existingReversal) {
            throw new common_1.BadRequestException(this.t.translate('errors.accounting.entry_already_reversed', 'EN'));
        }
        const reversalLines = original.lines.map((line) => ({
            accountId: line.accountId,
            description: `REVERSAL: ${line.description || original.description}`,
            debit: Number(line.credit),
            credit: Number(line.debit),
        }));
        const reversal = await this.prisma.client.journalEntry.create({
            data: {
                tenantId: original.tenantId,
                date: new Date(),
                reference: `REV-${original.reference}`,
                description: `REVERSAL: ${reason}`,
                totalAmount: original.totalAmount,
                createdById: (_a = this.prisma.user) === null || _a === void 0 ? void 0 : _a.id,
                isPosted: true,
                postedAt: new Date(),
                postedById: (_b = this.prisma.user) === null || _b === void 0 ? void 0 : _b.id,
                reversesId: original.id,
                lines: {
                    create: reversalLines,
                },
            },
            include: { lines: { include: { account: true } } },
        });
        await this.auditService.logAction({
            action: 'REVERSE_JOURNAL',
            entityType: 'JournalEntry',
            entityId: id,
            newValue: { reversalId: reversal.id, reason },
        });
        console.log(`[AccountingService] Reversed Journal Entry ${id} with ${reversal.id}`);
        return reversal;
    }
    async closeAccountingPeriod(periodId) {
        var _a;
        const period = await this.prisma.client.accountingPeriod.findUnique({
            where: { id: periodId },
        });
        if (!period) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Accounting Period' }));
        }
        if (period.isClosed) {
            throw new common_1.BadRequestException(this.t.translate('errors.accounting.period_closed', 'EN'));
        }
        const unpostedEntries = await this.prisma.client.journalEntry.findMany({
            where: {
                tenantId: this.prisma.tenantId,
                date: { gte: period.startDate, lte: period.endDate },
                isPosted: false,
            },
            select: { id: true, reference: true },
        });
        if (unpostedEntries.length > 0) {
            throw new common_1.BadRequestException(`Cannot close period: ${unpostedEntries.length} unposted journal entries found. Please post or delete them first.`);
        }
        const updated = await this.prisma.client.accountingPeriod.update({
            where: { id: periodId },
            data: {
                isClosed: true,
                closedAt: new Date(),
                closedById: (_a = this.prisma.user) === null || _a === void 0 ? void 0 : _a.id,
            },
        });
        await this.auditService.logAction({
            action: 'CLOSE_PERIOD',
            entityType: 'AccountingPeriod',
            entityId: periodId,
            oldValue: { isClosed: false },
            newValue: { isClosed: true, closedAt: updated.closedAt },
        });
        console.log(`[AccountingService] Closed Accounting Period ${periodId}`);
        return updated;
    }
};
exports.AccountingService = AccountingService;
exports.AccountingService = AccountingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_aware_prisma_service_1.TenantAwarePrismaService,
        audit_service_1.AuditService,
        translation_service_1.TranslationService])
], AccountingService);
exports.ACCOUNT_CODES = {
    CASH_ON_HAND: '1000',
    BANK_ACCOUNT: '1010',
    ACCOUNTS_RECEIVABLE: '1100',
    INVENTORY_ASSET: '1200',
    ACCOUNTS_PAYABLE: '2000',
    VAT_PAYABLE: '2100',
    CUSTOMER_DEPOSITS: '2200',
    OWNERS_EQUITY: '3000',
    RETAINED_EARNINGS: '3100',
    SALES_REVENUE: '4000',
    SERVICE_REVENUE: '4100',
    COST_OF_GOODS_SOLD: '5000',
    RENT_EXPENSE: '5100',
    SALARIES_EXPENSE: '5200',
    UTILITIES_EXPENSE: '5300',
    GENERAL_EXPENSE: '5400',
};
//# sourceMappingURL=accounting.service.js.map