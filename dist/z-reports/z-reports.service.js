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
exports.ZReportsService = void 0;
const common_1 = require("@nestjs/common");
const tenant_aware_prisma_service_1 = require("../prisma/tenant-aware-prisma.service");
const translation_service_1 = require("../i18n/translation.service");
let ZReportsService = class ZReportsService {
    constructor(prisma, t) {
        this.prisma = prisma;
        this.t = t;
    }
    async closeDay(branchId, closingCash) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existingReport = await this.prisma.client.zReport.findFirst({
            where: {
                branchId,
                businessDate: today,
            },
        });
        if (existingReport) {
            throw new common_1.ConflictException(this.t.translate('errors.accounting.report_already_generated', 'EN'));
        }
        return this.prisma.client.$transaction(async (tx) => {
            const openSession = await tx.cashSession.findFirst({
                where: {
                    branchId,
                    status: 'OPEN',
                },
            });
            let openingCash = 0;
            if (openSession) {
                openingCash = Number(openSession.openingCash);
                await tx.cashSession.update({
                    where: { id: openSession.id },
                    data: {
                        status: 'CLOSED',
                        closedAt: new Date(),
                        closingCash,
                        difference: closingCash - (Number(openSession.expectedCash) || 0),
                    },
                });
            }
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            const salesAgg = await tx.sale.aggregate({
                where: {
                    branchId,
                    createdAt: { gte: startOfDay, lte: endOfDay },
                },
                _sum: { total: true },
            });
            const returns = await tx.return.findMany({
                where: {
                    branchId,
                    createdAt: { gte: startOfDay, lte: endOfDay },
                },
                include: {
                    returnItems: {
                        include: {
                            product: true
                        }
                    },
                    sale: {
                        include: {
                            items: true
                        }
                    }
                }
            });
            let totalReturns = 0;
            for (const r of returns) {
                for (const rItem of r.returnItems) {
                    const originalSaleItem = r.sale.items.find(si => si.productId === rItem.productId);
                    const price = originalSaleItem ? Number(originalSaleItem.price) : 0;
                    totalReturns += (rItem.quantity * price);
                }
            }
            const sessionsToday = await tx.cashSession.findMany({
                where: {
                    branchId,
                    openedAt: { gte: startOfDay, lte: endOfDay },
                },
            });
            openingCash = sessionsToday.reduce((sum, session) => sum + Number(session.openingCash), 0);
            const payments = await tx.payment.findMany({
                where: {
                    sale: { branchId },
                    createdAt: { gte: startOfDay, lte: endOfDay },
                },
            });
            let cashSales = 0;
            let cardSales = 0;
            let transferSales = 0;
            for (const p of payments) {
                const amount = Number(p.amount);
                if (p.method === 'CASH')
                    cashSales += amount;
                else if (p.method === 'CARD')
                    cardSales += amount;
                else if (p.method === 'TRANSFER')
                    transferSales += amount;
            }
            const totalPayments = cashSales + cardSales + transferSales;
            const totalSales = Number(salesAgg._sum.total || 0);
            const expectedCash = openingCash + cashSales;
            const difference = closingCash - expectedCash;
            const zReport = await tx.zReport.create({
                data: {
                    tenantId: this.prisma.tenantId,
                    branchId,
                    businessDate: today,
                    totalSales,
                    totalReturns,
                    totalPayments,
                    cashSales,
                    cardSales,
                    transferSales,
                    openingCash,
                    expectedCash,
                    closingCash,
                    difference,
                },
            });
            return zReport;
        });
    }
    async findAll(branchId) {
        return this.prisma.client.zReport.findMany({
            where: { branchId },
            orderBy: { businessDate: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.client.zReport.findUnique({
            where: { id },
        });
    }
};
exports.ZReportsService = ZReportsService;
exports.ZReportsService = ZReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_aware_prisma_service_1.TenantAwarePrismaService,
        translation_service_1.TranslationService])
], ZReportsService);
//# sourceMappingURL=z-reports.service.js.map