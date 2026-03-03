import { Prisma } from '@prisma/client';
export declare class OutboxService {
    private readonly logger;
    schedule(tx: Prisma.TransactionClient, data: {
        tenantId: string;
        topic: string;
        payload: any;
        correlationId?: string;
    }): Promise<{
        error: string | null;
        id: string;
        createdAt: Date;
        tenantId: string;
        status: string;
        processedAt: Date | null;
        correlationId: string | null;
        topic: string;
        payload: Prisma.JsonValue;
    }>;
}
