import { WarehouseService } from './warehouse.service';
import { PickItemDto } from './dtos/pick-item.dto';
export declare class WarehouseController {
    private readonly service;
    constructor(service: WarehouseService);
    pickItem(req: any, pickListId: string, itemId: string, dto: PickItemDto): Promise<{
        pickListStatus: string;
        item: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.PickListItemStatus;
            pickListId: string;
            productId: string;
            binLocation: string | null;
            inventoryId: string;
            requiredQty: number;
            pickedQty: number;
        };
    }>;
}
