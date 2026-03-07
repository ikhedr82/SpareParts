
import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { AuditService } from './audit.service';
import { TranslationService } from '../i18n/translation.service';

@Injectable()
export class AccountingService {
    constructor(
        private readonly prisma: TenantAwarePrismaService,
        private readonly auditService: AuditService,
        private readonly t: TranslationService,
    ) { }

    async createAccount(dto: { code: string; name: string; type: string; description?: string }) {
        return (this.prisma.client as any).chartOfAccount.create({
            data: dto,
        });
    }

    async getChartOfAccounts() {
        console.log('AccountingService.getChartOfAccounts called');
        const client = this.prisma.client as any;
        // console.log('Client keys:', Object.keys(client)); // large output
        console.log('Client chartOfAccount present:', !!client.chartOfAccount);

        return client.chartOfAccount.findMany({
            orderBy: { code: 'asc' },
        });
    }

    async createJournalEntry(dto: {
        date: string;
        reference: string;
        description?: string;
        lines: { accountId: string; debit: number; credit: number; description?: string }[];
    }) {
        const totalDebit = dto.lines.reduce((sum, line) => sum + Number(line.debit), 0);
        const totalCredit = dto.lines.reduce((sum, line) => sum + Number(line.credit), 0);

        if (totalDebit !== totalCredit) {
            throw new BadRequestException(this.t.translate('errors.accounting.unbalanced_entry', 'EN', { debits: String(totalDebit), credits: String(totalCredit) }));
        }

        const date = new Date(dto.date);

        return (this.prisma.client as any).journalEntry.create({
            data: {
                date,
                reference: dto.reference,
                description: dto.description,
                totalAmount: totalDebit,
                createdById: this.prisma.user.id, // Using the public user getter
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

    async getLedger(accountId: string) {
        return (this.prisma.client as any).journalLine.findMany({
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

    async createSystemJournalEntry(
        dto: {
            date: Date;
            reference: string;
            description?: string;
            lines: { accountId: string; debit: number; credit: number; description?: string }[];
        },
        tx?: any // Accepts specific transaction context
    ) {
        const client = tx || (this.prisma.client as any);
        const tenantId = tx ? (tx as any).tenantId || this.prisma.tenantId : this.prisma.tenantId;

        // Ensure we have a tenantId for system actions if not present in tx
        // (For system actions triggered by services, tenantId should be available)

        const totalDebit = dto.lines.reduce((sum, line) => sum + Number(line.debit), 0);
        const totalCredit = dto.lines.reduce((sum, line) => sum + Number(line.credit), 0);

        if (Math.abs(totalDebit - totalCredit) > 0.01) { // Allow minor floating point diff
            throw new BadRequestException(this.t.translate('errors.accounting.unbalanced_entry', 'EN', { debits: String(totalDebit), credits: String(totalCredit) }));
        }

        // We need to resolve Account Codes to IDs if strict IDs are used. 
        // But our schema uses UUIDs for ChartOfAccount. 
        // So we need a helper to look up Account ID by Code efficiently?
        // OR we change the method to accept Account CODES and look them up.
        // Let's modify to accept CODES or IDs?
        // For efficiency in a transaction, looking up IDs might be repeated.
        // BUT, we can cache them or look them up in the transaction.

        // BETTER: Let's assume the caller passes Account IDs? 
        // No, caller (SalesService) knows CODES (e.g. 4000). It doesn't know UUIDs.
        // So this method should look up UUIDs by Code.

        const accountCodes = [...new Set(dto.lines.map(l => l.accountId))]; // Treating 'accountId' input as CODE here for convenience?
        // Actually, let's keep the signature clean: "accountId" should be ID.
        // I'll add a separate helper "getAccountIdByCode" or do it inside here if we change input to "accountCode".
        // Let's change input to "accountCode" to make it easier for callers.

        return tx.journalEntry.create({
            data: {
                tenantId,
                date: dto.date,
                reference: dto.reference,
                description: dto.description,
                totalAmount: totalDebit,
                createdById: this.prisma.user?.id || 'SYSTEM',
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

    async createSystemJournalEntryByCode(
        dto: {
            date: Date;
            reference: string;
            description?: string;
            lines: { accountCode: string; debit: number; credit: number; description?: string }[];
        },
        tx: any,
        tenantId: string
    ) {
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
                createdById: this.prisma.user?.id || 'SYSTEM', // Fallback for system actions
                lines: {
                    create: linesWithIds
                }
            }
        });
    }

    // ===== COMPLIANCE METHODS =====

    async postJournalEntry(id: string) {
        const entry = await (this.prisma.client as any).journalEntry.findUnique({
            where: { id },
            include: { lines: true },
        });

        if (!entry) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Journal Entry' }));
        }

        if (entry.isPosted) {
            throw new BadRequestException(this.t.translate('errors.accounting.entry_already_posted', 'EN'));
        }

        // Validate balanced
        const totalDebit = entry.lines.reduce((sum, l) => sum + Number(l.debit), 0);
        const totalCredit = entry.lines.reduce((sum, l) => sum + Number(l.credit), 0);
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new BadRequestException(this.t.translate('errors.accounting.unbalanced_entry', 'EN', { debits: String(totalDebit), credits: String(totalCredit) }));
        }

        // Check if period is open (if date falls within a period)
        const period = await (this.prisma.client as any).accountingPeriod.findFirst({
            where: {
                tenantId: this.prisma.tenantId,
                startDate: { lte: entry.date },
                endDate: { gte: entry.date },
                isClosed: true,
            },
        });

        if (period) {
            throw new ForbiddenException(this.t.translate('errors.accounting.period_closed', 'EN'));
        }

        const updated = await (this.prisma.client as any).journalEntry.update({
            where: { id },
            data: {
                isPosted: true,
                postedAt: new Date(),
                postedById: this.prisma.user?.id,
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

    async reverseJournalEntry(id: string, reason: string) {
        const original = await (this.prisma.client as any).journalEntry.findUnique({
            where: { id },
            include: { lines: { include: { account: true } } },
        });

        if (!original) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Journal Entry' }));
        }

        if (!original.isPosted) {
            throw new BadRequestException(this.t.translate('errors.accounting.entry_not_posted', 'EN'));
        }

        // Check if already reversed
        const existingReversal = await (this.prisma.client as any).journalEntry.findFirst({
            where: { reversesId: id },
        });

        if (existingReversal) {
            throw new BadRequestException(this.t.translate('errors.accounting.entry_already_reversed', 'EN'));
        }

        // Create reversing entry with opposite Dr/Cr
        const reversalLines = original.lines.map((line: any) => ({
            accountId: line.accountId,
            description: `REVERSAL: ${line.description || original.description}`,
            debit: Number(line.credit), // Swap
            credit: Number(line.debit),  // Swap
        }));

        const reversal = await (this.prisma.client as any).journalEntry.create({
            data: {
                tenantId: original.tenantId,
                date: new Date(), // Reversal dated today
                reference: `REV-${original.reference}`,
                description: `REVERSAL: ${reason}`,
                totalAmount: original.totalAmount,
                createdById: this.prisma.user?.id,
                isPosted: true,  // Immediately posted
                postedAt: new Date(),
                postedById: this.prisma.user?.id,
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

    async closeAccountingPeriod(periodId: string) {
        const period = await (this.prisma.client as any).accountingPeriod.findUnique({
            where: { id: periodId },
        });

        if (!period) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Accounting Period' }));
        }

        if (period.isClosed) {
            throw new BadRequestException(this.t.translate('errors.accounting.period_closed', 'EN'));
        }

        // Validate all entries in period are posted
        const unpostedEntries = await (this.prisma.client as any).journalEntry.findMany({
            where: {
                tenantId: this.prisma.tenantId,
                date: { gte: period.startDate, lte: period.endDate },
                isPosted: false,
            },
            select: { id: true, reference: true },
        });

        if (unpostedEntries.length > 0) {
            throw new BadRequestException(
                `Cannot close period: ${unpostedEntries.length} unposted journal entries found. Please post or delete them first.`
            );
        }

        const updated = await (this.prisma.client as any).accountingPeriod.update({
            where: { id: periodId },
            data: {
                isClosed: true,
                closedAt: new Date(),
                closedById: this.prisma.user?.id,
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
}

export const ACCOUNT_CODES = {
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
