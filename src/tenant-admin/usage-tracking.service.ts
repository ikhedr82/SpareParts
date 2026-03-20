import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsageTrackingService {
    constructor(private prisma: PrismaService) { }

    async recordMetric(tenantId: string, metricType: string, value: number) {
        return this.prisma.usageMetric.create({
            data: {
                tenantId,
                metricType,
                value,
            },
        });
    }

    async getUsage(tenantId: string) {
        // Fetch counts for core entities
        const [users, branches, products, orders] = await Promise.all([
            this.prisma.user.count({ where: { tenantId } }),
            this.prisma.branch.count({ where: { tenantId } }),
            this.prisma.inventory.groupBy({
                by: ['productId'],
                where: { tenantId }
            }).then(res => res.length),
            this.prisma.order.count({ where: { tenantId } }),
        ]);

        return {
            users,
            branches,
            products,
            orders,
        };
    }

    async trackAllMetrics(tenantId: string) {
        const usage = await this.getUsage(tenantId);
        await Promise.all([
            this.recordMetric(tenantId, 'USERS', usage.users),
            this.recordMetric(tenantId, 'BRANCHES', usage.branches),
            this.recordMetric(tenantId, 'PRODUCTS', usage.products),
            this.recordMetric(tenantId, 'ORDERS', usage.orders),
        ]);
    }

    async checkLimit(tenantId: string, limitKey: string): Promise<boolean> {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { plan: true },
        });

        if (!tenant || !tenant.plan) return true;

        const limits = tenant.plan.limits as any;
        const limitValue = limits?.[limitKey];

        if (limitValue === undefined || limitValue === null) return true;

        const usage = await this.getUsage(tenantId);
        const usageMap: Record<string, number> = {
            maxUsers: usage.users,
            maxBranches: usage.branches,
            maxProducts: usage.products,
            maxOrdersPerMonth: usage.orders,
        };

        return (usageMap[limitKey] || 0) < limitValue;
    }
}
