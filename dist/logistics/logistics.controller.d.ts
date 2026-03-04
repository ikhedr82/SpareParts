import { LogisticsService } from './logistics.service';
import { CreateTripDto } from './dtos/create-trip.dto';
import { DispatchTripDto } from './dtos/dispatch-trip.dto';
import { PlanEnforcementService } from '../tenant-admin/plan-enforcement.service';
export declare class LogisticsController {
    private readonly service;
    private readonly planEnforcement;
    constructor(service: LogisticsService, planEnforcement: PlanEnforcementService);
    createTrip(req: any, dto: CreateTripDto): Promise<{
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
    dispatchTrip(req: any, tripId: string, dto: DispatchTripDto): Promise<{
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
}
