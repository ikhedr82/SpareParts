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
            completedAt: Date | null;
            stopType: import(".prisma/client").$Enums.TripStopType;
            sequence: number;
            arrivalTime: Date | null;
            completionTime: Date | null;
            exceptionResolved: boolean;
            failureReason: string | null;
            orderId: string | null;
            supplierId: string | null;
            customerId: string | null;
            tripId: string;
        }[];
    } & {
        id: string;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        status: import(".prisma/client").$Enums.DeliveryTripStatus;
        startedAt: Date | null;
        completedAt: Date | null;
        totalStops: number;
        totalPacks: number;
        createdAt: Date;
        version: number;
        tenantId: string;
        branchId: string;
        driverId: string | null;
        vehicleId: string | null;
        fulfillmentProviderId: string | null;
    }>;
    dispatchTrip(req: any, tripId: string, dto: DispatchTripDto): Promise<{
        id: string;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        status: import(".prisma/client").$Enums.DeliveryTripStatus;
        startedAt: Date | null;
        completedAt: Date | null;
        totalStops: number;
        totalPacks: number;
        createdAt: Date;
        version: number;
        tenantId: string;
        branchId: string;
        driverId: string | null;
        vehicleId: string | null;
        fulfillmentProviderId: string | null;
    }>;
}
