import { ReturnToWarehouseService } from './rtw.service';
export declare class ReturnToWarehouseController {
    private readonly rtwService;
    constructor(rtwService: ReturnToWarehouseService);
    returnToWarehouse(tripId: string, stopId: string, body: {
        reason: string;
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        version: number;
        branchId: string;
        reason: string;
        receivedAt: Date | null;
        receivedById: string | null;
        tripId: string;
        stopId: string;
    }>;
}
export declare class RtwListController {
    private readonly rtwService;
    constructor(rtwService: ReturnToWarehouseService);
    findAll(req: any, branchId?: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        version: number;
        branchId: string;
        reason: string;
        receivedAt: Date | null;
        receivedById: string | null;
        tripId: string;
        stopId: string;
    }[]>;
}
