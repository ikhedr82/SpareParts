import { Injectable } from '@nestjs/common';
import { TenantAwarePrismaService } from '../../prisma/tenant-aware-prisma.service';
import { AccountType, ChartOfAccount, JournalLine, JournalEntry } from '@prisma/client';
import { ACCOUNT_CODES } from '../accounting.service';

@Injectable()
export class AccountingReportsService {
    constructor(private readonly prisma: TenantAwarePrismaService) { }

    async getTrialBalance(from: Date, to: Date) {
        const lines = await (this.prisma.client as any).journalLine.groupBy({
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

        // Resolve account names
        const accountIds = lines.map((l: any) => l.accountId);
        const accounts = await (this.prisma.client as any).chartOfAccount.findMany({
            where: { id: { in: accountIds } }
        }) as ChartOfAccount[];

        const accountMap = new Map<string, ChartOfAccount>(accounts.map(a => [a.id, a]));

        return lines.map((line: any) => {
            const account = accountMap.get(line.accountId);
            const debit = Number(line._sum.debit || 0);
            const credit = Number(line._sum.credit || 0);
            return {
                accountId: line.accountId,
                accountCode: account?.code,
                accountName: account?.name,
                type: account?.type,
                debitTotal: debit,
                creditTotal: credit,
                balance: debit - credit
            };
        }).sort((a, b) => (a.accountCode || '').localeCompare(b.accountCode || ''));
    }

    async getIncomeStatement(from: Date, to: Date) {
        // Revenue, COGS, Expenses
        const lines = await (this.prisma.client as any).journalLine.findMany({
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
        }) as (JournalLine & { account: ChartOfAccount })[];

        let totalRevenue = 0;
        let totalCOGS = 0;
        let totalExpenses = 0;

        lines.forEach(line => {
            const amount = Number(line.credit) - Number(line.debit); // Revenue is Credit normal

            if (line.account.type === 'REVENUE') {
                totalRevenue += amount;
            } else if (line.account.type === 'EXPENSE') {
                // Expense is Debit normal (so amount is negative here)
                // To get positive Expense number: (Dr - Cr)
                const expenseAmount = Number(line.debit) - Number(line.credit);

                if (line.account.code === ACCOUNT_CODES.COST_OF_GOODS_SOLD) {
                    totalCOGS += expenseAmount;
                } else {
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

    // Calculating Retained Earnings is tricky because it's the sum of all previous years' profit.
    // For simplicity in this implementation, we will calculate "Check-to-date" profit for Equity section?
    // Or we assume Retained Earnings account is manually updated at year end?
    // "Current Period Profit" is usually dynamic.

    async getBalanceSheet(asOf: Date) {
        // Assets, Liabilities, Equity
        // We need cumulative balance from beginning of time (or last close) to asOf.
        // Since we don't have hard close yet, we sum everything <= asOf.

        const lines = await (this.prisma.client as any).journalLine.groupBy({
            by: ['accountId'],
            where: {
                journalEntry: {
                    date: { lte: asOf },
                    tenantId: this.prisma.tenantId
                }
            },
            _sum: { debit: true, credit: true }
        });

        const accountIds = lines.map((l: any) => l.accountId);
        const accounts = await (this.prisma.client as any).chartOfAccount.findMany({
            where: { id: { in: accountIds } }
        }) as ChartOfAccount[];
        const accountMap = new Map(accounts.map(a => [a.id, a]));

        const report = {
            assets: [] as any[],
            liabilities: [] as any[],
            equity: [] as any[],
            totalAssets: 0,
            totalLiabilities: 0,
            totalEquity: 0
        };

        let calculatedNetIncome = 0; // Revenue - Expenses (All time)

        lines.forEach((line: any) => {
            const account = accountMap.get(line.accountId);
            if (!account) return;

            const debit = Number(line._sum.debit || 0);
            const credit = Number(line._sum.credit || 0);
            const net = debit - credit; // Asset normal
            const netCredit = credit - debit; // Liability/Equity/Revenue normal

            if (account.type === 'ASSET') {
                report.assets.push({ code: account.code, name: account.name, amount: net });
                report.totalAssets += net;
            } else if (account.type === 'LIABILITY') {
                report.liabilities.push({ code: account.code, name: account.name, amount: netCredit });
                report.totalLiabilities += netCredit;
            } else if (account.type === 'EQUITY') {
                report.equity.push({ code: account.code, name: account.name, amount: netCredit });
                report.totalEquity += netCredit;
            } else if (account.type === 'REVENUE') {
                calculatedNetIncome += netCredit;
            } else if (account.type === 'EXPENSE') {
                calculatedNetIncome -= net;
            }
        });

        // Add Current Period Profit to Equity
        report.equity.push({ code: '9999', name: 'Net Income (Calculated)', amount: calculatedNetIncome });
        report.totalEquity += calculatedNetIncome;

        return report;
    }

    async getCashFlow(from: Date, to: Date) {
        // Direct Method or Indirect? User asked "Cash account movements".
        // This implies Direct method (analyzing cash account journal lines).
        // Group by: Operating, Investing, Financing.
        // We can infer activity based on the *other* side of the transaction? That's complex.

        // Simpler approach for now:
        // Filter journal lines where account is CASH (1000) or BANK (1010).
        // Look at the "Description" or reference, or the offset account?
        // Analyzing offset account in a multi-line journal is hard.

        // Let's implement a basic Cash Flow based on key account codes movements if possible, 
        // OR just list Cash In/Out.

        // "At minimum: Cash from Sales, Cash paid to Suppliers, Cash refunds, Net Cash Change"

        // Cash from Sales: Debit Cash, Credit AR (or Revenue).
        // Cash to Suppliers: Credit Cash, Debit AP (or Expense).

        // Let's just track Net Change in Cash Accounts for the period.
        // And maybe try to categorize based on contra-account types if transaction is simple (2 lines).

        const cashAccounts = await (this.prisma.client as any).chartOfAccount.findMany({
            where: {
                tenantId: this.prisma.tenantId,
                code: { in: [ACCOUNT_CODES.CASH_ON_HAND, ACCOUNT_CODES.BANK_ACCOUNT] }
            }
        }) as ChartOfAccount[];
        const cashAccountIds = cashAccounts.map(c => c.id);

        // Include types are tricky with raw client, better to fetch and map manually or use careful typing
        const cashLines = await (this.prisma.client as any).journalLine.findMany({
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
        }) as (JournalLine & {
            journalEntry: JournalEntry & {
                lines: (JournalLine & { account: ChartOfAccount })[]
            }
        })[];

        let operating = 0;
        let investing = 0;
        let financing = 0;

        // Categories
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

                if (code === ACCOUNT_CODES.ACCOUNTS_RECEIVABLE || type === 'REVENUE') {
                    cashFromSales += amount;
                    classified = true;
                    break;
                }
                if (code === ACCOUNT_CODES.ACCOUNTS_PAYABLE || type === 'EXPENSE' || code === ACCOUNT_CODES.COST_OF_GOODS_SOLD) {
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
}
