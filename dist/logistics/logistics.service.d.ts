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
    dispatchTrip(tenantId: string, userId: string, tripId: string, dto: DispatchTripDto): Promise<{
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
