import { ReturnToWarehouseService } from './rtw.service';
export declare class ReturnToWarehouseController {
    private readonly rtwService;
    constructor(rtwService: ReturnToWarehouseService);
    returnToWarehouse(tripId: string, stopId: string, body: {
        reason: string;
    }, req: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        version: number;
        branchId: string;
        tripId: string;
        reason: string;
        stopId: string;
        receivedAt: Date | null;
        receivedById: string | null;
    }>;
}
export declare class RtwListController {
    private readonly rtwService;
    constructor(rtwService: ReturnToWarehouseService);
    findAll(req: any, branchId?: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        version: number;
        branchId: string;
        tripId: string;
        reason: string;
        stopId: string;
        receivedAt: Date | null;
        receivedById: string | null;
    }[]>;
}
