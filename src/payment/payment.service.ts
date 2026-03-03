import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { AccountingService, ACCOUNT_CODES } from '../accounting/accounting.service';
import { AuditService } from '../shared/audit.service';
import { TranslationService } from '../i18n/translation.service';

@Injectable()
export class PaymentsService {
    constructor(
        private readonly prisma: TenantAwarePrismaService,
        private readonly accountingService: AccountingService,
        private readonly auditService: AuditService,
        private readonly t: TranslationService,
    ) { }

    async create(userId: string, correlationId: string, dto: CreatePaymentDto) {
        // Sale must exist and belong to tenant (auto filtered)
        const sale = await this.prisma.client.sale.findFirst({
            where: { id: dto.saleId },
            include: { payments: true },
        });

        if (!sale) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Sale' }));

        // 0. Check if Z-Report exists for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const zReport = await (this.prisma.client as any).zReport.findFirst({
            where: {
                branchId: sale.branchId,
                businessDate: today,
            },
        });

        if (zReport) {
            throw new BadRequestException(this.t.translate('errors.sales.session_already_closed', 'EN'));
        }

        // Check for open cash session for this branch
        const session = await this.prisma.client.cashSession.findFirst({
            where: {
                branchId: sale.branchId,
                status: 'OPEN',
            },
        });

        if (!session) {
            throw new BadRequestException(this.t.translate('errors.sales.no_open_session', 'EN'));
        }

        const totalPaid = (sale.payments as any[]).reduce(
            (sum: number, p: any) => sum + Number(p.amount),
            0,
        );

        const remaining = Number(sale.total) - totalPaid;

        if (dto.amount > remaining) {
            throw new BadRequestException(this.t.translate('errors.sales.refund_exceeds_total', 'EN'));
        }

        return this.prisma.client.$transaction(async (tx) => {
            const payment = await tx.payment.create({
                data: {
                    tenantId: this.prisma.tenantId, // Add tenantId for type safety
                    saleId: dto.saleId,
                    sessionId: session.id,
                    amount: dto.amount,
                    method: dto.method,
                    reference: dto.reference,
                },
            });

            // 1. Auto-create Receipt
            const receiptNumber = `RCP-${Date.now()}-${payment.id.slice(0, 4)}`.toUpperCase();
            await tx.receipt.create({
                data: {
                    tenantId: this.prisma.tenantId, // Add tenantId for type safety
                    paymentId: payment.id,
                    receiptNumber,
                    amount: dto.amount,
                },
            });

            // 2. Check if Invoice is fully settled
            const newTotalPaid = totalPaid + Number(dto.amount);
            if (newTotalPaid >= Number(sale.total)) {
                await tx.invoice.update({
                    where: { saleId: dto.saleId },
                    data: { status: 'PAID' },
                });
            }

            // 3. Update Customer Balance (Credit)
            if (sale.customerId) {
                await tx.customer.update({
                    where: { id: sale.customerId },
                    data: {
                        balance: { decrement: dto.amount }
                    }
                });
            }

            // 4. Accounting: Post Payment Journal
            // Dr Cash on Hand (1000) (or Bank based on method?)
            //    Cr Accounts Receivable (1100)
            const debitAccount = dto.method === 'CASH' ? ACCOUNT_CODES.CASH_ON_HAND :
                dto.method === 'TRANSFER' ? ACCOUNT_CODES.BANK_ACCOUNT :
                    dto.method === 'CARD' ? ACCOUNT_CODES.BANK_ACCOUNT : ACCOUNT_CODES.CASH_ON_HAND; // Default to Cash

            await this.accountingService.createSystemJournalEntryByCode({
                date: new Date(),
                reference: `PAY-${payment.id}`,
                description: `Payment for Sale ${sale.id} (${dto.method})`,
                lines: [
                    { accountCode: debitAccount, debit: dto.amount, credit: 0 },
                    { accountCode: ACCOUNT_CODES.ACCOUNTS_RECEIVABLE, debit: 0, credit: dto.amount }
                ]
            }, tx, this.prisma.tenantId);

            // ✅ Audit Gate: Log payment creation
            await this.auditService.logAction(
                this.prisma.tenantId,
                userId,
                'CREATE_PAYMENT',
                'Payment',
                payment.id,
                null,
                { amount: dto.amount, method: dto.method, saleId: dto.saleId },
                correlationId,
            );

            return payment;
        });
    }

    async findBySale(saleId: string) {
        return (this.prisma.client as any).payment.findMany({
            where: { saleId },
        });
    }
}
