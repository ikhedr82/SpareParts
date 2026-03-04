import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
import { TranslationService } from '../i18n/translation.service';
import { CreateTripDto } from './dtos/create-trip.dto';
import { DispatchTripDto } from './dtos/dispatch-trip.dto';
export declare class LogisticsService {
    private prisma;
    private auditService;
    private outbox;
    private t;
    constructor(prisma: PrismaService, auditService: AuditService, outbox: OutboxService, t: TranslationService);
    createTrip(tenantId: string, branchId: string, userId: string, dto: CreateTripDto): Promise<{
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
    dispatchTrip(tenantId: string, userId: string, tripId: string, dto: DispatchTripDto): Promise<{
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
}
