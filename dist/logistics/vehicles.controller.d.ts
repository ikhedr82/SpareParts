import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/logistics.dto';
export declare class VehiclesController {
    private readonly vehiclesService;
    constructor(vehiclesService: VehiclesService);
    create(req: any, dto: CreateVehicleDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        tenantId: string;
        type: import(".prisma/client").$Enums.VehicleType;
        branchId: string;
        currentTripId: string | null;
        plateNumber: string;
        capacityKg: number | null;
    }>;
    findAll(req: any, branchId?: string, isActive?: string): Promise<({
        branch: {
            id: string;
            name: string;
            nameAr: string | null;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            address: string | null;
            addressAr: string | null;
            phone: string | null;
        };
        currentTrip: {
            id: string;
            status: import(".prisma/client").$Enums.DeliveryTripStatus;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        tenantId: string;
        type: import(".prisma/client").$Enums.VehicleType;
        branchId: string;
        currentTripId: string | null;
        plateNumber: string;
        capacityKg: number | null;
    })[]>;
}
