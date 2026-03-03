import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { CreateIntentDto } from './dto/create-intent.dto';
import Stripe from 'stripe';
import { TranslationService } from '../i18n/translation.service';

@Injectable()
export class StripePaymentsService {
    private stripe: Stripe;

    constructor(
        private readonly prisma: TenantAwarePrismaService,
        private readonly t: TranslationService,
    ) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2024-12-18.acacia' as any,
        });
    }

    async createIntent(dto: CreateIntentDto) {
        const { saleId, amount, currency = 'usd' } = dto;
        const sale = await this.prisma.client.sale.findUnique({ where: { id: saleId } });
        if (!sale) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Sale' }));

        try {
            const intent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency,
                metadata: { saleId, tenantId: this.prisma.tenantId || '' },
            });

            return (this.prisma.client.stripePayment.create as any)({
                data: {
                    tenantId: this.prisma.tenantId,
                    saleId,
                    paymentIntentId: intent.id,
                    clientSecret: intent.client_secret || '',
                    amount,
                    currency,
                    status: 'PENDING',
                },
            });
        } catch (error) {
            console.error('[StripePaymentsService] Error:', error);
            throw new InternalServerErrorException(this.t.translate('errors.payments.stripe_failed', 'EN'));
        }
    }

    async confirm(paymentIntentId: string) {
        const stripePayment = await this.prisma.client.stripePayment.findUnique({
            where: { paymentIntentId },
        });

        if (!stripePayment) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Stripe payment' }));
        if (stripePayment.status === 'SUCCEEDED') return stripePayment;

        try {
            const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
            if (intent.status !== 'succeeded') {
                throw new BadRequestException(`Payment not succeeded: ${intent.status}`);
            }

            return this.prisma.client.$transaction(async (tx) => {
                const sale = await tx.sale.findUnique({
                    where: { id: stripePayment.saleId },
                    include: { payments: true },
                });
                if (!sale) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Sale' }));

                const session = await tx.cashSession.findFirst({
                    where: { branchId: sale.branchId, status: 'OPEN' },
                });

                const payment = await (tx.payment.create as any)({
                    data: {
                        tenantId: this.prisma.tenantId,
                        saleId: stripePayment.saleId,
                        sessionId: session?.id,
                        amount: stripePayment.amount,
                        method: 'STRIPE',
                        reference: paymentIntentId,
                    },
                });

                const updated = await tx.stripePayment.update({
                    where: { id: stripePayment.id },
                    data: { status: 'SUCCEEDED', paymentId: payment.id, sessionId: session?.id },
                });

                const receiptNumber = `RCP-ST-${Date.now()}-${payment.id.slice(0, 4)}`.toUpperCase();
                await (tx.receipt.create as any)({
                    data: {
                        tenantId: this.prisma.tenantId,
                        paymentId: payment.id,
                        receiptNumber,
                        amount: stripePayment.amount,
                    },
                });

                const totalPaid = sale.payments.reduce((s, p) => s + Number(p.amount), 0) + Number(stripePayment.amount);
                if (totalPaid >= Number(sale.total)) {
                    await tx.invoice.update({ where: { saleId: stripePayment.saleId }, data: { status: 'PAID' } });
                }

                return updated;
            });
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
            console.error('[StripePaymentsService] Error:', error);
            throw new InternalServerErrorException(this.t.translate('errors.payments.stripe_failed', 'EN'));
        }
    }

    async findBySale(saleId: string) {
        return this.prisma.client.stripePayment.findFirst({
            where: { saleId },
            include: { payment: true },
            orderBy: { createdAt: 'desc' },
        });
    }
}
