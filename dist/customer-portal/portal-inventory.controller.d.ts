import { PrismaService } from '../prisma/prisma.service';
import { InventorySafetyService } from '../warehouse/inventory-safety.service';
export declare class PortalInventoryController {
    private prisma;
    private inventorySafety;
    constructor(prisma: PrismaService, inventorySafety: InventorySafetyService);
    search(req: any, query: string, categoryId: string): Promise<{
        id: string;
        name: string;
        description: string;
        brand: string;
        category: string;
        sku: string;
        price: number | import("@prisma/client/runtime/library").Decimal;
        available: number;
        unitOfMeasure: string;
        images: string[];
    }[]>;
}
