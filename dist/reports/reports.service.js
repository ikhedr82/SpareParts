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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const tenant_aware_prisma_service_1 = require("../prisma/tenant-aware-prisma.service");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getVatReport(tenantId, startDate, endDate) {
        const invoices = await this.prisma.client.invoice.findMany({
            where: {
                tenantId,
                issuedAt: {
                    gte: startDate,
                    lte: endDate,
                },
                status: 'PAID',
            },
            include: {
                lines: {
                    include: { taxRate: true }
                }
            }
        });
        const report = {
            totalSales: 0,
            totalTax: 0,
            breakdown: {}
        };
        for (const invoice of invoices) {
            report.totalSales += Number(invoice.subtotal);
            report.totalTax += Number(invoice.tax);
            for (const line of invoice.lines) {
                if (line.taxRate) {
                    const rateName = line.taxRate.name;
                    report.breakdown[rateName] = (report.breakdown[rateName] || 0) + Number(line.taxAmount);
                }
            }
        }
        return report;
    }
    async getProfitLoss(tenantId, startDate, endDate) {
        const sales = await this.prisma.client.sale.findMany({
            where: {
                tenantId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                status: 'COMPLETED'
            },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });
        let totalRevenue = 0;
        let totalCOGS = 0;
        for (const sale of sales) {
            totalRevenue += Number(sale.total);
            for (const item of sale.items) {
                const product = item.product;
                if (product) {
                }
            }
        }
        return {
            revenue: totalRevenue,
            cogs: totalCOGS,
            profit: totalRevenue - totalCOGS
        };
    }
    async getAgingReport(tenantId, type) {
        if (type === 'CUSTOMER') {
            return this.prisma.client.customer.findMany({
                where: { tenantId, balance: { gt: 0 } },
                orderBy: { balance: 'desc' }
            });
        }
        else {
            return this.prisma.client.supplier.findMany({
                where: { tenantId, balance: { gt: 0 } },
                orderBy: { balance: 'desc' }
            });
        }
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_aware_prisma_service_1.TenantAwarePrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map