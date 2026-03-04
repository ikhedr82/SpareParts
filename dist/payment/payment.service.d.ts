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
        id: string;
        tenantId: string;
        createdAt: Date;
        version: number;
        currency: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        baseAmount: import("@prisma/client/runtime/library").Decimal;
        exchangeRateUsed: import("@prisma/client/runtime/library").Decimal;
        saleId: string;
        paidAt: Date;
        sessionId: string | null;
        method: import(".prisma/client").$Enums.PaymentMethod;
        isRefund: boolean;
        refundedPaymentId: string | null;
        reference: string | null;
    }>;
    findBySale(saleId: string): Promise<any>;
}
