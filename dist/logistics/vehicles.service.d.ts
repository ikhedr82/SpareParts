import { PrismaService } from '../prisma/prisma.service';
import { VehicleType } from '@prisma/client';
export declare class VehiclesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, branchId: string, plateNumber: string, type: VehicleType, capacityKg?: number): Promise<{
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
    findAll(tenantId: string, branchId?: string, isActive?: boolean): Promise<({
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
