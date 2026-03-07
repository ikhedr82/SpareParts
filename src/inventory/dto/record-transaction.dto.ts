import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { InventoryTransactionType, InventoryReferenceType } from '@prisma/client';

export class RecordTransactionDto {
    @IsString()
    tenantId: string;

    @IsString()
    branchId: string;

    @IsString()
    productId: string;

    @IsEnum(InventoryTransactionType)
    type: InventoryTransactionType;

    @IsNumber()
    quantityChange: number;

    @IsEnum(InventoryReferenceType)
    referenceType: InventoryReferenceType;

    @IsString()
    referenceId: string;

    @IsString()
    userId: string;

    @IsOptional()
    @IsNumber()
    unitCost?: number;
}
