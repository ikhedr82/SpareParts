import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { TranslationService } from '../i18n/translation.service';

@Injectable()
export class ZReportsService {
    constructor(
        private readonly prisma: TenantAwarePrismaService,
        private readonly t: TranslationService,
    ) { }

    async closeDay(branchId: string, closingCash: number) {
        // 1. Check if Z-Report already exists for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingReport = await this.prisma.client.zReport.findFirst({
            where: {
                branchId,
                businessDate: today,
            },
        });

        if (existingReport) {
            throw new ConflictException(this.t.translate('errors.accounting.report_already_generated', 'EN'));
        }

        return this.prisma.client.$transaction(async (tx) => {
            // 2. Find and Close OPEN Cash Session
            const openSession = await tx.cashSession.findFirst({
                where: {
                    branchId,
                    status: 'OPEN',
                },
            });

            let openingCash = 0;

            if (openSession) {
                openingCash = Number(openSession.openingCash);
                await tx.cashSession.update({
                    where: { id: openSession.id },
                    data: {
                        status: 'CLOSED',
                        closedAt: new Date(),
                        closingCash,
                        difference: closingCash - (Number(openSession.expectedCash) || 0), // Simplification
                    },
                });
            }

            // 3. Aggregate Data for Today (From midnight to now)
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(); // now

            // Sales Total
            const salesAgg = await tx.sale.aggregate({
                where: {
                    branchId,
                    createdAt: { gte: startOfDay, lte: endOfDay },
                },
                _sum: { total: true },
            });

            // Returns Total
            // Fetch all returns for today and sum their items' value.
            // Since ReturnItem doesn't have price, we assume refund is based on original sale price or current price.
            // Given constraints, we'll fetch ReturnItems and their related Product (if price is on Product) or SaleItem (if price is on SaleItem).
            // Schema check: ReturnItem links to Product. Return links to Sale. 
            // We need to know the price at which it was returned.
            // If Return schema doesn't store price/value, we might have to approximate or fetch from SaleItem.
            // Let's look up sale items matching the product for that sale.
            // This is complex O(N). For now, let's assume `Return` has no total and we must sum `Product.price` or similar?
            // Wait, standard POS usually stores `refundAmount` on Return.
            // If not present, I will sum (Quantity * Product.sellingPrice) as a best-effort "value of goods returned".
            // OR finding the SaleItem for that product in that sale.

            const returns = await tx.return.findMany({
                where: {
                    branchId,
                    createdAt: { gte: startOfDay, lte: endOfDay },
                },
                include: {
                    returnItems: {
                        include: {
                            product: true
                        }
                    },
                    sale: {
                        include: {
                            items: true
                        }
                    }
                }
            });

            let totalReturns = 0;
            for (const r of returns) {
                for (const rItem of r.returnItems) {
                    // Find original sale price for this product
                    const originalSaleItem = r.sale.items.find(si => si.productId === rItem.productId);
                    const price = originalSaleItem ? Number(originalSaleItem.price) : 0; // Fallback to 0 if not found (shouldn't happen)
                    totalReturns += (rItem.quantity * price);
                }
            }

            // Opening Cash: Sum of all sessions opened today
            const sessionsToday = await tx.cashSession.findMany({
                where: {
                    branchId,
                    openedAt: { gte: startOfDay, lte: endOfDay },
                },
            });

            openingCash = sessionsToday.reduce((sum, session) => sum + Number(session.openingCash), 0);


            // Payments Total by Method
            const payments = await tx.payment.findMany({
                where: {
                    sale: { branchId }, // Payments linked to sales of this branch
                    createdAt: { gte: startOfDay, lte: endOfDay },
                },
            });

            let cashSales = 0;
            let cardSales = 0;
            let transferSales = 0;

            for (const p of payments) {
                const amount = Number(p.amount);
                if (p.method === 'CASH') cashSales += amount;
                else if (p.method === 'CARD') cardSales += amount;
                else if (p.method === 'TRANSFER') transferSales += amount;
            }

            const totalPayments = cashSales + cardSales + transferSales;
            const totalSales = Number(salesAgg._sum.total || 0);

            // Calculate Expected Cash
            // Logic: Start with total opening cash + cash sales
            // Note: Does not account for cash drops/payouts if those aren't in schema yet.
            const expectedCash = openingCash + cashSales;
            const difference = closingCash - expectedCash;

            // 4. Create Z-Report
            const zReport = await tx.zReport.create({
                data: {
                    tenantId: this.prisma.tenantId,
                    branchId,
                    businessDate: today,
                    totalSales,
                    totalReturns,
                    totalPayments,
                    cashSales,
                    cardSales,
                    transferSales,
                    openingCash,
                    expectedCash,
                    closingCash,
                    difference,
                },
            });

            return zReport;
        });
    }

    async findAll(branchId: string) {
        return this.prisma.client.zReport.findMany({
            where: { branchId },
            orderBy: { businessDate: 'desc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.client.zReport.findUnique({
            where: { id },
        });
    }
}
