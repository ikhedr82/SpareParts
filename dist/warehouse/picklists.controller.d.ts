import { PickListsService } from './picklists.service';
import { PickItemDto } from './dto/warehouse.dto';
export declare class PickListsController {
    private readonly pickListsService;
    constructor(pickListsService: PickListsService);
    findAll(req: any, branchId?: string, status?: string): Promise<({
        branch: {
            id: string;
            name: string;
        };
        order: {
            businessClient: {
                businessName: string;
            };
            id: string;
            orderNumber: string;
        };
        _count: {
            items: number;
            packs: number;
        };
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
    findOne(req: any, id: string): Promise<{
        branch: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            nameAr: string | null;
            tenantId: string;
            address: string | null;
            phone: string | null;
            addressAr: string | null;
        };
        order: {
            businessClient: {
                currency: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                status: string;
                type: import(".prisma/client").$Enums.BusinessClientType;
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
                name: string;
                createdAt: Date;
                updatedAt: Date;
                email: string | null;
                phone: string | null;
                position: string | null;
                businessClientId: string;
                isPrimary: boolean;
                canPlaceOrders: boolean;
            };
            deliveryAddress: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                type: string;
                country: string;
                businessClientId: string;
                isPrimary: boolean;
                addressLine1: string;
                addressLine2: string | null;
                city: string;
                state: string | null;
                postalCode: string | null;
            };
        } & {
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
            status: import(".prisma/client").$Enums.PickListItemStatus;
            productId: string;
            binLocation: string | null;
            pickListId: string;
            inventoryId: string;
            requiredQty: number;
            pickedQty: number;
        })[];
        packs: ({
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
    }>;
    startPicking(req: any, id: string): Promise<{
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
    }>;
    pickItem(req: any, id: string, dto: PickItemDto): Promise<{
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
    }>;
    cancel(req: any, id: string): Promise<{
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
