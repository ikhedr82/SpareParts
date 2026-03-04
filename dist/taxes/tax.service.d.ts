import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { CreateTaxRateDto } from './dto/create-tax-rate.dto';
export declare class TaxService {
    private readonly prisma;
    constructor(prisma: TenantAwarePrismaService);
    create(dto: CreateTaxRateDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        tenantId: string;
        percentage: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        tenantId: string;
        percentage: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        tenantId: string;
        percentage: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: string, dto: CreateTaxRateDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        tenantId: string;
        percentage: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        tenantId: string;
        percentage: import("@prisma/client/runtime/library").Decimal;
    }>;
}
