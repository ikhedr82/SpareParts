import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaxFilingStatus } from '@prisma/client';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
import { assertTransition, TAX_FILING_TRANSITIONS } from '../common/guards/fsm.guard';

@Injectable()
export class TaxFilingService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditService: AuditService,
        private readonly outbox: OutboxService,
    ) { }

    /**
     * UC-7: Generate a tax filing report for a given period.
     */
    async generateReport(
        tenantId: string, userId: string,
        dto: { periodStart: string; periodEnd: string },
        correlationId?: string,
    ) {
        const periodStart = new Date(dto.periodStart);
        const periodEnd = new Date(dto.periodEnd);

        if (periodStart >= periodEnd) {
            throw new BadRequestException('periodStart must be before periodEnd');
        }

        // Check for duplicate filing
        const existing = await this.prisma.taxFiling.findUnique({
            where: { tenantId_periodStart_periodEnd: { tenantId, periodStart, periodEnd } },
        });
        if (existing) throw new BadRequestException('Filing period already exists');

        // Aggregate financial data for the period
        const sales = await this.prisma.sale.findMany({
            where: {
                tenantId,
                status: 'COMPLETED',
                createdAt: { gte: periodStart, lte: periodEnd },
            },
            include: { items: true },
        });

        const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0);

        // Aggregate tax from invoice lines
        const invoiceLines = await this.prisma.invoiceLine.findMany({
            where: {
                invoice: { tenantId, issuedAt: { gte: periodStart, lte: periodEnd } },
            },
        });

        const totalVatDue = invoiceLines.reduce((sum, l) => sum + Number(l.taxAmount), 0);

        const reportData = {
            period: { start: dto.periodStart, end: dto.periodEnd },
            salesCount: sales.length,
            totalRevenue,
            totalVatDue,
            invoiceLinesCount: invoiceLines.length,
            generatedAt: new Date().toISOString(),
        };

        return this.prisma.$transaction(async (tx) => {
            const filing = await tx.taxFiling.create({
                data: {
                    tenantId,
                    periodStart,
                    periodEnd,
                    totalRevenue,
                    totalVatDue,
                    reportData,
                },
            });

            await this.auditService.logAction(
                tenantId, userId, 'GENERATE_TAX_REPORT', 'TaxFiling',
                filing.id, null, { totalRevenue, totalVatDue },
                correlationId, undefined, tx as any,
            );

            return filing;
        });
    }

    /**
     * File the tax report.
     * FSM: DRAFT → FILED
     */
    async fileTaxReport(
        tenantId: string, filingId: string, userId: string,
        correlationId?: string,
    ) {
        const filing = await this.prisma.taxFiling.findFirst({
            where: { id: filingId, tenantId },
        });
        if (!filing) throw new NotFoundException('Tax Filing not found');

        assertTransition('TaxFiling', filingId, filing.status, TaxFilingStatus.FILED, TAX_FILING_TRANSITIONS);

        return this.prisma.$transaction(async (tx) => {
            const result = await tx.taxFiling.updateMany({
                where: { id: filingId, tenantId, version: filing.version },
                data: {
                    status: TaxFilingStatus.FILED,
                    filedAt: new Date(),
                    filedById: userId,
                    version: { increment: 1 },
                },
            });
            if (result.count === 0) throw new Error('CONCURRENCY_CONFLICT');

            await this.outbox.schedule(tx as any, {
                tenantId, topic: 'finance.tax_filing.filed',
                payload: { filingId, totalVatDue: Number(filing.totalVatDue) },
                correlationId,
            });

            await this.auditService.logAction(
                tenantId, userId, 'FILE_TAX_REPORT', 'TaxFiling', filingId,
                { status: filing.status }, { status: TaxFilingStatus.FILED },
                correlationId, undefined, tx as any,
            );

            return tx.taxFiling.findUnique({ where: { id: filingId } });
        });
    }

    async findAll(tenantId: string, status?: TaxFilingStatus) {
        return this.prisma.taxFiling.findMany({
            where: { tenantId, ...(status && { status }) },
            orderBy: { periodStart: 'desc' },
        });
    }

    async findOne(tenantId: string, filingId: string) {
        const filing = await this.prisma.taxFiling.findFirst({
            where: { id: filingId, tenantId },
        });
        if (!filing) throw new NotFoundException('Tax Filing not found');
        return filing;
    }
}
