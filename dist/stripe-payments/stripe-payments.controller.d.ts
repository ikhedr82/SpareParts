import { StripePaymentsService } from './stripe-payments.service';
import { CreateIntentDto } from './dto/create-intent.dto';
export declare class StripePaymentsController {
    private readonly stripePaymentsService;
    constructor(stripePaymentsService: StripePaymentsService);
    createIntent(dto: CreateIntentDto): Promise<any>;
    confirm(body: {
        paymentIntentId: string;
    }): Promise<{
        currency: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        version: number;
        saleId: string;
        sessionId: string | null;
        paymentId: string | null;
        paymentIntentId: string;
        clientSecret: string;
    }>;
    findBySale(saleId: string): Promise<{
        payment: {
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
        };
    } & {
        currency: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        version: number;
        saleId: string;
        sessionId: string | null;
        paymentId: string | null;
        paymentIntentId: string;
        clientSecret: string;
    }>;
}
