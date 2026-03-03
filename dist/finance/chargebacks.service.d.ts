import { PrismaService } from '../prisma/prisma.service';
export declare class ChargebacksService {
    private prisma;
    constructor(prisma: PrismaService);
    processChargeback(tenantId: string, orderId: string, amount: number, reason: string, returnId?: string, deliveryExceptionId?: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.ChargebackStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        orderId: string;
        reason: string;
        returnId: string | null;
        deliveryExceptionId: string | null;
        resolvedAt: Date | null;
    }>;
}
