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
        driver: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            branchId: string;
            phone: string;
            isActive: boolean;
            currentTripId: string | null;
        };
        fulfillmentProvider: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            mode: import(".prisma/client").$Enums.FulfillmentMode;
            phone: string | null;
            isActive: boolean;
            apiEndpoint: string | null;
        };
        vehicle: {
            id: string;
            tenantId: string;
            createdAt: Date;
            branchId: string;
            isActive: boolean;
            currentTripId: string | null;
            plateNumber: string;
            type: import(".prisma/client").$Enums.VehicleType;
            capacityKg: number | null;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.DeliveryTripStatus;
        version: number;
        startedAt: Date | null;
        completedAt: Date | null;
        totalStops: number;
        totalPacks: number;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        branchId: string;
        driverId: string | null;
        vehicleId: string | null;
        fulfillmentProviderId: string | null;
    }>;
    assignProvider(tenantId: string, tripId: string, providerId: string): Promise<{
        fulfillmentProvider: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            mode: import(".prisma/client").$Enums.FulfillmentMode;
            phone: string | null;
            isActive: boolean;
            apiEndpoint: string | null;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.DeliveryTripStatus;
        version: number;
        startedAt: Date | null;
        completedAt: Date | null;
        totalStops: number;
        totalPacks: number;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        branchId: string;
        driverId: string | null;
        vehicleId: string | null;
        fulfillmentProviderId: string | null;
    }>;
    addStop(tenantId: string, tripId: string, orderId?: string, supplierId?: string, customerId?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.TripStopStatus;
        completedAt: Date | null;
        stopType: import(".prisma/client").$Enums.TripStopType;
        sequence: number;
        arrivalTime: Date | null;
        completionTime: Date | null;
        exceptionResolved: boolean;
        failureReason: string | null;
        tripId: string;
        orderId: string | null;
        supplierId: string | null;
        customerId: string | null;
    }>;
    addPack(tenantId: string, tripId: string, packId: string): Promise<{
        pack: {
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
        };
    } & {
        id: string;
        tripId: string;
        loadedAt: Date;
        deliveredAt: Date | null;
        packId: string;
    }>;
    startLoading(tenantId: string, tripId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.DeliveryTripStatus;
        version: number;
        startedAt: Date | null;
        completedAt: Date | null;
        totalStops: number;
        totalPacks: number;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        branchId: string;
        driverId: string | null;
        vehicleId: string | null;
        fulfillmentProviderId: string | null;
    }>;
    startTrip(tenantId: string, tripId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.DeliveryTripStatus;
        version: number;
        startedAt: Date | null;
        completedAt: Date | null;
        totalStops: number;
        totalPacks: number;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        branchId: string;
        driverId: string | null;
        vehicleId: string | null;
        fulfillmentProviderId: string | null;
    }>;
    arriveAtStop(tenantId: string, stopId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.TripStopStatus;
        completedAt: Date | null;
        stopType: import(".prisma/client").$Enums.TripStopType;
        sequence: number;
        arrivalTime: Date | null;
        completionTime: Date | null;
        exceptionResolved: boolean;
        failureReason: string | null;
        tripId: string;
        orderId: string | null;
        supplierId: string | null;
        customerId: string | null;
    }>;
    manualArrival(tenantId: string, stopId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.TripStopStatus;
        completedAt: Date | null;
        stopType: import(".prisma/client").$Enums.TripStopType;
        sequence: number;
        arrivalTime: Date | null;
        completionTime: Date | null;
        exceptionResolved: boolean;
        failureReason: string | null;
        tripId: string;
        orderId: string | null;
        supplierId: string | null;
        customerId: string | null;
    }>;
    manualDelivery(tenantId: string, stopId: string, success: boolean, userId: string, notes?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.TripStopStatus;
        completedAt: Date | null;
        stopType: import(".prisma/client").$Enums.TripStopType;
        sequence: number;
        arrivalTime: Date | null;
        completionTime: Date | null;
        exceptionResolved: boolean;
        failureReason: string | null;
        tripId: string;
        orderId: string | null;
        supplierId: string | null;
        customerId: string | null;
    }>;
    completeStop(tenantId: string, stopId: string, success: boolean, userId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.TripStopStatus;
        completedAt: Date | null;
        stopType: import(".prisma/client").$Enums.TripStopType;
        sequence: number;
        arrivalTime: Date | null;
        completionTime: Date | null;
        exceptionResolved: boolean;
        failureReason: string | null;
        tripId: string;
        orderId: string | null;
        supplierId: string | null;
        customerId: string | null;
    }>;
    completeTrip(tenantId: string, tripId: string, userId: string): Promise<{
        driver: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            branchId: string;
            phone: string;
            isActive: boolean;
            currentTripId: string | null;
        };
        fulfillmentProvider: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            mode: import(".prisma/client").$Enums.FulfillmentMode;
            phone: string | null;
            isActive: boolean;
            apiEndpoint: string | null;
        };
        vehicle: {
            id: string;
            tenantId: string;
            createdAt: Date;
            branchId: string;
            isActive: boolean;
            currentTripId: string | null;
            plateNumber: string;
            type: import(".prisma/client").$Enums.VehicleType;
            capacityKg: number | null;
        };
        packs: {
            id: string;
            tripId: string;
            loadedAt: Date;
            deliveredAt: Date | null;
            packId: string;
        }[];
        stops: {
            id: string;
            status: import(".prisma/client").$Enums.TripStopStatus;
            completedAt: Date | null;
            stopType: import(".prisma/client").$Enums.TripStopType;
            sequence: number;
            arrivalTime: Date | null;
            completionTime: Date | null;
            exceptionResolved: boolean;
            failureReason: string | null;
            tripId: string;
            orderId: string | null;
            supplierId: string | null;
            customerId: string | null;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.DeliveryTripStatus;
        version: number;
        startedAt: Date | null;
        completedAt: Date | null;
        totalStops: number;
        totalPacks: number;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        branchId: string;
        driverId: string | null;
        vehicleId: string | null;
        fulfillmentProviderId: string | null;
    }>;
    failTrip(tenantId: string, tripId: string, reason: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.DeliveryTripStatus;
        version: number;
        startedAt: Date | null;
        completedAt: Date | null;
        totalStops: number;
        totalPacks: number;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        branchId: string;
        driverId: string | null;
        vehicleId: string | null;
        fulfillmentProviderId: string | null;
    }>;
    findAll(tenantId: string, branchId?: string, status?: DeliveryTripStatus): Promise<({
        _count: {
            packs: number;
        };
        driver: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            branchId: string;
            phone: string;
            isActive: boolean;
            currentTripId: string | null;
        };
        fulfillmentProvider: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            mode: import(".prisma/client").$Enums.FulfillmentMode;
            phone: string | null;
            isActive: boolean;
            apiEndpoint: string | null;
        };
        vehicle: {
            id: string;
            tenantId: string;
            createdAt: Date;
            branchId: string;
            isActive: boolean;
            currentTripId: string | null;
            plateNumber: string;
            type: import(".prisma/client").$Enums.VehicleType;
            capacityKg: number | null;
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
            completedAt: Date | null;
            stopType: import(".prisma/client").$Enums.TripStopType;
            sequence: number;
            arrivalTime: Date | null;
            completionTime: Date | null;
            exceptionResolved: boolean;
            failureReason: string | null;
            tripId: string;
            orderId: string | null;
            supplierId: string | null;
            customerId: string | null;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.DeliveryTripStatus;
        version: number;
        startedAt: Date | null;
        completedAt: Date | null;
        totalStops: number;
        totalPacks: number;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        branchId: string;
        driverId: string | null;
        vehicleId: string | null;
        fulfillmentProviderId: string | null;
    })[]>;
}
