import { PacksService } from './packs.service';
import { AddPackItemDto, SealPackDto } from './dto/warehouse.dto';
export declare class PacksController {
    private readonly packsService;
    constructor(packsService: PacksService);
    createPack(pickListId: string): Promise<{
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
            packId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.PackStatus;
        weight: import("@prisma/client/runtime/library").Decimal | null;
        pickListId: string;
        packNumber: string;
        packedAt: Date;
        deviceInfo: string | null;
    }>;
    addItem(packId: string, dto: AddPackItemDto): Promise<{
        pickList: {
            order: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                status: import(".prisma/client").$Enums.OrderStatus;
                version: number;
                branchId: string;
                notes: string | null;
                total: import("@prisma/client/runtime/library").Decimal;
                businessClientId: string;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                tax: import("@prisma/client/runtime/library").Decimal;
                cancelledAt: Date | null;
                returnId: string | null;
                createdById: string | null;
                deliveryExceptionId: string | null;
                orderNumber: string;
                deliveryAddressId: string | null;
                contactId: string | null;
                internalNotes: string | null;
                confirmedAt: Date | null;
                shippedAt: Date | null;
                deliveredAt: Date | null;
                sourceQuoteId: string | null;
            };
            items: {
                id: string;
                createdAt: Date;
                status: import(".prisma/client").$Enums.PickListItemStatus;
                productId: string;
                binLocation: string | null;
                pickListId: string;
                inventoryId: string;
                requiredQty: number;
                pickedQty: number;
            }[];
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
        };
        items: ({
            product: {
                brand: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    nameAr: string | null;
                    country: string | null;
                    isOem: boolean;
                };
                category: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    nameAr: string | null;
                    parentId: string | null;
                };
            } & {
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
            packId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.PackStatus;
        weight: import("@prisma/client/runtime/library").Decimal | null;
        pickListId: string;
        packNumber: string;
        packedAt: Date;
        deviceInfo: string | null;
    }>;
    seal(packId: string, dto: SealPackDto): Promise<{
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
            packId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.PackStatus;
        weight: import("@prisma/client/runtime/library").Decimal | null;
        pickListId: string;
        packNumber: string;
        packedAt: Date;
        deviceInfo: string | null;
    }>;
    findByPickList(pickListId: string): Promise<({
        items: ({
            product: {
                brand: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    nameAr: string | null;
                    country: string | null;
                    isOem: boolean;
                };
                category: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    nameAr: string | null;
                    parentId: string | null;
                };
            } & {
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
            packId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.PackStatus;
        weight: import("@prisma/client/runtime/library").Decimal | null;
        pickListId: string;
        packNumber: string;
        packedAt: Date;
        deviceInfo: string | null;
    })[]>;
}
