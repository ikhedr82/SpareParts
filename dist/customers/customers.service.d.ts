import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
export declare class CustomersService {
    private readonly prisma;
    constructor(prisma: TenantAwarePrismaService);
    create(dto: CreateCustomerDto): Promise<{
        id: string;
        name: string;
        nameAr: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        email: string | null;
        version: number;
        phone: string | null;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        nameAr: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        email: string | null;
        version: number;
        phone: string | null;
        balance: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    findOne(id: string): Promise<{
        sales: {
            currency: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            status: string;
            version: number;
            branchId: string;
            customerId: string | null;
            customerName: string | null;
            total: import("@prisma/client/runtime/library").Decimal;
            baseAmount: import("@prisma/client/runtime/library").Decimal;
            exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
            voidReason: string | null;
            cashSessionId: string | null;
            refundedSaleId: string | null;
            businessClientId: string | null;
        }[];
    } & {
        id: string;
        name: string;
        nameAr: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        email: string | null;
        version: number;
        phone: string | null;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: string, dto: CreateCustomerDto): Promise<{
        id: string;
        name: string;
        nameAr: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        email: string | null;
        version: number;
        phone: string | null;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        nameAr: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        email: string | null;
        version: number;
        phone: string | null;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
}
