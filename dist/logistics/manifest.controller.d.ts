import { ManifestService } from './manifest.service';
export declare class ManifestController {
    private readonly service;
    constructor(service: ManifestService);
    create(req: any, body: any): Promise<{
        orders: {
            id: string;
            createdAt: Date;
            sequence: number;
            orderId: string;
            shipmentManifestId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ManifestStatus;
        updatedAt: Date;
        version: number;
        completedAt: Date | null;
        branchId: string;
        tripId: string | null;
        manifestRef: string;
        sealedAt: Date | null;
        dispatchedAt: Date | null;
    }>;
    findAll(req: any, branchId?: string, status?: any): Promise<({
        orders: {
            id: string;
            createdAt: Date;
            sequence: number;
            orderId: string;
            shipmentManifestId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ManifestStatus;
        updatedAt: Date;
        version: number;
        completedAt: Date | null;
        branchId: string;
        tripId: string | null;
        manifestRef: string;
        sealedAt: Date | null;
        dispatchedAt: Date | null;
    })[]>;
    findOne(req: any, id: string): Promise<{
        orders: {
            id: string;
            createdAt: Date;
            sequence: number;
            orderId: string;
            shipmentManifestId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ManifestStatus;
        updatedAt: Date;
        version: number;
        completedAt: Date | null;
        branchId: string;
        tripId: string | null;
        manifestRef: string;
        sealedAt: Date | null;
        dispatchedAt: Date | null;
    }>;
    addOrders(req: any, id: string, body: {
        orderIds: string[];
    }): Promise<{
        orders: {
            id: string;
            createdAt: Date;
            sequence: number;
            orderId: string;
            shipmentManifestId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ManifestStatus;
        updatedAt: Date;
        version: number;
        completedAt: Date | null;
        branchId: string;
        tripId: string | null;
        manifestRef: string;
        sealedAt: Date | null;
        dispatchedAt: Date | null;
    }>;
    seal(req: any, id: string): Promise<{
        orders: {
            id: string;
            createdAt: Date;
            sequence: number;
            orderId: string;
            shipmentManifestId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ManifestStatus;
        updatedAt: Date;
        version: number;
        completedAt: Date | null;
        branchId: string;
        tripId: string | null;
        manifestRef: string;
        sealedAt: Date | null;
        dispatchedAt: Date | null;
    }>;
    dispatch(req: any, id: string, body: {
        tripId: string;
    }): Promise<{
        orders: {
            id: string;
            createdAt: Date;
            sequence: number;
            orderId: string;
            shipmentManifestId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ManifestStatus;
        updatedAt: Date;
        version: number;
        completedAt: Date | null;
        branchId: string;
        tripId: string | null;
        manifestRef: string;
        sealedAt: Date | null;
        dispatchedAt: Date | null;
    }>;
    complete(req: any, id: string): Promise<{
        orders: {
            id: string;
            createdAt: Date;
            sequence: number;
            orderId: string;
            shipmentManifestId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.ManifestStatus;
        updatedAt: Date;
        version: number;
        completedAt: Date | null;
        branchId: string;
        tripId: string | null;
        manifestRef: string;
        sealedAt: Date | null;
        dispatchedAt: Date | null;
    }>;
}
