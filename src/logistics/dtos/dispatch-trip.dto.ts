import { IsString, IsOptional } from 'class-validator';

export class DispatchTripDto {
    @IsString()
    @IsOptional()
    driverId?: string; // Can assign at dispatch

    @IsString()
    @IsOptional()
    vehicleId?: string; // Can assign at dispatch
}
