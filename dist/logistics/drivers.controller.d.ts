import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/logistics.dto';
export declare class DriversController {
    private readonly driversService;
    constructor(driversService: DriversService);
    create(req: any, dto: CreateDriverDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        tenantId: string;
        branchId: string;
        phone: string;
        currentTripId: string | null;
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
        name: string;
        isActive: boolean;
        createdAt: Date;
        tenantId: string;
        branchId: string;
        phone: string;
        currentTripId: string | null;
    })[]>;
    activate(req: any, id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        tenantId: string;
        branchId: string;
        phone: string;
        currentTripId: string | null;
    }>;
    deactivate(req: any, id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        tenantId: string;
        branchId: string;
        phone: string;
        currentTripId: string | null;
    }>;
}
