import { PrismaService } from '../prisma/prisma.service';
import { FulfillmentMode } from '@prisma/client';
export declare class FulfillmentProvidersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, name: string, mode: FulfillmentMode, phone?: string, apiEndpoint?: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        tenantId: string;
        phone: string | null;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        apiEndpoint: string | null;
    }>;
    findAll(tenantId: string, mode?: FulfillmentMode, isActive?: boolean): Promise<({
        _count: {
            trips: number;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        tenantId: string;
        phone: string | null;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        apiEndpoint: string | null;
    })[]>;
    activate(tenantId: string, providerId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        tenantId: string;
        phone: string | null;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        apiEndpoint: string | null;
    }>;
    deactivate(tenantId: string, providerId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        tenantId: string;
        phone: string | null;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        apiEndpoint: string | null;
    }>;
}
