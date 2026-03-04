import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
export declare class PurchaseOrdersController {
    private readonly purchaseOrdersService;
    constructor(purchaseOrdersService: PurchaseOrdersService);
    create(dto: CreatePurchaseOrderDto, req: any): Promise<{
        items: {
            id: string;
            createdAt: Date;
            productId: string;
            quantity: number;
            purchaseOrderId: string;
            unitCost: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
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
        supplierName: string;
        totalCost: import("@prisma/client/runtime/library").Decimal;
        supplierId: string | null;
    }>;
    findAll(req: any): Promise<({
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
            createdAt: Date;
            updatedAt: Date;
            tenantId: string | null;
            status: string;
            email: string;
            passwordHash: string;
            isPlatformUser: boolean;
            version: number;
        };
    } & {
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
        supplierName: string;
        totalCost: import("@prisma/client/runtime/library").Decimal;
        supplierId: string | null;
    })[]>;
    findOne(id: string, req: any): Promise<{
        supplier: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            nameAr: string | null;
            tenantId: string;
            version: number;
            balance: import("@prisma/client/runtime/library").Decimal;
        };
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
            receiptNumber: string;
            purchaseOrderId: string;
            receivedAt: Date;
            receivedById: string;
        })[];
        items: ({
            product: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                nameAr: string | null;
                status: string;
                description: string | null;
                descriptionAr: string | null;
                brandId: string;
                categoryId: string;
                weight: number | null;
                dimensions: string | null;
                taxRateId: string | null;
                images: string[];
                unitOfMeasure: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            tenantId: string | null;
            status: string;
            email: string;
            passwordHash: string;
            isPlatformUser: boolean;
            version: number;
        };
    } & {
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
        supplierName: string;
        totalCost: import("@prisma/client/runtime/library").Decimal;
        supplierId: string | null;
    }>;
    receive(id: string, body: {
        items: {
            productId: string;
            quantity: number;
        }[];
        freightCost?: number;
    }, req: any): Promise<{
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
        receiptNumber: string;
        purchaseOrderId: string;
        receivedAt: Date;
        receivedById: string;
    }>;
}
