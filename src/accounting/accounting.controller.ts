
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('accounting')
@UseGuards(JwtAuthGuard)
export class AccountingController {
    constructor(
        private readonly accountingService: AccountingService,
        private readonly auditService: AuditService,
    ) { }

    @Post('accounts')
    createAccount(@Body() body: { code: string; name: string; type: string; description?: string }) {
        return this.accountingService.createAccount(body);
    }

    @Get('accounts')
    getChartOfAccounts() {
        return this.accountingService.getChartOfAccounts();
    }

    @Post('journal')
    createJournalEntry(@Body() body: {
        date: string;
        reference: string;
        description?: string;
        lines: { accountId: string; debit: number; credit: number; description?: string }[]
        ;
    }) {
        return this.accountingService.createJournalEntry(body);
    }

    @Get('ledger/:accountId')
    getLedger(@Param('accountId') accountId: string) {
        return this.accountingService.getLedger(accountId);
    }

    // ===== COMPLIANCE ENDPOINTS =====

    @Post('journal/:id/post')
    postJournalEntry(@Param('id') id: string) {
        return this.accountingService.postJournalEntry(id);
    }

    @Post('journal/:id/reverse')
    reverseJournalEntry(@Param('id') id: string, @Body() body: { reason: string }) {
        return this.accountingService.reverseJournalEntry(id, body.reason);
    }

    @Post('periods/:id/close')
    closeAccountingPeriod(@Param('id') id: string) {
        return this.accountingService.closeAccountingPeriod(id);
    }

    @Get('audit/:entityId')
    getAuditTrail(@Param('entityId') entityId: string, @Body() body: { entityType: string }) {
        return this.auditService.getAuditTrail(body.entityType || 'JournalEntry', entityId);
    }

    @Get('audit/recent')
    getRecentActivity() {
        return this.auditService.getRecentActivity(50);
    }
}
