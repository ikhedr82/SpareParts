import { DeliveryExceptionsService } from './delivery-exceptions.service';
import { CreateDeliveryExceptionDto, ResolveExceptionDto } from './dto/exceptions.dto';
export declare class DeliveryExceptionsController {
    private readonly service;
    constructor(service: DeliveryExceptionsService);
    createException(req: any, dto: CreateDeliveryExceptionDto): Promise<{
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
    resolveException(req: any, id: string, dto: ResolveExceptionDto): Promise<{
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
    findAll(req: any, resolved?: string, tripId?: string): Promise<({
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
    getUnresolvedCount(req: any): Promise<{
        count: number;
    }>;
}
