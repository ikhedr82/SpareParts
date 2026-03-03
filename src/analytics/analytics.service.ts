import { Injectable } from '@nestjs/common';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: TenantAwarePrismaService) { }

  async getDashboardKPIs(branchId?: string) {
    const whereClause: any = {};
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
    const profit = revenue; // Note: Cost price is missing in schema, so profit = revenue for now.

    const paymentBreakdown = await this.prisma.client.payment.groupBy({
      by: ['method'],
      where: {
        sale: branchId ? { branchId } : {},
      },
      _sum: { amount: true },
    });

    const lowStockCount = await this.prisma.client.inventory.count({
      where: {
        ...(branchId ? { branchId } : {}),
        quantity: { lt: 10 },
      },
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

  async getSalesReports(period: 'daily' | 'weekly' | 'monthly', branchId?: string) {
    const now = new Date();
    let startDate = new Date();

    if (period === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'monthly') {
      startDate.setMonth(now.getMonth() - 1);
    }

    const sales = await this.prisma.client.sale.findMany({
      where: {
        ...(branchId ? { branchId } : {}),
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        createdAt: true,
        total: true,
      },
    });

    // Simple grouping by date
    const aggregates = sales.reduce((acc: any, sale) => {
      const date = sale.createdAt.toISOString().split('T')[0];
      if (!acc[date]) acc[date] = 0;
      acc[date] += Number(sale.total);
      return acc;
    }, {});

    return Object.entries(aggregates).map(([date, total]) => ({
      date,
      total,
    }));
  }

  async getInventoryReport(branchId?: string) {
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

    return topProducts.map((tp) => ({
      productId: tp.productId,
      name: products.find((p) => p.id === tp.productId)?.name || 'Unknown',
      quantitySold: tp._sum.quantity,
    }));
  }

  async getCashFlowReport(branchId?: string) {
    // Cash flow based on actual payments received
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

    const trends = payments.reduce((acc: any, p) => {
      const date = p.createdAt.toISOString().split('T')[0];
      if (!acc[date]) acc[date] = 0;
      acc[date] += Number(p.amount);
      return acc;
    }, {});

    return Object.entries(trends).map(([date, total]) => ({
      date,
      total
    }));
  }

  async getInventoryValuation(branchId?: string) {
    const inventory = await this.prisma.client.inventory.findMany({
      where: branchId ? { branchId } : {},
      select: { quantity: true, costPrice: true }
    });

    const totalValue = inventory.reduce((sum, item) => {
      return sum + (item.quantity * Number(item.costPrice));
    }, 0);

    return { totalValue };
  }

  async getProfitAnalysis(branchId?: string, startDate?: Date, endDate?: Date) {
    // Revenue logic
    const sales = await this.prisma.client.sale.aggregate({
      where: {
        ...(branchId ? { branchId } : {}),
        createdAt: { gte: startDate, lte: endDate }
      },
      _sum: { total: true }
    });

    const revenue = Number(sales._sum.total || 0);

    // COGS logic via Raw Query
    // Note: Cast branchId to text to handle potential NULL/undefined in SQL if not passed
    // But purely using Prisma params is safer.
    // If branchId is undefined, we want to ignore it.

    // Construct where clause for raw query manually or use Prisma.sql helper if available.
    // Simple approach:

    let cogs = 0;

    // We can use findMany and sum in app if data volume is low, but raw query is better.
    // Let's use raw query.

    try {
      // ensure dates are objects or null
      const start = startDate || new Date(0); // Epoch
      const end = endDate || new Date();

      const result: any[] = await this.prisma.client.$queryRaw`
              SELECT SUM(cost_price * ABS(quantity_change)) as cogs
              FROM inventory_ledger
              WHERE type = 'SALE'
              AND (${branchId} IS NULL OR branch_id = ${branchId})
              AND created_at >= ${start}
              AND created_at <= ${end}
          `;

      cogs = Number(result[0]?.cogs || 0);
    } catch (e) {
      console.error("Error calculating COGS", e);
      // Fallback or 0
    }

    return {
      revenue,
      cogs,
      profit: revenue - cogs,
      margin: revenue > 0 ? ((revenue - cogs) / revenue) * 100 : 0
    };
  }

  async getVatReport(branchId?: string, startDate?: Date, endDate?: Date) {
    const invoices = await this.prisma.client.invoice.aggregate({
      where: {
        ...(branchId ? { sale: { branchId } } : {}),
        createdAt: { gte: startDate, lte: endDate }
      },
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

  async getCustomerAging(branchId?: string) {
    const unpaidInvoices = await this.prisma.client.invoice.findMany({
      where: {
        status: 'UNPAID',
        ...(branchId ? { sale: { branchId } } : {})
      },
      include: {
        sale: {
          select: {
            customer: { select: { id: true, name: true } }
          }
        }
      }
    });

    // Bucket: 0-30, 31-60, 61-90, 90+
    const buckets = {
      '0-30': [],
      '31-60': [],
      '61-90': [],
      '90+': []
    };

    const now = new Date();

    for (const inv of unpaidInvoices) {
      if (!inv.sale.customer) continue;

      const ageInDays = Math.floor((now.getTime() - new Date(inv.createdAt).getTime()) / (1000 * 3600 * 24));
      const item = {
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.sale.customer.name,
        amount: inv.amount,
        age: ageInDays,
        date: inv.createdAt
      };

      if (ageInDays <= 30) buckets['0-30'].push(item);
      else if (ageInDays <= 60) buckets['31-60'].push(item);
      else if (ageInDays <= 90) buckets['61-90'].push(item);
      else buckets['90+'].push(item);
    }

    return buckets;
  }

  async getSupplierAging(branchId?: string) {
    // Based on RECEIVED Purchase Orders (Assuming they are unpaid for this report, creating a list of payables)
    const payables = await this.prisma.client.purchaseOrder.findMany({
      where: {
        status: 'RECEIVED',
        ...(branchId ? { branchId } : {}),
        supplierId: { not: null } // Only linked suppliers
      },
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
      if (!po.supplier) continue;

      const ageInDays = Math.floor((now.getTime() - new Date(po.updatedAt).getTime()) / (1000 * 3600 * 24)); // Using updatedAt as received date approx
      const item = {
        poId: po.id,
        supplierName: po.supplier.name,
        amount: po.totalCost,
        age: ageInDays,
        date: po.updatedAt
      };

      if (ageInDays <= 30) buckets['0-30'].push(item);
      else if (ageInDays <= 60) buckets['31-60'].push(item);
      else if (ageInDays <= 90) buckets['61-90'].push(item);
      else buckets['90+'].push(item);
    }

    return buckets;
  }
}
