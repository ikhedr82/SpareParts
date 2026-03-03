import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PriceEngineService } from '../pricing/price-engine.service';
import { TranslationService } from '../../i18n/translation.service';
import { QuoteStatus } from '@prisma/client';

@Injectable()
export class QuotationsService {
    constructor(
        private prisma: PrismaService,
        private priceEngine: PriceEngineService,
        private t: TranslationService,
    ) { }

    async create(userId: string, tenantId: string, dto: any) {
        const { businessClientId, validUntil, items } = dto;

        return this.prisma.$transaction(async (tx) => {
            // 1. Calculate Prices for all items using Price Engine
            let subtotal = 0;
            const quoteItems = [];

            for (const item of items) {
                const pricing = await this.priceEngine.calculatePrice({
                    tenantId,
                    productId: item.productId,
                    businessClientId,
                    quantity: item.quantity
                });

                const lineTotal = pricing.finalPrice * item.quantity;
                subtotal += lineTotal;

                quoteItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: pricing.finalPrice
                });
            }

            // 2. Tax Calculation (Simplified, usually from TaxService)
            const tax = subtotal * 0.10; // Dummy 10%
            const total = subtotal + tax;

            // 3. Create Quote
            const quote = await tx.quote.create({
                data: {
                    tenantId,
                    quoteNumber: `QT-${Date.now()}`,
                    businessClientId,
                    createdById: userId,
                    validUntil: new Date(validUntil),
                    subtotal,
                    tax,
                    total,
                    status: QuoteStatus.DRAFT,
                    items: {
                        create: quoteItems
                    }
                },
                include: { items: true }
            });

            return quote;
        });
    }

    async convertToOrder(quoteId: string, userId: string) {
        // Logic to copy Quote -> Order
        // Reuse OrdersService.create? 
        // Or manually create Order to ensure EXACT prices are copied (OrdersService might recalculate).
        // Crucial: Must respect the Quoted Unit Price, NOT current market price.

        const quote = await this.prisma.quote.findUnique({
            where: { id: quoteId },
            include: { items: true, businessClient: true }
        });

        if (!quote) throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Quote' }));
        if (quote.status !== QuoteStatus.SENT && quote.status !== QuoteStatus.ACCEPTED) {
            throw new BadRequestException(this.t.translate('errors.quotes.not_convertible', 'EN'));
        }

        // Check expiry
        if (new Date() > quote.validUntil) throw new BadRequestException(this.t.translate('errors.quotes.expired', 'EN'));

        return this.prisma.$transaction(async (tx) => {
            // 1. Create Order
            const order = await tx.order.create({
                data: {
                    tenantId: quote.tenantId,
                    orderNumber: `ORD-${quote.quoteNumber}-C`, // Linked ID
                    businessClientId: quote.businessClientId,
                    branchId: quote.businessClient.tenantId, // Fallback, usually Quote has BranchId too?
                    status: 'PENDING',
                    subtotal: quote.subtotal,
                    tax: quote.tax,
                    total: quote.total,
                    items: {
                        create: quote.items.map(i => ({
                            productId: i.productId,
                            quantity: i.quantity,
                            unitPrice: i.unitPrice // LOCK IN PRICE
                        }))
                    }
                }
            });

            // 2. Update Quote Status
            await tx.quote.update({
                where: { id: quoteId },
                data: { status: QuoteStatus.CONVERTED }
            });

            return order;
        });
    }
}
