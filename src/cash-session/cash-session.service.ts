import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { OpenCashSessionDto } from './dto/open-cash-session.dto';
import { CloseCashSessionDto } from './dto/close-cash-session.dto';

@Injectable()
export class CashSessionService {
    constructor(private readonly prisma: TenantAwarePrismaService) { }

    async open(dto: OpenCashSessionDto, userId: string) {
        // 0. Check if Z-Report exists for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const zReport = await (this.prisma.client as any).zReport.findFirst({
            where: {
                branchId: dto.branchId,
                businessDate: today,
            },
        });

        if (zReport) {
            throw new BadRequestException('Cannot open session: Z-Report already generated for today.');
        }

        // Check if there's already an open session for this branch
        const existing = await (this.prisma.client as any).cashSession.findFirst({
            where: {
                branchId: dto.branchId,
                status: 'OPEN',
            },
        });

        if (existing) {
            throw new BadRequestException('A cash session is already open for this branch');
        }

        // Create session
        return (this.prisma.client as any).cashSession.create({
            data: {
                branchId: dto.branchId,
                openedById: userId,
                openingCash: dto.openingCash,
                status: 'OPEN',
                tenantId: this.prisma.tenantId, // Ensure tenantId is set
            },
        });
    }

    async close(dto: CloseCashSessionDto, userId: string) {
        const session = await (this.prisma.client as any).cashSession.findFirst({
            where: {
                branchId: dto.branchId,
                status: 'OPEN',
            },
            include: {
                payments: true,
            },
        });

        if (!session) {
            throw new NotFoundException('No open cash session found for this branch');
        }

        const payments = session.payments as any[];

        // Calculate total cash payments (method = CASH, isRefund = false)
        const totalCashPayments = payments
            .filter(p => p.method === 'CASH' && !p.isRefund)
            .reduce((sum, p) => sum.add(new Decimal(p.amount)), new Decimal(0));

        // Calculate total cash refunds (method = CASH, isRefund = true)
        const totalCashRefunds = payments
            .filter(p => p.method === 'CASH' && p.isRefund)
            .reduce((sum, p) => sum.add(new Decimal(p.amount)), new Decimal(0));

        const openingCash = new Decimal(session.openingCash);
        
        // Expected = Opening + Cash Payments - Cash Refunds
        const expectedCash = openingCash.add(totalCashPayments).minus(totalCashRefunds);
        
        const closingCash = new Decimal(dto.closingCash);
        const difference = closingCash.minus(expectedCash);

        return (this.prisma.client as any).cashSession.update({
            where: { id: session.id },
            data: {
                closedAt: new Date(),
                closedByUserId: userId,
                closingCash: closingCash,
                expectedCash: expectedCash,
                difference: difference,
                status: 'CLOSED',
            },
        });
    }

    async getCurrent(branchId: string) {
        return (this.prisma.client as any).cashSession.findFirst({
            where: {
                branchId,
                status: 'OPEN',
            },
            include: {
                payments: true,
            },
        });
    }
}
