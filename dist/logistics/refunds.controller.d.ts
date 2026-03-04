import { RefundsService } from './refunds.service';
import { CreateRefundDto } from './dto/exceptions.dto';
export declare class RefundsController {
    private readonly service;
    constructor(service: RefundsService);
    createRefund(req: any, dto: CreateRefundDto): Promise<{
        currency: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.RefundStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        version: number;
        branchId: string;
        orderId: string | null;
        cashSessionId: string | null;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
        saleId: string | null;
        reason: string;
        cancelledAt: Date | null;
        processedAt: Date | null;
        refundNumber: string;
        returnId: string | null;
        cancelledById: string | null;
        createdById: string;
        deliveryExceptionId: string | null;
        processedById: string | null;
    }>;
    processRefund(req: any, id: string): Promise<{
        currency: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.RefundStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        version: number;
        branchId: string;
        orderId: string | null;
        cashSessionId: string | null;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
        saleId: string | null;
        reason: string;
        cancelledAt: Date | null;
        processedAt: Date | null;
        refundNumber: string;
        returnId: string | null;
        cancelledById: string | null;
        createdById: string;
        deliveryExceptionId: string | null;
        processedById: string | null;
    }>;
    findAll(req: any, status?: string, orderId?: string): Promise<({
        order: {
            orderNumber: string;
        };
        return: {
            returnNumber: string;
        };
    } & {
        currency: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.RefundStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        version: number;
        branchId: string;
        orderId: string | null;
        cashSessionId: string | null;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
        saleId: string | null;
        reason: string;
        cancelledAt: Date | null;
        processedAt: Date | null;
        refundNumber: string;
        returnId: string | null;
        cancelledById: string | null;
        createdById: string;
        deliveryExceptionId: string | null;
        processedById: string | null;
    })[]>;
}
