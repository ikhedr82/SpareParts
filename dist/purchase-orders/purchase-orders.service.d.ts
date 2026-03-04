import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { InventoryLedgerService } from '../inventory/inventory-ledger.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { AccountingService } from '../accounting/accounting.service';
import { AuditService } from '../shared/audit.service';
import { TranslationService } from '../i18n/translation.service';
import { PlanEnforcementService } from '../tenant-admin/plan-enforcement.service';
export declare class PurchaseOrdersService {
    private readonly prisma;
    private readonly inventoryLedgerService;
    private readonly accountingService;
    private readonly auditService;
    private readonly t;
    private readonly planEnforcement;
    private readonly request;
    constructor(prisma: TenantAwarePrismaService, inventoryLedgerService: InventoryLedgerService, accountingService: AccountingService, auditService: AuditService, t: TranslationService, planEnforcement: PlanEnforcementService, request: any);
    create(userId: string, dto: CreatePurchaseOrderDto): Promise<{
        items: {
            id: string;
            createdAt: Date;
            productId: string;
            quantity: number;
            purchaseOrderId: string;
            unitCost: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
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
    }>;
    findAll(tenantId: string, branchId?: string): Promise<({
        items: {
            id: string;
            createdAt: Date;
            productId: string;
            quantity: number;
            purchaseOrderId: string;
            unitCost: import("@prisma/client/runtime/library").Decimal;
        }[];
        createdBy: {
            id: string;
            tenantId: string | null;
            createdAt: Date;
            email: string;
            passwordHash: string;
            isPlatformUser: boolean;
            status: string;
            updatedAt: Date;
            version: number;
        };
    } & {
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
    })[]>;
    findOne(id: string, tenantId: string): Promise<{
        receipts: ({
            items: {
                id: string;
                productId: string;
                quantity: number;
                receiptId: string;
                acceptedUnitCost: import("@prisma/client/runtime/library").Decimal;
            }[];
        } & {
            id: string;
            tenantId: string;
            notes: string | null;
            purchaseOrderId: string;
            receivedAt: Date;
            receivedById: string;
            receiptNumber: string;
        })[];
        supplier: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            version: number;
            name: string;
            nameAr: string | null;
            balance: import("@prisma/client/runtime/library").Decimal;
        };
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
            purchaseOrderId: string;
            unitCost: import("@prisma/client/runtime/library").Decimal;
        })[];
        createdBy: {
            id: string;
            tenantId: string | null;
            createdAt: Date;
            email: string;
            passwordHash: string;
            isPlatformUser: boolean;
            status: string;
            updatedAt: Date;
            version: number;
        };
    } & {
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
    }>;
    receive(userId: string, id: string, items: {
        productId: string;
        quantity: number;
    }[], freightCost?: number): Promise<{
        items: {
            id: string;
            productId: string;
            quantity: number;
            receiptId: string;
            acceptedUnitCost: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        tenantId: string;
        notes: string | null;
        purchaseOrderId: string;
        receivedAt: Date;
        receivedById: string;
        receiptNumber: string;
    }>;
}
