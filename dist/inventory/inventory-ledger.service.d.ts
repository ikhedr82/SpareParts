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
        type: import(".prisma/client").$Enums.InventoryTransactionType;
        quantityChange: number;
        costPrice: Prisma.Decimal;
        revenueAmount: Prisma.Decimal | null;
        referenceType: import(".prisma/client").$Enums.InventoryReferenceType;
        referenceId: string;
        createdAt: Date;
        tenantId: string;
        branchId: string;
        productId: string;
        userId: string;
    }>;
    private executeInventoryLogic;
    getLedger(branchId: string, productId?: string): Promise<({
        user: {
            id: string;
            createdAt: Date;
            tenantId: string | null;
            updatedAt: Date;
            version: number;
            email: string;
            passwordHash: string;
            isPlatformUser: boolean;
            status: string;
        };
        product: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            status: string;
            brandId: string;
            categoryId: string;
            nameAr: string | null;
            description: string | null;
            descriptionAr: string | null;
            weight: number | null;
            dimensions: string | null;
            unitOfMeasure: string | null;
            images: string[];
            taxRateId: string | null;
        };
    } & {
        id: string;
        type: import(".prisma/client").$Enums.InventoryTransactionType;
        quantityChange: number;
        costPrice: Prisma.Decimal;
        revenueAmount: Prisma.Decimal | null;
        referenceType: import(".prisma/client").$Enums.InventoryReferenceType;
        referenceId: string;
        createdAt: Date;
        tenantId: string;
        branchId: string;
        productId: string;
        userId: string;
    })[]>;
}
