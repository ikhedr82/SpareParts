import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
import { VoidSaleDto } from './dtos/void-sale.dto';
import { TranslationService } from '../i18n/translation.service';
export declare class SalesExtensionsService {
    private prisma;
    private auditService;
    private outbox;
    private t;
    private readonly request;
    constructor(prisma: PrismaService, auditService: AuditService, outbox: OutboxService, t: TranslationService, request: any);
    voidSale(tenantId: string, userId: string, saleId: string, dto: VoidSaleDto): Promise<{
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
    }>;
}
