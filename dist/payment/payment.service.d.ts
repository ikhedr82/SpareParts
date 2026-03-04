import { CreatePaymentDto } from './dto/create-payment.dto';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { AccountingService } from '../accounting/accounting.service';
import { AuditService } from '../shared/audit.service';
import { TranslationService } from '../i18n/translation.service';
export declare class PaymentsService {
    private readonly prisma;
    private readonly accountingService;
    private readonly auditService;
    private readonly t;
    constructor(prisma: TenantAwarePrismaService, accountingService: AccountingService, auditService: AuditService, t: TranslationService);
    create(userId: string, correlationId: string, dto: CreatePaymentDto): Promise<{
        currency: string;
        id: string;
        createdAt: Date;
        tenantId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date;
        version: number;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
        saleId: string;
        sessionId: string | null;
        method: import(".prisma/client").$Enums.PaymentMethod;
        isRefund: boolean;
        refundedPaymentId: string | null;
        reference: string | null;
    }>;
    findBySale(saleId: string): Promise<any>;
}
