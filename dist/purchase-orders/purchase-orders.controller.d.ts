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
    findOne(id: string, req: any): Promise<{
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
        purchaseOrderId: string;
        receivedAt: Date;
        receivedById: string;
        receiptNumber: string;
    }>;
}
