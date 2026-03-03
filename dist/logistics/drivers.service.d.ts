import { PrismaService } from '../prisma/prisma.service';
export declare class DriversService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, branchId: string, name: string, phone: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        tenantId: string;
        branchId: string;
        phone: string;
        currentTripId: string | null;
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
        name: string;
        isActive: boolean;
        createdAt: Date;
        tenantId: string;
        branchId: string;
        phone: string;
        currentTripId: string | null;
    })[]>;
    activate(tenantId: string, driverId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        tenantId: string;
        branchId: string;
        phone: string;
        currentTripId: string | null;
    }>;
    deactivate(tenantId: string, driverId: string): Promise<{
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
