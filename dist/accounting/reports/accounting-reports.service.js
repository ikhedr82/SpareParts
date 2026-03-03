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
exports.AccountingReportsService = void 0;
const common_1 = require("@nestjs/common");
const tenant_aware_prisma_service_1 = require("../../prisma/tenant-aware-prisma.service");
const accounting_service_1 = require("../accounting.service");
let AccountingReportsService = class AccountingReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTrialBalance(from, to) {
        const lines = await this.prisma.client.journalLine.groupBy({
            by: ['accountId'],
            where: {
                journalEntry: {
                    date: { gte: from, lte: to },
                    tenantId: this.prisma.tenantId
                }
            },
            _sum: {
                debit: true,
                credit: true
            }
        });
        const accountIds = lines.map((l) => l.accountId);
        const accounts = await this.prisma.client.chartOfAccount.findMany({
            where: { id: { in: accountIds } }
        });
        const accountMap = new Map(accounts.map(a => [a.id, a]));
        return lines.map((line) => {
            const account = accountMap.get(line.accountId);
            const debit = Number(line._sum.debit || 0);
            const credit = Number(line._sum.credit || 0);
            return {
                accountId: line.accountId,
                accountCode: account === null || account === void 0 ? void 0 : account.code,
                accountName: account === null || account === void 0 ? void 0 : account.name,
                type: account === null || account === void 0 ? void 0 : account.type,
                debitTotal: debit,
                creditTotal: credit,
                balance: debit - credit
            };
        }).sort((a, b) => (a.accountCode || '').localeCompare(b.accountCode || ''));
    }
    async getIncomeStatement(from, to) {
        const lines = await this.prisma.client.journalLine.findMany({
            where: {
                journalEntry: {
                    date: { gte: from, lte: to },
                    tenantId: this.prisma.tenantId
                },
                account: {
                    type: { in: ['REVENUE', 'EXPENSE'] }
                }
            },
            include: { account: true }
        });
        let totalRevenue = 0;
        let totalCOGS = 0;
        let totalExpenses = 0;
        lines.forEach(line => {
            const amount = Number(line.credit) - Number(line.debit);
            if (line.account.type === 'REVENUE') {
                totalRevenue += amount;
            }
            else if (line.account.type === 'EXPENSE') {
                const expenseAmount = Number(line.debit) - Number(line.credit);
                if (line.account.code === accounting_service_1.ACCOUNT_CODES.COST_OF_GOODS_SOLD) {
                    totalCOGS += expenseAmount;
                }
                else {
                    totalExpenses += expenseAmount;
                }
            }
        });
        return {
            totalRevenue,
            totalCOGS,
            grossProfit: totalRevenue - totalCOGS,
            totalExpenses,
            netProfit: totalRevenue - totalCOGS - totalExpenses
        };
    }
    async getBalanceSheet(asOf) {
        const lines = await this.prisma.client.journalLine.groupBy({
            by: ['accountId'],
            where: {
                journalEntry: {
                    date: { lte: asOf },
                    tenantId: this.prisma.tenantId
                }
            },
            _sum: { debit: true, credit: true }
        });
        const accountIds = lines.map((l) => l.accountId);
        const accounts = await this.prisma.client.chartOfAccount.findMany({
            where: { id: { in: accountIds } }
        });
        const accountMap = new Map(accounts.map(a => [a.id, a]));
        const report = {
            assets: [],
            liabilities: [],
            equity: [],
            totalAssets: 0,
            totalLiabilities: 0,
            totalEquity: 0
        };
        let calculatedNetIncome = 0;
        lines.forEach((line) => {
            const account = accountMap.get(line.accountId);
            if (!account)
                return;
            const debit = Number(line._sum.debit || 0);
            const credit = Number(line._sum.credit || 0);
            const net = debit - credit;
            const netCredit = credit - debit;
            if (account.type === 'ASSET') {
                report.assets.push({ code: account.code, name: account.name, amount: net });
                report.totalAssets += net;
            }
            else if (account.type === 'LIABILITY') {
                report.liabilities.push({ code: account.code, name: account.name, amount: netCredit });
                report.totalLiabilities += netCredit;
            }
            else if (account.type === 'EQUITY') {
                report.equity.push({ code: account.code, name: account.name, amount: netCredit });
                report.totalEquity += netCredit;
            }
            else if (account.type === 'REVENUE') {
                calculatedNetIncome += netCredit;
            }
            else if (account.type === 'EXPENSE') {
                calculatedNetIncome -= net;
            }
        });
        report.equity.push({ code: '9999', name: 'Net Income (Calculated)', amount: calculatedNetIncome });
        report.totalEquity += calculatedNetIncome;
        return report;
    }
    async getCashFlow(from, to) {
        const cashAccounts = await this.prisma.client.chartOfAccount.findMany({
            where: {
                tenantId: this.prisma.tenantId,
                code: { in: [accounting_service_1.ACCOUNT_CODES.CASH_ON_HAND, accounting_service_1.ACCOUNT_CODES.BANK_ACCOUNT] }
            }
        });
        const cashAccountIds = cashAccounts.map(c => c.id);
        const cashLines = await this.prisma.client.journalLine.findMany({
            where: {
                accountId: { in: cashAccountIds },
                journalEntry: {
                    date: { gte: from, lte: to },
                    tenantId: this.prisma.tenantId
                }
            },
            include: {
                journalEntry: {
                    include: { lines: { include: { account: true } } }
                }
            }
        });
        let operating = 0;
        let investing = 0;
        let financing = 0;
        let cashFromSales = 0;
        let cashToSuppliers = 0;
        let otherOperating = 0;
        for (const line of cashLines) {
            const isDebit = Number(line.debit) > 0;
            const amount = isDebit ? Number(line.debit) : -Number(line.credit);
            const entry = line.journalEntry;
            const otherLines = entry.lines.filter(l => l.id !== line.id);
            let classified = false;
            for (const other of otherLines) {
                const type = other.account.type;
                const code = other.account.code;
                if (code === accounting_service_1.ACCOUNT_CODES.ACCOUNTS_RECEIVABLE || type === 'REVENUE') {
                    cashFromSales += amount;
                    classified = true;
                    break;
                }
                if (code === accounting_service_1.ACCOUNT_CODES.ACCOUNTS_PAYABLE || type === 'EXPENSE' || code === accounting_service_1.ACCOUNT_CODES.COST_OF_GOODS_SOLD) {
                    cashToSuppliers += amount;
                    classified = true;
                    break;
                }
            }
            if (!classified) {
                otherOperating += amount;
            }
        }
        return {
            operatingActivities: {
                cashFromSales,
                cashPaidToSuppliers: cashToSuppliers,
                otherCheck: otherOperating,
                netCashFromOperating: cashFromSales + cashToSuppliers + otherOperating
            },
            investingActivities: {
                netCashFromInvesting: 0
            },
            financingActivities: {
                netCashFromFinancing: 0
            },
            netCashChange: cashFromSales + cashToSuppliers + otherOperating
        };
    }
};
exports.AccountingReportsService = AccountingReportsService;
exports.AccountingReportsService = AccountingReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_aware_prisma_service_1.TenantAwarePrismaService])
], AccountingReportsService);
//# sourceMappingURL=accounting-reports.service.js.map