import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(dto: CreateCustomerDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        tenantId: string;
        email: string | null;
        version: number;
        phone: string | null;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
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
            customerName: string | null;
            total: import("@prisma/client/runtime/library").Decimal;
            cashSessionId: string | null;
            refundedSaleId: string | null;
            customerId: string | null;
            businessClientId: string | null;
            voidReason: string | null;
            baseAmount: import("@prisma/client/runtime/library").Decimal;
            exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        tenantId: string;
        email: string | null;
        version: number;
        phone: string | null;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: string, dto: CreateCustomerDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        tenantId: string;
        email: string | null;
        version: number;
        phone: string | null;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        tenantId: string;
        email: string | null;
        version: number;
        phone: string | null;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
}
