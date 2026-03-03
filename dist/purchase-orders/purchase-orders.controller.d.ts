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
        tenantId: string;
        branchId: string;
        updatedAt: Date;
        version: number;
        status: import(".prisma/client").$Enums.PurchaseOrderStatus;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        createdById: string;
        supplierId: string | null;
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
            createdAt: Date;
            tenantId: string | null;
            updatedAt: Date;
            version: number;
            email: string;
            passwordHash: string;
            isPlatformUser: boolean;
            status: string;
        };
    } & {
        currency: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        id: string;
        createdAt: Date;
        tenantId: string;
        branchId: string;
        updatedAt: Date;
        version: number;
        status: import(".prisma/client").$Enums.PurchaseOrderStatus;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        createdById: string;
        supplierId: string | null;
        supplierName: string;
        totalCost: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findOne(id: string, req: any): Promise<{
        supplier: {
            id: string;
            createdAt: Date;
            tenantId: string;
            updatedAt: Date;
            version: number;
            name: string;
            nameAr: string | null;
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
                createdAt: Date;
                updatedAt: Date;
                name: string;
                status: string;
                brandId: string;
                categoryId: string;
                nameAr: string | null;
                description: string | null;
                descriptionAr: string | null;
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
            purchaseOrderId: string;
            unitCost: import("@prisma/client/runtime/library").Decimal;
        })[];
        createdBy: {
            id: string;
            createdAt: Date;
            tenantId: string | null;
            updatedAt: Date;
            version: number;
            email: string;
            passwordHash: string;
            isPlatformUser: boolean;
            status: string;
        };
    } & {
        currency: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        id: string;
        createdAt: Date;
        tenantId: string;
        branchId: string;
        updatedAt: Date;
        version: number;
        status: import(".prisma/client").$Enums.PurchaseOrderStatus;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        createdById: string;
        supplierId: string | null;
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
        receiptNumber: string;
        purchaseOrderId: string;
        receivedAt: Date;
        receivedById: string;
    }>;
}
