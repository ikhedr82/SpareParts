import { AccountingService } from './accounting.service';
import { AuditService } from './audit.service';
export declare class AccountingController {
    private readonly accountingService;
    private readonly auditService;
    constructor(accountingService: AccountingService, auditService: AuditService);
    createAccount(body: {
        code: string;
        name: string;
        type: string;
        description?: string;
    }): Promise<any>;
    getChartOfAccounts(): Promise<any>;
    createJournalEntry(body: {
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
    postJournalEntry(id: string): Promise<any>;
    reverseJournalEntry(id: string, body: {
        reason: string;
    }): Promise<any>;
    closeAccountingPeriod(id: string): Promise<any>;
    getAuditTrail(entityId: string, body: {
        entityType: string;
    }): Promise<any>;
    getRecentActivity(): Promise<any>;
}
