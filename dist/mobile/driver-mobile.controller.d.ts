import { PrismaService } from '../prisma/prisma.service';
export declare class DriverMobileController {
    private prisma;
    constructor(prisma: PrismaService);
    getRoute(req: any): Promise<{
        stops: ({
            order: {
                businessClient: {
                    currency: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    tenantId: string;
                    status: string;
                    type: import(".prisma/client").$Enums.BusinessClientType;
                    notes: string | null;
                    businessName: string;
                    registrationNumber: string | null;
                    taxId: string | null;
                    primaryEmail: string | null;
                    primaryPhone: string | null;
                    creditLimit: import("@prisma/client/runtime/library").Decimal;
                    currentBalance: import("@prisma/client/runtime/library").Decimal;
                    paymentTermsDays: number;
                    paymentTerms: string | null;
                    priceTierId: string | null;
                };
                deliveryAddress: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    type: string;
                    country: string;
                    businessClientId: string;
                    isPrimary: boolean;
                    addressLine1: string;
                    addressLine2: string | null;
                    city: string;
                    state: string | null;
                    postalCode: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                status: import(".prisma/client").$Enums.OrderStatus;
                version: number;
                branchId: string;
                notes: string | null;
                total: import("@prisma/client/runtime/library").Decimal;
                businessClientId: string;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                tax: import("@prisma/client/runtime/library").Decimal;
                cancelledAt: Date | null;
                returnId: string | null;
                createdById: string | null;
                deliveryExceptionId: string | null;
                orderNumber: string;
                deliveryAddressId: string | null;
                contactId: string | null;
                internalNotes: string | null;
                confirmedAt: Date | null;
                shippedAt: Date | null;
                deliveredAt: Date | null;
                sourceQuoteId: string | null;
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
    }>;
    completeStop(req: any, stopId: string, body: {
        signature?: string;
        photo?: string;
        lat?: number;
        lng?: number;
        notes?: string;
    }): Promise<{
        success: boolean;
    }>;
}
