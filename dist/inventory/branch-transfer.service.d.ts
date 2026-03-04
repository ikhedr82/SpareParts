import { PrismaService } from '../prisma/prisma.service';
import { BranchTransferStatus } from '@prisma/client';
import { InventoryLedgerService } from './inventory-ledger.service';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
export declare class BranchTransferService {
    private readonly prisma;
    private readonly ledger;
    private readonly auditService;
    private readonly outbox;
    constructor(prisma: PrismaService, ledger: InventoryLedgerService, auditService: AuditService, outbox: OutboxService);
    createTransfer(tenantId: string, userId: string, dto: {
        sourceBranchId: string;
        destBranchId: string;
        notes?: string;
        items: {
            productId: string;
            quantity: number;
        }[];
    }, correlationId?: string): Promise<{
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
    approveTransfer(tenantId: string, transferId: string, userId: string, correlationId?: string): Promise<{
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
    shipTransfer(tenantId: string, transferId: string, userId: string, correlationId?: string): Promise<{
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
    receiveTransfer(tenantId: string, transferId: string, userId: string, receivedItems: {
        itemId: string;
        receivedQty: number;
    }[], correlationId?: string): Promise<{
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
    findAll(tenantId: string, branchId?: string, status?: BranchTransferStatus): Promise<({
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
    findOne(tenantId: string, transferId: string): Promise<{
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
