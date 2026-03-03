import { PrismaService } from '../prisma/prisma.service';
import { DeliveryExceptionType } from '@prisma/client';
export declare class DeliveryExceptionsService {
    private prisma;
    constructor(prisma: PrismaService);
    createException(tenantId: string, tripStopId: string, exceptionType: DeliveryExceptionType, description: string, reportedBy: string): Promise<{
        id: string;
        tenantId: string;
        description: string;
        tripStopId: string;
        exceptionType: import(".prisma/client").$Enums.DeliveryExceptionType;
        reportedBy: string;
        reportedAt: Date;
        resolved: boolean;
        resolutionType: string | null;
        resolutionNotes: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
    }>;
    resolveException(tenantId: string, exceptionId: string, resolutionType: string, notes: string, resolvedBy: string): Promise<{
        id: string;
        tenantId: string;
        description: string;
        tripStopId: string;
        exceptionType: import(".prisma/client").$Enums.DeliveryExceptionType;
        reportedBy: string;
        reportedAt: Date;
        resolved: boolean;
        resolutionType: string | null;
        resolutionNotes: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
    }>;
    findAll(tenantId: string, resolved?: boolean, tripId?: string): Promise<({
        tripStop: {
            customer: {
                name: string;
            };
            order: {
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
        };
    } & {
        id: string;
        tenantId: string;
        description: string;
        tripStopId: string;
        exceptionType: import(".prisma/client").$Enums.DeliveryExceptionType;
        reportedBy: string;
        reportedAt: Date;
        resolved: boolean;
        resolutionType: string | null;
        resolutionNotes: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
    })[]>;
    getUnresolvedCount(tenantId: string): Promise<number>;
}
