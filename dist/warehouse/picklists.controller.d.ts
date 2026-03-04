import { PickListsService } from './picklists.service';
import { PickItemDto } from './dto/warehouse.dto';
export declare class PickListsController {
    private readonly pickListsService;
    constructor(pickListsService: PickListsService);
    findAll(req: any, branchId?: string, status?: string): Promise<({
        _count: {
            packs: number;
            items: number;
        };
        branch: {
            id: string;
            name: string;
        };
        order: {
            id: string;
            businessClient: {
                businessName: string;
            };
            orderNumber: string;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.PickListStatus;
        version: number;
        startedAt: Date | null;
        completedAt: Date | null;
        branchId: string;
        orderId: string;
        assignedToId: string | null;
    })[]>;
    findOne(req: any, id: string): Promise<{
        branch: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string | null;
            nameAr: string | null;
            address: string | null;
            addressAr: string | null;
        };
        packs: ({
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
                packId: string;
                productId: string;
                quantity: number;
            })[];
        } & {
            id: string;
            status: import(".prisma/client").$Enums.PackStatus;
            pickListId: string;
            packNumber: string;
            weight: import("@prisma/client/runtime/library").Decimal | null;
            packedAt: Date;
            deviceInfo: string | null;
        })[];
        order: {
            businessClient: {
                id: string;
                tenantId: string;
                createdAt: Date;
                status: string;
                updatedAt: Date;
                type: import(".prisma/client").$Enums.BusinessClientType;
                currency: string;
                notes: string | null;
                businessName: string;
                registrationNumber: string | null;
                taxId: string | null;
                primaryEmail: string | null;
                primaryPhone: string | null;
                creditLimit: import("@prisma/client/runtime/library").Decimal;
                currentBalance: import("@prisma/client/runtime/library").Decimal;
                paymentTermsDays: number;
                paymentTerms: string | null;
                priceTierId: string | null;
            };
            contact: {
                id: string;
                createdAt: Date;
                email: string | null;
                updatedAt: Date;
                name: string;
                phone: string | null;
                businessClientId: string;
                position: string | null;
                isPrimary: boolean;
                canPlaceOrders: boolean;
            };
            deliveryAddress: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                type: string;
                businessClientId: string;
                country: string;
                isPrimary: boolean;
                addressLine1: string;
                addressLine2: string | null;
                city: string;
                state: string | null;
                postalCode: string | null;
            };
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.OrderStatus;
            updatedAt: Date;
            version: number;
            branchId: string;
            deliveredAt: Date | null;
            businessClientId: string;
            orderNumber: string;
            deliveryAddressId: string | null;
            contactId: string | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            tax: import("@prisma/client/runtime/library").Decimal;
            total: import("@prisma/client/runtime/library").Decimal;
            notes: string | null;
            internalNotes: string | null;
            confirmedAt: Date | null;
            shippedAt: Date | null;
            cancelledAt: Date | null;
            createdById: string | null;
            deliveryExceptionId: string | null;
            returnId: string | null;
            sourceQuoteId: string | null;
        };
        items: ({
            product: {
                brand: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    nameAr: string | null;
                    country: string | null;
                    isOem: boolean;
                };
                category: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    nameAr: string | null;
                    parentId: string | null;
                };
            } & {
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
            status: import(".prisma/client").$Enums.PickListItemStatus;
            pickListId: string;
            productId: string;
            binLocation: string | null;
            inventoryId: string;
            requiredQty: number;
            pickedQty: number;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.PickListStatus;
        version: number;
        startedAt: Date | null;
        completedAt: Date | null;
        branchId: string;
        orderId: string;
        assignedToId: string | null;
    }>;
    startPicking(req: any, id: string): Promise<{
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
            status: import(".prisma/client").$Enums.PickListItemStatus;
            pickListId: string;
            productId: string;
            binLocation: string | null;
            inventoryId: string;
            requiredQty: number;
            pickedQty: number;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.PickListStatus;
        version: number;
        startedAt: Date | null;
        completedAt: Date | null;
        branchId: string;
        orderId: string;
        assignedToId: string | null;
    }>;
    pickItem(req: any, id: string, dto: PickItemDto): Promise<{
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
            status: import(".prisma/client").$Enums.PickListItemStatus;
            pickListId: string;
            productId: string;
            binLocation: string | null;
            inventoryId: string;
            requiredQty: number;
            pickedQty: number;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.PickListStatus;
        version: number;
        startedAt: Date | null;
        completedAt: Date | null;
        branchId: string;
        orderId: string;
        assignedToId: string | null;
    }>;
    cancel(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.PickListStatus;
        version: number;
        startedAt: Date | null;
        completedAt: Date | null;
        branchId: string;
        orderId: string;
        assignedToId: string | null;
    }>;
}
