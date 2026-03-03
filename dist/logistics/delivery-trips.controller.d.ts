import { DeliveryTripsService } from './delivery-trips.service';
import { CreateTripDto, AddTripStopDto, AddTripPackDto, CompleteStopDto } from './dto/logistics.dto';
import { AssignProviderDto, ManualDeliveryDto } from './dto/fulfillment.dto';
export declare class DeliveryTripsController {
    private readonly deliveryTripsService;
    constructor(deliveryTripsService: DeliveryTripsService);
    createTrip(req: any, dto: CreateTripDto): Promise<{
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
        fulfillmentProviderId: string | null;
        totalStops: number;
        totalPacks: number;
    }>;
    assignProvider(req: any, tripId: string, dto: AssignProviderDto): Promise<{
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
        fulfillmentProviderId: string | null;
        totalStops: number;
        totalPacks: number;
    }>;
    addPack(req: any, tripId: string, dto: AddTripPackDto): Promise<{
        pack: {
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
        };
    } & {
        id: string;
        deliveredAt: Date | null;
        packId: string;
        tripId: string;
        loadedAt: Date;
    }>;
    addStop(req: any, tripId: string, dto: AddTripStopDto): Promise<{
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
    startLoading(req: any, tripId: string): Promise<{
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
        fulfillmentProviderId: string | null;
        totalStops: number;
        totalPacks: number;
    }>;
    startTrip(req: any, tripId: string): Promise<{
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
        fulfillmentProviderId: string | null;
        totalStops: number;
        totalPacks: number;
    }>;
    arriveAtStop(req: any, stopId: string): Promise<{
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
    manualArrival(req: any, stopId: string): Promise<{
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
    completeStop(req: any, stopId: string, dto: CompleteStopDto): Promise<{
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
    manualDelivery(req: any, stopId: string, dto: ManualDeliveryDto): Promise<{
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
    completeTrip(req: any, tripId: string): Promise<{
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
        fulfillmentProviderId: string | null;
        totalStops: number;
        totalPacks: number;
    }>;
    failTrip(req: any, tripId: string, body: {
        reason: string;
    }): Promise<{
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
        fulfillmentProviderId: string | null;
        totalStops: number;
        totalPacks: number;
    }>;
    findAll(req: any, branchId?: string, status?: string): Promise<({
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
        fulfillmentProviderId: string | null;
        totalStops: number;
        totalPacks: number;
    })[]>;
}
