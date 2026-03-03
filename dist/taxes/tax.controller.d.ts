import { TaxService } from './tax.service';
import { CreateTaxRateDto } from './dto/create-tax-rate.dto';
export declare class TaxController {
    private readonly taxService;
    constructor(taxService: TaxService);
    create(dto: CreateTaxRateDto): Promise<{
        id: string;
        name: string;
        nameAr: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        percentage: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        nameAr: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        percentage: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        nameAr: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        percentage: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: string, dto: CreateTaxRateDto): Promise<{
        id: string;
        name: string;
        nameAr: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        percentage: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        nameAr: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        percentage: import("@prisma/client/runtime/library").Decimal;
    }>;
}
