import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
export declare class SuppliersService {
    private readonly prisma;
    constructor(prisma: TenantAwarePrismaService);
    create(dto: CreateSupplierDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        tenantId: string;
        version: number;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        tenantId: string;
        version: number;
        balance: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    findOne(id: string): Promise<{
        purchaseOrders: {
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
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        tenantId: string;
        version: number;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: string, dto: CreateSupplierDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        tenantId: string;
        version: number;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        tenantId: string;
        version: number;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
    importPriceList(supplierId: string, items: {
        productId: string;
        sku: string;
        cost: number;
        currency?: string;
    }[]): Promise<any[]>;
    getProductSuppliers(productId: string): Promise<({
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
    } & {
        currency: string;
        id: string;
        tenantId: string;
        productId: string;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        supplierId: string;
        supplierSku: string | null;
        isPreferred: boolean;
    })[]>;
}
