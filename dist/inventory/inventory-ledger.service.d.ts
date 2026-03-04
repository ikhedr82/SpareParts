import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { RecordTransactionDto } from './dto/record-transaction.dto';
import { TranslationService } from '../i18n/translation.service';
export declare class InventoryLedgerService {
    private prisma;
    private t;
    constructor(prisma: PrismaService, t: TranslationService);
    recordTransaction(data: RecordTransactionDto, externalTx?: Prisma.TransactionClient): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        type: import(".prisma/client").$Enums.InventoryTransactionType;
        userId: string;
        branchId: string;
        productId: string;
        costPrice: Prisma.Decimal;
        quantityChange: number;
        referenceType: import(".prisma/client").$Enums.InventoryReferenceType;
        referenceId: string;
        revenueAmount: Prisma.Decimal | null;
    }>;
    private executeInventoryLogic;
    getLedger(branchId: string, productId?: string): Promise<({
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string | null;
            status: string;
            email: string;
            passwordHash: string;
            isPlatformUser: boolean;
            version: number;
        };
        product: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            nameAr: string | null;
            status: string;
            description: string | null;
            descriptionAr: string | null;
            brandId: string;
            categoryId: string;
            weight: number | null;
            dimensions: string | null;
            taxRateId: string | null;
            images: string[];
            unitOfMeasure: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        tenantId: string;
        type: import(".prisma/client").$Enums.InventoryTransactionType;
        userId: string;
        branchId: string;
        productId: string;
        costPrice: Prisma.Decimal;
        quantityChange: number;
        referenceType: import(".prisma/client").$Enums.InventoryReferenceType;
        referenceId: string;
        revenueAmount: Prisma.Decimal | null;
    })[]>;
}
