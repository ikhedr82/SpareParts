import { PaymentsService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsController {
    private readonly service;
    constructor(service: PaymentsService);
    create(req: any, dto: CreatePaymentDto): Promise<{
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
