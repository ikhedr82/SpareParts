import { BranchTransferService } from './branch-transfer.service';
export declare class BranchTransferController {
    private readonly service;
    constructor(service: BranchTransferService);
    create(req: any, body: any): Promise<{
        items: {
            id: string;
            createdAt: Date;
            productId: string;
            branchTransferId: string;
            requestedQty: number;
            shippedQty: number;
            receivedQty: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.BranchTransferStatus;
        version: number;
        notes: string | null;
        receivedAt: Date | null;
        shippedAt: Date | null;
        sourceBranchId: string;
        destBranchId: string;
        requestedById: string;
        approvedById: string | null;
    }>;
    findAll(req: any, branchId?: string, status?: any): Promise<({
        items: {
            id: string;
            createdAt: Date;
            productId: string;
            branchTransferId: string;
            requestedQty: number;
            shippedQty: number;
            receivedQty: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.BranchTransferStatus;
        version: number;
        notes: string | null;
        receivedAt: Date | null;
        shippedAt: Date | null;
        sourceBranchId: string;
        destBranchId: string;
        requestedById: string;
        approvedById: string | null;
    })[]>;
    findOne(req: any, id: string): Promise<{
        items: {
            id: string;
            createdAt: Date;
            productId: string;
            branchTransferId: string;
            requestedQty: number;
            shippedQty: number;
            receivedQty: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.BranchTransferStatus;
        version: number;
        notes: string | null;
        receivedAt: Date | null;
        shippedAt: Date | null;
        sourceBranchId: string;
        destBranchId: string;
        requestedById: string;
        approvedById: string | null;
    }>;
    approve(req: any, id: string): Promise<{
        items: {
            id: string;
            createdAt: Date;
            productId: string;
            branchTransferId: string;
            requestedQty: number;
            shippedQty: number;
            receivedQty: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.BranchTransferStatus;
        version: number;
        notes: string | null;
        receivedAt: Date | null;
        shippedAt: Date | null;
        sourceBranchId: string;
        destBranchId: string;
        requestedById: string;
        approvedById: string | null;
    }>;
    ship(req: any, id: string): Promise<{
        items: {
            id: string;
            createdAt: Date;
            productId: string;
            branchTransferId: string;
            requestedQty: number;
            shippedQty: number;
            receivedQty: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.BranchTransferStatus;
        version: number;
        notes: string | null;
        receivedAt: Date | null;
        shippedAt: Date | null;
        sourceBranchId: string;
        destBranchId: string;
        requestedById: string;
        approvedById: string | null;
    }>;
    receive(req: any, id: string, body: {
        items: {
            itemId: string;
            receivedQty: number;
        }[];
    }): Promise<{
        items: {
            id: string;
            createdAt: Date;
            productId: string;
            branchTransferId: string;
            requestedQty: number;
            shippedQty: number;
            receivedQty: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.BranchTransferStatus;
        version: number;
        notes: string | null;
        receivedAt: Date | null;
        shippedAt: Date | null;
        sourceBranchId: string;
        destBranchId: string;
        requestedById: string;
        approvedById: string | null;
    }>;
}
