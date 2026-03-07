import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TripStopDto {
    @IsString()
    @IsOptional()
    orderId?: string;

    @IsString()
    @IsNotEmpty()
    type: string; // CUSTOMER, SUPPLIER, BRANCH

    @IsNotEmpty()
    sequence: number;
}

export class CreateTripDto {
    @IsString()
    @IsOptional()
    driverId?: string;

    @IsString()
    @IsOptional()
    vehicleId?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TripStopDto)
    stops: TripStopDto[];
}
