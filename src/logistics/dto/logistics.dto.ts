import { IsString, IsEnum, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { VehicleType, FulfillmentMode } from '@prisma/client';

export class CreateDriverDto {
    @IsString()
    name: string;

    @IsString()
    phone: string;

    @IsString()
    branchId: string;
}

export class CreateVehicleDto {
    @IsString()
    plateNumber: string;

    @IsEnum(VehicleType)
    type: VehicleType;

    @IsOptional()
    @IsInt()
    capacityKg?: number;

    @IsString()
    branchId: string;
}

export class CreateTripDto {
    @IsString()
    branchId: string;

    @IsOptional()
    @IsString()
    driverId?: string;

    @IsOptional()
    @IsString()
    vehicleId?: string;

    @IsEnum(FulfillmentMode)
    mode: FulfillmentMode;

    @IsOptional()
    @IsString()
    fulfillmentProviderId?: string;
}

export class AddTripStopDto {
    @IsOptional()
    @IsString()
    orderId?: string;

    @IsOptional()
    @IsString()
    supplierId?: string;

    @IsOptional()
    @IsString()
    customerId?: string;
}

export class AddTripPackDto {
    @IsString()
    packId: string;
}

export class CompleteStopDto {
    @IsBoolean()
    success: boolean;
}
