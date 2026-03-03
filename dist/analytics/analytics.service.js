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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const tenant_aware_prisma_service_1 = require("../prisma/tenant-aware-prisma.service");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardKPIs(branchId) {
        const whereClause = {};
        if (branchId) {
            whereClause.branchId = branchId;
        }
        const [salesData, inventoryData, unpaidInvoices] = await Promise.all([
            this.prisma.client.sale.aggregate({
                where: whereClause,
                _sum: { total: true },
                _count: { id: true },
            }),
            this.prisma.client.inventory.findMany({
                where: branchId ? { branchId } : {},
                select: { quantity: true, sellingPrice: true },
            }),
            this.prisma.client.invoice.findMany({
                where: {
                    status: 'UNPAID',
                    sale: branchId ? { branchId } : {},
                },
                select: { amount: true },
            }),
        ]);
        const revenue = Number(salesData._sum.total || 0);
        const profit = revenue;
        const paymentBreakdown = await this.prisma.client.payment.groupBy({
            by: ['method'],
            where: {
                sale: branchId ? { branchId } : {},
            },
            _sum: { amount: true },
        });
        const lowStockCount = await this.prisma.client.inventory.count({
            where: Object.assign(Object.assign({}, (branchId ? { branchId } : {})), { quantity: { lt: 10 } }),
        });
        return {
            kpis: {
                revenue,
                profit,
                totalSales: salesData._count.id,
                lowStockAlerts: lowStockCount,
                unpaidInvoicesCount: unpaidInvoices.length,
                unpaidInvoicesTotal: unpaidInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0),
            },
            payments: paymentBreakdown.map((p) => ({
                method: p.method,
                amount: Number(p._sum.amount || 0),
            })),
        };
    }
    async getSalesReports(period, branchId) {
        const now = new Date();
        let startDate = new Date();
        if (period === 'daily') {
            startDate.setHours(0, 0, 0, 0);
        }
        else if (period === 'weekly') {
            startDate.setDate(now.getDate() - 7);
        }
        else if (period === 'monthly') {
            startDate.setMonth(now.getMonth() - 1);
        }
        const sales = await this.prisma.client.sale.findMany({
            where: Object.assign(Object.assign({}, (branchId ? { branchId } : {})), { createdAt: { gte: startDate } }),
            orderBy: { createdAt: 'asc' },
            select: {
                createdAt: true,
                total: true,
            },
        });
        const aggregates = sales.reduce((acc, sale) => {
            const date = sale.createdAt.toISOString().split('T')[0];
            if (!acc[date])
                acc[date] = 0;
            acc[date] += Number(sale.total);
            return acc;
        }, {});
        return Object.entries(aggregates).map(([date, total]) => ({
            date,
            total,
        }));
    }
    async getInventoryReport(branchId) {
        const topProducts = await this.prisma.client.saleItem.groupBy({
            by: ['productId'],
            where: {
                sale: branchId ? { branchId } : {},
            },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5,
        });
        const products = await this.prisma.client.product.findMany({
            where: {
                id: { in: topProducts.map((p) => p.productId) },
            },
            select: { id: true, name: true },
        });
        return topProducts.map((tp) => {
            var _a;
            return ({
                productId: tp.productId,
                name: ((_a = products.find((p) => p.id === tp.productId)) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown',
                quantitySold: tp._sum.quantity,
            });
        });
    }
    async getCashFlowReport(branchId) {
        const payments = await this.prisma.client.payment.findMany({
            where: {
                sale: branchId ? { branchId } : {},
            },
            orderBy: { createdAt: 'asc' },
            select: {
                createdAt: true,
                amount: true,
            }
        });
        const trends = payments.reduce((acc, p) => {
            const date = p.createdAt.toISOString().split('T')[0];
            if (!acc[date])
                acc[date] = 0;
            acc[date] += Number(p.amount);
            return acc;
        }, {});
        return Object.entries(trends).map(([date, total]) => ({
            date,
            total
        }));
    }
    async getInventoryValuation(branchId) {
        const inventory = await this.prisma.client.inventory.findMany({
            where: branchId ? { branchId } : {},
            select: { quantity: true, costPrice: true }
        });
        const totalValue = inventory.reduce((sum, item) => {
            return sum + (item.quantity * Number(item.costPrice));
        }, 0);
        return { totalValue };
    }
    async getProfitAnalysis(branchId, startDate, endDate) {
        var _a;
        const sales = await this.prisma.client.sale.aggregate({
            where: Object.assign(Object.assign({}, (branchId ? { branchId } : {})), { createdAt: { gte: startDate, lte: endDate } }),
            _sum: { total: true }
        });
        const revenue = Number(sales._sum.total || 0);
        let cogs = 0;
        try {
            const start = startDate || new Date(0);
            const end = endDate || new Date();
            const result = await this.prisma.client.$queryRaw `
              SELECT SUM(cost_price * ABS(quantity_change)) as cogs
              FROM inventory_ledger
              WHERE type = 'SALE'
              AND (${branchId} IS NULL OR branch_id = ${branchId})
              AND created_at >= ${start}
              AND created_at <= ${end}
          `;
            cogs = Number(((_a = result[0]) === null || _a === void 0 ? void 0 : _a.cogs) || 0);
        }
        catch (e) {
            console.error("Error calculating COGS", e);
        }
        return {
            revenue,
            cogs,
            profit: revenue - cogs,
            margin: revenue > 0 ? ((revenue - cogs) / revenue) * 100 : 0
        };
    }
    async getVatReport(branchId, startDate, endDate) {
        const invoices = await this.prisma.client.invoice.aggregate({
            where: Object.assign(Object.assign({}, (branchId ? { sale: { branchId } } : {})), { createdAt: { gte: startDate, lte: endDate } }),
            _sum: {
                subtotal: true,
                tax: true,
                amount: true
            }
        });
        return {
            subtotal: Number(invoices._sum.subtotal || 0),
            tax: Number(invoices._sum.tax || 0),
            total: Number(invoices._sum.amount || 0)
        };
    }
    async getCustomerAging(branchId) {
        const unpaidInvoices = await this.prisma.client.invoice.findMany({
            where: Object.assign({ status: 'UNPAID' }, (branchId ? { sale: { branchId } } : {})),
            include: {
                sale: {
                    select: {
                        customer: { select: { id: true, name: true } }
                    }
                }
            }
        });
        const buckets = {
            '0-30': [],
            '31-60': [],
            '61-90': [],
            '90+': []
        };
        const now = new Date();
        for (const inv of unpaidInvoices) {
            if (!inv.sale.customer)
                continue;
            const ageInDays = Math.floor((now.getTime() - new Date(inv.createdAt).getTime()) / (1000 * 3600 * 24));
            const item = {
                invoiceNumber: inv.invoiceNumber,
                customerName: inv.sale.customer.name,
                amount: inv.amount,
                age: ageInDays,
                date: inv.createdAt
            };
            if (ageInDays <= 30)
                buckets['0-30'].push(item);
            else if (ageInDays <= 60)
                buckets['31-60'].push(item);
            else if (ageInDays <= 90)
                buckets['61-90'].push(item);
            else
                buckets['90+'].push(item);
        }
        return buckets;
    }
    async getSupplierAging(branchId) {
        const payables = await this.prisma.client.purchaseOrder.findMany({
            where: Object.assign(Object.assign({ status: 'RECEIVED' }, (branchId ? { branchId } : {})), { supplierId: { not: null } }),
            include: { supplier: true }
        });
        const buckets = {
            '0-30': [],
            '31-60': [],
            '61-90': [],
            '90+': []
        };
        const now = new Date();
        for (const po of payables) {
            if (!po.supplier)
                continue;
            const ageInDays = Math.floor((now.getTime() - new Date(po.updatedAt).getTime()) / (1000 * 3600 * 24));
            const item = {
                poId: po.id,
                supplierName: po.supplier.name,
                amount: po.totalCost,
                age: ageInDays,
                date: po.updatedAt
            };
            if (ageInDays <= 30)
                buckets['0-30'].push(item);
            else if (ageInDays <= 60)
                buckets['31-60'].push(item);
            else if (ageInDays <= 90)
                buckets['61-90'].push(item);
            else
                buckets['90+'].push(item);
        }
        return buckets;
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_aware_prisma_service_1.TenantAwarePrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map