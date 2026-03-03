import { PrismaService } from '../prisma/prisma.service';
export declare class UsageTrackingService {
    private prisma;
    constructor(prisma: PrismaService);
    recordMetric(tenantId: string, metricType: string, value: number): Promise<{
        id: string;
        tenantId: string;
        metricType: string;
        value: number;
        timestamp: Date;
    }>;
    getUsage(tenantId: string): Promise<{
        users: number;
        branches: number;
        products: number;
        orders: number;
    }>;
    trackAllMetrics(tenantId: string): Promise<void>;
}
