import { DeliveryTripsService } from './delivery-trips.service';
import { CreateTripDto, AddTripStopDto, AddTripPackDto, CompleteStopDto } from './dto/logistics.dto';
import { AssignProviderDto, ManualDeliveryDto } from './dto/fulfillment.dto';
export declare class DeliveryTripsController {
    private readonly deliveryTripsService;
    constructor(deliveryTripsService: DeliveryTripsService);
    createTrip(req: any, dto: CreateTripDto): Promise<{
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
    assignProvider(req: any, tripId: string, dto: AssignProviderDto): Promise<{
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
    addPack(req: any, tripId: string, dto: AddTripPackDto): Promise<{
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
    addStop(req: any, tripId: string, dto: AddTripStopDto): Promise<{
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
    startLoading(req: any, tripId: string): Promise<{
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
    startTrip(req: any, tripId: string): Promise<{
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
    arriveAtStop(req: any, stopId: string): Promise<{
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
    manualArrival(req: any, stopId: string): Promise<{
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
    completeStop(req: any, stopId: string, dto: CompleteStopDto): Promise<{
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
    manualDelivery(req: any, stopId: string, dto: ManualDeliveryDto): Promise<{
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
    completeTrip(req: any, tripId: string): Promise<{
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
    failTrip(req: any, tripId: string, body: {
        reason: string;
    }): Promise<{
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
    findAll(req: any, branchId?: string, status?: string): Promise<({
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
