import { PrismaService } from '../prisma/prisma.service';
import { PickListStatus } from '@prisma/client';
import { AuditService } from '../shared/audit.service';
import { TranslationService } from '../i18n/translation.service';
export declare class PickListsService {
    private readonly prisma;
    private readonly auditService;
    private readonly t;
    constructor(prisma: PrismaService, auditService: AuditService, t: TranslationService);
    createPickListForOrder(orderId: string): Promise<{
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
    findAll(tenantId: string, branchId?: string, status?: PickListStatus): Promise<({
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
    findOne(id: string, tenantId: string): Promise<{
        branch: {
            id: string;
            name: string;
            nameAr: string | null;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            address: string | null;
            addressAr: string | null;
            phone: string | null;
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
            createdById: string | null;
            cancelledAt: Date | null;
            returnId: string | null;
            deliveryExceptionId: string | null;
            orderNumber: string;
            deliveryAddressId: string | null;
            contactId: string | null;
            internalNotes: string | null;
            sourceQuoteId: string | null;
            confirmedAt: Date | null;
            shippedAt: Date | null;
            deliveredAt: Date | null;
        };
        items: ({
            product: {
                brand: {
                    id: string;
                    name: string;
                    nameAr: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    country: string | null;
                    isOem: boolean;
                };
                category: {
                    id: string;
                    name: string;
                    nameAr: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    parentId: string | null;
                };
            } & {
                id: string;
                name: string;
                nameAr: string | null;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                description: string | null;
                descriptionAr: string | null;
                brandId: string;
                categoryId: string;
                weight: number | null;
                dimensions: string | null;
                unitOfMeasure: string | null;
                images: string[];
                taxRateId: string | null;
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
                    nameAr: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    status: string;
                    description: string | null;
                    descriptionAr: string | null;
                    brandId: string;
                    categoryId: string;
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
    startPicking(id: string, userId: string, correlationId?: string, tenantId?: string): Promise<{
        items: ({
            product: {
                id: string;
                name: string;
                nameAr: string | null;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                description: string | null;
                descriptionAr: string | null;
                brandId: string;
                categoryId: string;
                weight: number | null;
                dimensions: string | null;
                unitOfMeasure: string | null;
                images: string[];
                taxRateId: string | null;
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
    pickItem(pickListId: string, pickListItemId: string, pickedQty: number): Promise<{
        items: ({
            product: {
                id: string;
                name: string;
                nameAr: string | null;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                description: string | null;
                descriptionAr: string | null;
                brandId: string;
                categoryId: string;
                weight: number | null;
                dimensions: string | null;
                unitOfMeasure: string | null;
                images: string[];
                taxRateId: string | null;
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
    cancelPickList(id: string, tenantId: string): Promise<{
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
