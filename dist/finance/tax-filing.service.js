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
exports.TaxFilingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const audit_service_1 = require("../shared/audit.service");
const outbox_service_1 = require("../shared/outbox.service");
const fsm_guard_1 = require("../common/guards/fsm.guard");
let TaxFilingService = class TaxFilingService {
    constructor(prisma, auditService, outbox) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.outbox = outbox;
    }
    async generateReport(tenantId, userId, dto, correlationId) {
        const periodStart = new Date(dto.periodStart);
        const periodEnd = new Date(dto.periodEnd);
        if (periodStart >= periodEnd) {
            throw new common_1.BadRequestException('periodStart must be before periodEnd');
        }
        const existing = await this.prisma.taxFiling.findUnique({
            where: { tenantId_periodStart_periodEnd: { tenantId, periodStart, periodEnd } },
        });
        if (existing)
            throw new common_1.BadRequestException('Filing period already exists');
        const sales = await this.prisma.sale.findMany({
            where: {
                tenantId,
                status: 'COMPLETED',
                createdAt: { gte: periodStart, lte: periodEnd },
            },
            include: { items: true },
        });
        const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0);
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
            await this.auditService.logAction(tenantId, userId, 'GENERATE_TAX_REPORT', 'TaxFiling', filing.id, null, { totalRevenue, totalVatDue }, correlationId, undefined, tx);
            return filing;
        });
    }
    async fileTaxReport(tenantId, filingId, userId, correlationId) {
        const filing = await this.prisma.taxFiling.findFirst({
            where: { id: filingId, tenantId },
        });
        if (!filing)
            throw new common_1.NotFoundException('Tax Filing not found');
        (0, fsm_guard_1.assertTransition)('TaxFiling', filingId, filing.status, client_1.TaxFilingStatus.FILED, fsm_guard_1.TAX_FILING_TRANSITIONS);
        return this.prisma.$transaction(async (tx) => {
            const result = await tx.taxFiling.updateMany({
                where: { id: filingId, tenantId, version: filing.version },
                data: {
                    status: client_1.TaxFilingStatus.FILED,
                    filedAt: new Date(),
                    filedById: userId,
                    version: { increment: 1 },
                },
            });
            if (result.count === 0)
                throw new Error('CONCURRENCY_CONFLICT');
            await this.outbox.schedule(tx, {
                tenantId, topic: 'finance.tax_filing.filed',
                payload: { filingId, totalVatDue: Number(filing.totalVatDue) },
                correlationId,
            });
            await this.auditService.logAction(tenantId, userId, 'FILE_TAX_REPORT', 'TaxFiling', filingId, { status: filing.status }, { status: client_1.TaxFilingStatus.FILED }, correlationId, undefined, tx);
            return tx.taxFiling.findUnique({ where: { id: filingId } });
        });
    }
    async findAll(tenantId, status) {
        return this.prisma.taxFiling.findMany({
            where: Object.assign({ tenantId }, (status && { status })),
            orderBy: { periodStart: 'desc' },
        });
    }
    async findOne(tenantId, filingId) {
        const filing = await this.prisma.taxFiling.findFirst({
            where: { id: filingId, tenantId },
        });
        if (!filing)
            throw new common_1.NotFoundException('Tax Filing not found');
        return filing;
    }
};
exports.TaxFilingService = TaxFilingService;
exports.TaxFilingService = TaxFilingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        outbox_service_1.OutboxService])
], TaxFilingService);
//# sourceMappingURL=tax-filing.service.js.map