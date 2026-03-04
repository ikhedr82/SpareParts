import { PurchaseReturnsService } from './purchase-returns.service';
import { CreatePurchaseReturnDto } from './dtos/create-return.dto';
import { RejectReturnDto } from './dtos/reject-return.dto';
export declare class PurchaseReturnsController {
    private readonly service;
    constructor(service: PurchaseReturnsService);
    findAll(req: any): Promise<({
        items: {
            id: string;
            createdAt: Date;
            productId: string;
            quantity: number;
            reason: string | null;
            purchaseReturnId: string;
        }[];
        purchaseOrder: {
            id: string;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.PurchaseReturnStatus;
        updatedAt: Date;
        version: number;
        createdById: string;
        purchaseOrderId: string;
        rejectionReason: string | null;
        reason: string | null;
        totalValue: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findOne(req: any, id: string): Promise<{
        items: ({
            product: {
                id: string;
                createdAt: Date;
                status: string;
                updatedAt: Date;
                name: string;
                weight: number | null;
                brandId: string;
                categoryId: string;
                description: string | null;
                dimensions: string | null;
                taxRateId: string | null;
                images: string[];
                unitOfMeasure: string | null;
                descriptionAr: string | null;
                nameAr: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            productId: string;
            quantity: number;
            reason: string | null;
            purchaseReturnId: string;
        })[];
        purchaseOrder: {
            id: string;
            tenantId: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.PurchaseOrderStatus;
            updatedAt: Date;
            version: number;
            branchId: string;
            supplierId: string | null;
            currency: string;
            exchangeRate: import("@prisma/client/runtime/library").Decimal;
            createdById: string;
            baseAmount: import("@prisma/client/runtime/library").Decimal;
            supplierName: string;
            totalCost: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.PurchaseReturnStatus;
        updatedAt: Date;
        version: number;
        createdById: string;
        purchaseOrderId: string;
        rejectionReason: string | null;
        reason: string | null;
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
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.PurchaseReturnStatus;
        updatedAt: Date;
        version: number;
        createdById: string;
        purchaseOrderId: string;
        rejectionReason: string | null;
        reason: string | null;
        totalValue: import("@prisma/client/runtime/library").Decimal;
    }>;
    approveReturn(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.PurchaseReturnStatus;
        updatedAt: Date;
        version: number;
        createdById: string;
        purchaseOrderId: string;
        rejectionReason: string | null;
        reason: string | null;
        totalValue: import("@prisma/client/runtime/library").Decimal;
    }>;
    rejectReturn(req: any, id: string, dto: RejectReturnDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.PurchaseReturnStatus;
        updatedAt: Date;
        version: number;
        createdById: string;
        purchaseOrderId: string;
        rejectionReason: string | null;
        reason: string | null;
        totalValue: import("@prisma/client/runtime/library").Decimal;
    }>;
    shipReturn(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.PurchaseReturnStatus;
        updatedAt: Date;
        version: number;
        createdById: string;
        purchaseOrderId: string;
        rejectionReason: string | null;
        reason: string | null;
        totalValue: import("@prisma/client/runtime/library").Decimal;
    }>;
    completeReturn(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.PurchaseReturnStatus;
        updatedAt: Date;
        version: number;
        createdById: string;
        purchaseOrderId: string;
        rejectionReason: string | null;
        reason: string | null;
        totalValue: import("@prisma/client/runtime/library").Decimal;
    }>;
}
