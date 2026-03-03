import { VehicleType, FulfillmentMode } from '@prisma/client';
export declare class CreateDriverDto {
    name: string;
    phone: string;
    branchId: string;
}
export declare class CreateVehicleDto {
    plateNumber: string;
    type: VehicleType;
    capacityKg?: number;
    branchId: string;
}
export declare class CreateTripDto {
    branchId: string;
    driverId?: string;
    vehicleId?: string;
    mode: FulfillmentMode;
    fulfillmentProviderId?: string;
}
export declare class AddTripStopDto {
    orderId?: string;
    supplierId?: string;
    customerId?: string;
}
export declare class AddTripPackDto {
    packId: string;
}
export declare class CompleteStopDto {
    success: boolean;
}
