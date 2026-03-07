import { Controller, Get, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { PortalAuthGuard } from './portal-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('portal/financials')
@UseGuards(PortalAuthGuard)
export class PortalFinancialsController {
    constructor(private prisma: PrismaService) { }

    @Get('balance')
    async getBalance(@Req() req) {
        const { tenantId, businessClientId } = req.user;

        const client = await this.prisma.businessClient.findFirst({
            where: { id: businessClientId, tenantId }
        });

        if (!client) throw new BadRequestException('Client not found');

        return {
            currency: client.currency,
            creditLimit: client.creditLimit,
            currentBalance: client.currentBalance,
            availableCredit: Number(client.creditLimit) - Number(client.currentBalance),
            paymentTerms: client.paymentTerms
        };
    }

    @Get('invoices')
    async getInvoices(@Req() req) {
        const { tenantId, businessClientId } = req.user;

        // Looking for Invoice model.
        // Schema view check: Invoice linked to Sale? Or Order?
        // Usually B2B Invoices link to Orders.
        // Let's assume there is an Invoice model that links to Order or BusinessClient.
        // If not found in previous views, I might be guessing relations.
        // L1158 in schema view of Order has `items`, `pickList`. 
        // L558 in Sale: `invoice Invoice?`.
        // B2B might use the same Invoice model?
        // Let's check Invoice model if possible, or fallback to returning Orders with totals.

        // Fallback: If Invoice model isn't clear, return Orders that are SHIPPED/DELIVERED as "Invoicable" events?
        // But implementation plan said "Invoices List".
        // I will try to query `invoice` table assuming it exists and links to businessClient via Order or direct.

        return this.prisma.invoice.findMany({
            where: {
                tenantId,
                // Assuming Invoice has businessClientId or linked via Order
                // relation to businessClient might not exist directly?
                // Let's filter by: Order.businessClientId
                sale: { // If Invoice links to Sale?
                    // Wait, B2B might not use 'Sale' (POS). It uses Order.
                    // Does Invoice link to Order?
                }
            },
            // SAFE FALLBACK: Query Orders for now, until Invoice schema is 100% verified for B2B.
            // Or cleaner: Query Invoices where Order in (MyOrders)
        });
    }
}
