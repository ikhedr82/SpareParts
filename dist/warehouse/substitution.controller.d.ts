import { SubstitutionService } from './substitution.service';
export declare class SubstitutionController {
    private readonly service;
    constructor(service: SubstitutionService);
    suggest(pickListId: string, itemId: string, body: {
        substituteProductId: string;
        reason: string;
    }, req: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.SubstitutionStatus;
        version: number;
        reason: string | null;
        originalProductId: string;
        respondedAt: Date | null;
        substituteProductId: string;
        approvedBy: string | null;
        requestedBy: string;
        pickListItemId: string;
        priceDelta: import("@prisma/client/runtime/library").Decimal;
    }>;
    approve(id: string, req: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.SubstitutionStatus;
        version: number;
        reason: string | null;
        originalProductId: string;
        respondedAt: Date | null;
        substituteProductId: string;
        approvedBy: string | null;
        requestedBy: string;
        pickListItemId: string;
        priceDelta: import("@prisma/client/runtime/library").Decimal;
    }>;
    reject(id: string, req: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.SubstitutionStatus;
        version: number;
        reason: string | null;
        originalProductId: string;
        respondedAt: Date | null;
        substituteProductId: string;
        approvedBy: string | null;
        requestedBy: string;
        pickListItemId: string;
        priceDelta: import("@prisma/client/runtime/library").Decimal;
    }>;
    findByPickList(pickListId: string, req: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.SubstitutionStatus;
        version: number;
        reason: string | null;
        originalProductId: string;
        respondedAt: Date | null;
        substituteProductId: string;
        approvedBy: string | null;
        requestedBy: string;
        pickListItemId: string;
        priceDelta: import("@prisma/client/runtime/library").Decimal;
    }[]>;
}
