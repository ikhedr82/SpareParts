import { PrismaService } from '../prisma/prisma.service';
export declare class PortalFinancialsController {
    private prisma;
    constructor(prisma: PrismaService);
    getBalance(req: any): Promise<{
        currency: string;
        creditLimit: import("@prisma/client/runtime/library").Decimal;
        currentBalance: import("@prisma/client/runtime/library").Decimal;
        availableCredit: number;
        paymentTerms: string;
    }>;
    getInvoices(req: any): Promise<{
        currency: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        version: number;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
        businessClientId: string | null;
        saleId: string;
        invoiceNumber: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        issuedAt: Date;
    }[]>;
}
