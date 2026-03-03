import { PurchaseReturnsService } from './purchase-returns.service';
import { CreatePurchaseReturnDto } from './dtos/create-return.dto';
import { RejectReturnDto } from './dtos/reject-return.dto';
export declare class PurchaseReturnsController {
    private readonly service;
    constructor(service: PurchaseReturnsService);
    findAll(req: any): Promise<({
        purchaseOrder: {
            id: string;
        };
        items: {
            id: string;
            createdAt: Date;
            productId: string;
            quantity: number;
            reason: string | null;
            purchaseReturnId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.PurchaseReturnStatus;
        version: number;
        reason: string | null;
        createdById: string;
        purchaseOrderId: string;
        rejectionReason: string | null;
        totalValue: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findOne(req: any, id: string): Promise<{
        purchaseOrder: {
            currency: string;
            exchangeRate: import("@prisma/client/runtime/library").Decimal;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            status: import(".prisma/client").$Enums.PurchaseOrderStatus;
            version: number;
            branchId: string;
            baseAmount: import("@prisma/client/runtime/library").Decimal;
            createdById: string;
            supplierId: string | null;
            supplierName: string;
            totalCost: import("@prisma/client/runtime/library").Decimal;
        };
        items: ({
            product: {
                id: string;
                name: string;
                nameAr: string | null;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                description: string | null;
                descriptionAr: string | null;
                brandId: string;
                categoryId: string;
                weight: number | null;
                dimensions: string | null;
                unitOfMeasure: string | null;
                images: string[];
                taxRateId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            productId: string;
            quantity: number;
            reason: string | null;
            purchaseReturnId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.PurchaseReturnStatus;
        version: number;
        reason: string | null;
        createdById: string;
        purchaseOrderId: string;
        rejectionReason: string | null;
        totalValue: import("@prisma/client/runtime/library").Decimal;
    }>;
    createReturn(req: any, dto: CreatePurchaseReturnDto): Promise<{
        items: {
            id: string;
            createdAt: Date;
            productId: string;
            quantity: number;
            reason: string | null;
            purchaseReturnId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.PurchaseReturnStatus;
        version: number;
        reason: string | null;
        createdById: string;
        purchaseOrderId: string;
        rejectionReason: string | null;
        totalValue: import("@prisma/client/runtime/library").Decimal;
    }>;
    approveReturn(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.PurchaseReturnStatus;
        version: number;
        reason: string | null;
        createdById: string;
        purchaseOrderId: string;
        rejectionReason: string | null;
        totalValue: import("@prisma/client/runtime/library").Decimal;
    }>;
    rejectReturn(req: any, id: string, dto: RejectReturnDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.PurchaseReturnStatus;
        version: number;
        reason: string | null;
        createdById: string;
        purchaseOrderId: string;
        rejectionReason: string | null;
        totalValue: import("@prisma/client/runtime/library").Decimal;
    }>;
    shipReturn(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.PurchaseReturnStatus;
        version: number;
        reason: string | null;
        createdById: string;
        purchaseOrderId: string;
        rejectionReason: string | null;
        totalValue: import("@prisma/client/runtime/library").Decimal;
    }>;
    completeReturn(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.PurchaseReturnStatus;
        version: number;
        reason: string | null;
        createdById: string;
        purchaseOrderId: string;
        rejectionReason: string | null;
        totalValue: import("@prisma/client/runtime/library").Decimal;
    }>;
}
