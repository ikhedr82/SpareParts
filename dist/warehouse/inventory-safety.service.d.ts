import { PrismaService } from '../prisma/prisma.service';
import { InventoryTransactionType, InventoryReferenceType } from '@prisma/client';
import { TranslationService } from '../i18n/translation.service';
export declare class InventorySafetyService {
    private prisma;
    private readonly t;
    private readonly logger;
    constructor(prisma: PrismaService, t: TranslationService);
    allocate(tenantId: string, branchId: string, items: {
        productId: string;
        quantity: number;
    }[], referenceType: InventoryReferenceType, referenceId: string, userId: string, tx?: any): Promise<void>;
    commit(tenantId: string, branchId: string, items: {
        productId: string;
        quantity: number;
    }[], referenceType: InventoryReferenceType, referenceId: string, userId: string, tx?: any): Promise<void>;
    deallocate(tenantId: string, branchId: string, items: {
        productId: string;
        quantity: number;
    }[], referenceType: InventoryReferenceType, referenceId: string, userId: string, tx?: any): Promise<void>;
    restock(tenantId: string, branchId: string, items: {
        productId: string;
        quantity: number;
    }[], type: InventoryTransactionType, referenceType: InventoryReferenceType, referenceId: string, userId: string, tx?: any): Promise<void>;
    checkAvailability(branchId: string, productId: string, requestedQuantity: number): Promise<boolean>;
    private logTransaction;
}
