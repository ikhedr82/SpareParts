import { PrismaService } from '../prisma/prisma.service';
export declare class WarehouseMobileController {
    private prisma;
    constructor(prisma: PrismaService);
    getTasks(req: any): Promise<({
        order: {
            branchId: string;
            orderNumber: string;
        };
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
            status: import(".prisma/client").$Enums.PickListItemStatus;
            productId: string;
            binLocation: string | null;
            pickListId: string;
            inventoryId: string;
            requiredQty: number;
            pickedQty: number;
        })[];
    } & {
        id: string;
        createdAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.PickListStatus;
        version: number;
        branchId: string;
        orderId: string;
        startedAt: Date | null;
        completedAt: Date | null;
        assignedToId: string | null;
    })[]>;
    scanItem(req: any, body: {
        pickListId: string;
        productId: string;
        barcode: string;
        quantity: number;
    }): Promise<{
        success: boolean;
        picked: number;
        remaining: number;
    }>;
    assignTask(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.PickListStatus;
        version: number;
        branchId: string;
        orderId: string;
        startedAt: Date | null;
        completedAt: Date | null;
        assignedToId: string | null;
    }>;
}
