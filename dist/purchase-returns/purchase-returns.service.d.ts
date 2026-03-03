import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
import { CreatePurchaseReturnDto } from './dtos/create-return.dto';
import { TranslationService } from '../i18n/translation.service';
export declare class PurchaseReturnsService {
    private prisma;
    private auditService;
    private outbox;
    private t;
    constructor(prisma: PrismaService, auditService: AuditService, outbox: OutboxService, t: TranslationService);
    createReturn(tenantId: string, userId: string, dto: CreatePurchaseReturnDto): Promise<{
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
    approveReturn(tenantId: string, userId: string, returnId: string): Promise<{
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
    rejectReturn(tenantId: string, userId: string, returnId: string, reason: string): Promise<{
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
    shipReturn(tenantId: string, userId: string, returnId: string): Promise<{
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
    completeReturn(tenantId: string, userId: string, returnId: string): Promise<{
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
    findOne(tenantId: string, returnId: string): Promise<{
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
    findAll(tenantId: string): Promise<({
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
}
