import { PrismaService } from '../prisma/prisma.service';
import { DeliveryTripStatus, FulfillmentMode } from '@prisma/client';
import { InventorySafetyService } from '../warehouse/inventory-safety.service';
import { AuditService } from '../shared/audit.service';
import { TranslationService } from '../i18n/translation.service';
export declare class DeliveryTripsService {
    private prisma;
    private inventorySafetyService;
    private auditService;
    private readonly t;
    constructor(prisma: PrismaService, inventorySafetyService: InventorySafetyService, auditService: AuditService, t: TranslationService);
    createTrip(tenantId: string, branchId: string, mode: FulfillmentMode, driverId?: string, vehicleId?: string, fulfillmentProviderId?: string): Promise<{
        fulfillmentProvider: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            tenantId: string;
            phone: string | null;
            mode: import(".prisma/client").$Enums.FulfillmentMode;
            apiEndpoint: string | null;
        };
        driver: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            tenantId: string;
            branchId: string;
            phone: string;
            currentTripId: string | null;
        };
        vehicle: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            tenantId: string;
            type: import(".prisma/client").$Enums.VehicleType;
            branchId: string;
            currentTripId: string | null;
            plateNumber: string;
            capacityKg: number | null;
        };
    } & {
        id: string;
        createdAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.DeliveryTripStatus;
        version: number;
        branchId: string;
        startedAt: Date | null;
        completedAt: Date | null;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        driverId: string | null;
        vehicleId: string | null;
        totalStops: number;
        totalPacks: number;
        fulfillmentProviderId: string | null;
    }>;
    assignProvider(tenantId: string, tripId: string, providerId: string): Promise<{
        fulfillmentProvider: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            tenantId: string;
            phone: string | null;
            mode: import(".prisma/client").$Enums.FulfillmentMode;
            apiEndpoint: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.DeliveryTripStatus;
        version: number;
        branchId: string;
        startedAt: Date | null;
        completedAt: Date | null;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        driverId: string | null;
        vehicleId: string | null;
        totalStops: number;
        totalPacks: number;
        fulfillmentProviderId: string | null;
    }>;
    addStop(tenantId: string, tripId: string, orderId?: string, supplierId?: string, customerId?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.TripStopStatus;
        orderId: string | null;
        customerId: string | null;
        supplierId: string | null;
        completedAt: Date | null;
        tripId: string;
        stopType: import(".prisma/client").$Enums.TripStopType;
        sequence: number;
        arrivalTime: Date | null;
        completionTime: Date | null;
        exceptionResolved: boolean;
        failureReason: string | null;
    }>;
    addPack(tenantId: string, tripId: string, packId: string): Promise<{
        pack: {
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
        };
    } & {
        id: string;
        deliveredAt: Date | null;
        packId: string;
        tripId: string;
        loadedAt: Date;
    }>;
    startLoading(tenantId: string, tripId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.DeliveryTripStatus;
        version: number;
        branchId: string;
        startedAt: Date | null;
        completedAt: Date | null;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        driverId: string | null;
        vehicleId: string | null;
        totalStops: number;
        totalPacks: number;
        fulfillmentProviderId: string | null;
    }>;
    startTrip(tenantId: string, tripId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.DeliveryTripStatus;
        version: number;
        branchId: string;
        startedAt: Date | null;
        completedAt: Date | null;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        driverId: string | null;
        vehicleId: string | null;
        totalStops: number;
        totalPacks: number;
        fulfillmentProviderId: string | null;
    }>;
    arriveAtStop(tenantId: string, stopId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.TripStopStatus;
        orderId: string | null;
        customerId: string | null;
        supplierId: string | null;
        completedAt: Date | null;
        tripId: string;
        stopType: import(".prisma/client").$Enums.TripStopType;
        sequence: number;
        arrivalTime: Date | null;
        completionTime: Date | null;
        exceptionResolved: boolean;
        failureReason: string | null;
    }>;
    manualArrival(tenantId: string, stopId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.TripStopStatus;
        orderId: string | null;
        customerId: string | null;
        supplierId: string | null;
        completedAt: Date | null;
        tripId: string;
        stopType: import(".prisma/client").$Enums.TripStopType;
        sequence: number;
        arrivalTime: Date | null;
        completionTime: Date | null;
        exceptionResolved: boolean;
        failureReason: string | null;
    }>;
    manualDelivery(tenantId: string, stopId: string, success: boolean, userId: string, notes?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.TripStopStatus;
        orderId: string | null;
        customerId: string | null;
        supplierId: string | null;
        completedAt: Date | null;
        tripId: string;
        stopType: import(".prisma/client").$Enums.TripStopType;
        sequence: number;
        arrivalTime: Date | null;
        completionTime: Date | null;
        exceptionResolved: boolean;
        failureReason: string | null;
    }>;
    completeStop(tenantId: string, stopId: string, success: boolean, userId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.TripStopStatus;
        orderId: string | null;
        customerId: string | null;
        supplierId: string | null;
        completedAt: Date | null;
        tripId: string;
        stopType: import(".prisma/client").$Enums.TripStopType;
        sequence: number;
        arrivalTime: Date | null;
        completionTime: Date | null;
        exceptionResolved: boolean;
        failureReason: string | null;
    }>;
    completeTrip(tenantId: string, tripId: string, userId: string): Promise<{
        fulfillmentProvider: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            tenantId: string;
            phone: string | null;
            mode: import(".prisma/client").$Enums.FulfillmentMode;
            apiEndpoint: string | null;
        };
        driver: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            tenantId: string;
            branchId: string;
            phone: string;
            currentTripId: string | null;
        };
        vehicle: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            tenantId: string;
            type: import(".prisma/client").$Enums.VehicleType;
            branchId: string;
            currentTripId: string | null;
            plateNumber: string;
            capacityKg: number | null;
        };
        packs: {
            id: string;
            deliveredAt: Date | null;
            packId: string;
            tripId: string;
            loadedAt: Date;
        }[];
        stops: {
            id: string;
            status: import(".prisma/client").$Enums.TripStopStatus;
            orderId: string | null;
            customerId: string | null;
            supplierId: string | null;
            completedAt: Date | null;
            tripId: string;
            stopType: import(".prisma/client").$Enums.TripStopType;
            sequence: number;
            arrivalTime: Date | null;
            completionTime: Date | null;
            exceptionResolved: boolean;
            failureReason: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.DeliveryTripStatus;
        version: number;
        branchId: string;
        startedAt: Date | null;
        completedAt: Date | null;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        driverId: string | null;
        vehicleId: string | null;
        totalStops: number;
        totalPacks: number;
        fulfillmentProviderId: string | null;
    }>;
    failTrip(tenantId: string, tripId: string, reason: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.DeliveryTripStatus;
        version: number;
        branchId: string;
        startedAt: Date | null;
        completedAt: Date | null;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        driverId: string | null;
        vehicleId: string | null;
        totalStops: number;
        totalPacks: number;
        fulfillmentProviderId: string | null;
    }>;
    findAll(tenantId: string, branchId?: string, status?: DeliveryTripStatus): Promise<({
        fulfillmentProvider: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            tenantId: string;
            phone: string | null;
            mode: import(".prisma/client").$Enums.FulfillmentMode;
            apiEndpoint: string | null;
        };
        driver: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            tenantId: string;
            branchId: string;
            phone: string;
            currentTripId: string | null;
        };
        vehicle: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            tenantId: string;
            type: import(".prisma/client").$Enums.VehicleType;
            branchId: string;
            currentTripId: string | null;
            plateNumber: string;
            capacityKg: number | null;
        };
        _count: {
            packs: number;
        };
        stops: ({
            order: {
                businessClient: {
                    businessName: string;
                };
                orderNumber: string;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.TripStopStatus;
            orderId: string | null;
            customerId: string | null;
            supplierId: string | null;
            completedAt: Date | null;
            tripId: string;
            stopType: import(".prisma/client").$Enums.TripStopType;
            sequence: number;
            arrivalTime: Date | null;
            completionTime: Date | null;
            exceptionResolved: boolean;
            failureReason: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.DeliveryTripStatus;
        version: number;
        branchId: string;
        startedAt: Date | null;
        completedAt: Date | null;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        driverId: string | null;
        vehicleId: string | null;
        totalStops: number;
        totalPacks: number;
        fulfillmentProviderId: string | null;
    })[]>;
}
