export declare class TripStopDto {
    orderId?: string;
    type: string;
    sequence: number;
}
export declare class CreateTripDto {
    driverId?: string;
    vehicleId?: string;
    stops: TripStopDto[];
}
