import { ChargebackResolutionService } from './chargeback-resolution.service';
export declare class ChargebackResolutionController {
    private readonly service;
    constructor(service: ChargebackResolutionService);
    findAll(req: any, status?: any): Promise<{
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
    }[]>;
    resolve(id: string, body: {
        notes?: string;
    }, req: any): Promise<{
        chargeback: {
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
        };
        resolution: {
            id: string;
            createdAt: Date;
            tenantId: string;
            notes: string | null;
            action: string;
            chargebackId: string;
            resolvedById: string;
            ledgerEntryId: string | null;
        };
    }>;
    reject(id: string, body: {
        notes?: string;
    }, req: any): Promise<{
        chargeback: {
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
        };
        resolution: {
            id: string;
            createdAt: Date;
            tenantId: string;
            notes: string | null;
            action: string;
            chargebackId: string;
            resolvedById: string;
            ledgerEntryId: string | null;
        };
    }>;
}
