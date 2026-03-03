import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { AuditService } from './audit.service';
import { TranslationService } from '../i18n/translation.service';
export declare class AccountingService {
    private readonly prisma;
    private readonly auditService;
    private readonly t;
    constructor(prisma: TenantAwarePrismaService, auditService: AuditService, t: TranslationService);
    createAccount(dto: {
        code: string;
        name: string;
        type: string;
        description?: string;
    }): Promise<any>;
    getChartOfAccounts(): Promise<any>;
    createJournalEntry(dto: {
        date: string;
        reference: string;
        description?: string;
        lines: {
            accountId: string;
            debit: number;
            credit: number;
            description?: string;
        }[];
    }): Promise<any>;
    getLedger(accountId: string): Promise<any>;
    createSystemJournalEntry(dto: {
        date: Date;
        reference: string;
        description?: string;
        lines: {
            accountId: string;
            debit: number;
            credit: number;
            description?: string;
        }[];
    }, tx?: any): Promise<any>;
    createSystemJournalEntryByCode(dto: {
        date: Date;
        reference: string;
        description?: string;
        lines: {
            accountCode: string;
            debit: number;
            credit: number;
            description?: string;
        }[];
    }, tx: any, tenantId: string): Promise<any>;
    postJournalEntry(id: string): Promise<any>;
    reverseJournalEntry(id: string, reason: string): Promise<any>;
    closeAccountingPeriod(periodId: string): Promise<any>;
}
export declare const ACCOUNT_CODES: {
    CASH_ON_HAND: string;
    BANK_ACCOUNT: string;
    ACCOUNTS_RECEIVABLE: string;
    INVENTORY_ASSET: string;
    ACCOUNTS_PAYABLE: string;
    VAT_PAYABLE: string;
    CUSTOMER_DEPOSITS: string;
    OWNERS_EQUITY: string;
    RETAINED_EARNINGS: string;
    SALES_REVENUE: string;
    SERVICE_REVENUE: string;
    COST_OF_GOODS_SOLD: string;
    RENT_EXPENSE: string;
    SALARIES_EXPENSE: string;
    UTILITIES_EXPENSE: string;
    GENERAL_EXPENSE: string;
};
