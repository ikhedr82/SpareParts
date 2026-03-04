import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
import { TranslationService } from '../i18n/translation.service';
import { PickItemDto } from './dtos/pick-item.dto';
export declare class WarehouseService {
    private prisma;
    private auditService;
    private outbox;
    private t;
    constructor(prisma: PrismaService, auditService: AuditService, outbox: OutboxService, t: TranslationService);
    pickItem(tenantId: string, userId: string, pickListId: string, itemId: string, dto: PickItemDto): Promise<{
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
