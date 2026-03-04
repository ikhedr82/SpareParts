import { ChargebackResolutionService } from './chargeback-resolution.service';
export declare class ChargebackResolutionController {
    private readonly service;
    constructor(service: ChargebackResolutionService);
    findAll(req: any, status?: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ChargebackStatus;
        orderId: string;
        deliveryExceptionId: string | null;
        returnId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        reason: string;
        resolvedAt: Date | null;
    }[]>;
    resolve(id: string, body: {
        notes?: string;
    }, req: any): Promise<{
        chargeback: {
            id: string;
            tenantId: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.ChargebackStatus;
            orderId: string;
            deliveryExceptionId: string | null;
            returnId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            reason: string;
            resolvedAt: Date | null;
        };
        resolution: {
            id: string;
            tenantId: string;
            action: string;
            createdAt: Date;
            notes: string | null;
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
            tenantId: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.ChargebackStatus;
            orderId: string;
            deliveryExceptionId: string | null;
            returnId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            reason: string;
            resolvedAt: Date | null;
        };
        resolution: {
            id: string;
            tenantId: string;
            action: string;
            createdAt: Date;
            notes: string | null;
            chargebackId: string;
            resolvedById: string;
            ledgerEntryId: string | null;
        };
    }>;
}
