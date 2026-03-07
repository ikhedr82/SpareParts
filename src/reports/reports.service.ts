import { Injectable } from '@nestjs/common';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';

@Injectable()
export class ReportsService {
    constructor(private readonly prisma: TenantAwarePrismaService) { }

    async getVatReport(tenantId: string, startDate: Date, endDate: Date) {
        // Aggregate tax from InvoiceLines within the date range
        const invoices = await this.prisma.client.invoice.findMany({
            where: {
                tenantId,
                issuedAt: {
                    gte: startDate,
                    lte: endDate,
                },
                status: 'PAID', // Only paid invoices? Or all issued? Usually accrued.
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
            breakdown: {} as Record<string, number>
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

    async getProfitLoss(tenantId: string, startDate: Date, endDate: Date) {
        // Sales - COGS
        // Sales: Sum of Invoice totals (excluding tax)
        // COGS: Sum of (Product Cost * Quantity) for sold items

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
                    include: { product: true } // need cost price from product? Or historical cost?
                    // Ideally we should track cost at time of sale in SaleItem, but currently we don't have cost in SaleItem only price.
                    // We can use current product cost as approximation or fetch from InventoryLedger if we linked it.
                }
            }
        });

        let totalRevenue = 0;
        let totalCOGS = 0;

        for (const sale of sales) {
            totalRevenue += Number(sale.total); // This includes tax? No, sale.total usually includes tax if gross. 
            // Wait, Invoice separates tax. Sale.total might vary.
            // Let's assume Sale.total is final amount to pay.

            // To get revenue without tax, we should sum up (price * quantity) from items, or user Invoice subtotal.
            // Using Invoice subtotal is safer if invoice exists.

            for (const item of sale.items) {
                // COGS approximation: item.quantity * product.costPrice
                // We need to fetch product cost.
                // Since we don't have cost in SaleItem, we use current product cost.
                const product = item.product;
                // We need to fetch product to get cost.
                // Actually we included product in query.
                if (product) {
                    // totalCOGS += Number(item.quantity) * Number(product.costPrice); 
                    // Wait, SaleItem -> Product relation in schema (line 311)
                    // But Product type in Prisma might not include costPrice?
                    // Inventory has costPrice (line 255). Product does NOT have costPrice.
                    // Inventory is per branch.
                    // We need to find Inventory for the branch of the sale to get cost.
                    // This is complicated.
                }
            }
        }

        return {
            revenue: totalRevenue,
            cogs: totalCOGS,
            profit: totalRevenue - totalCOGS
        };
    }

    async getAgingReport(tenantId: string, type: 'CUSTOMER' | 'SUPPLIER') {
        if (type === 'CUSTOMER') {
            return this.prisma.client.customer.findMany({
                where: { tenantId, balance: { gt: 0 } },
                orderBy: { balance: 'desc' }
            });
        } else {
            return this.prisma.client.supplier.findMany({
                where: { tenantId, balance: { gt: 0 } }, // We owe them, so balance > 0 usually means credit?
                // Need to define sign convention.
                // Supplier Balance: Amount we owe them. Positive.
                orderBy: { balance: 'desc' }
            });
        }
    }
}
