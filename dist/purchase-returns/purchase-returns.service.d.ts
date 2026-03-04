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
    approveReturn(tenantId: string, userId: string, returnId: string): Promise<{
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
    rejectReturn(tenantId: string, userId: string, returnId: string, reason: string): Promise<{
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
    shipReturn(tenantId: string, userId: string, returnId: string): Promise<{
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
    completeReturn(tenantId: string, userId: string, returnId: string): Promise<{
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
    findOne(tenantId: string, returnId: string): Promise<{
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
    findAll(tenantId: string): Promise<({
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
}
