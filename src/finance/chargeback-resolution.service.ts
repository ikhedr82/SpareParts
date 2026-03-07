import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChargebackStatus } from '@prisma/client';
import { AuditService } from '../shared/audit.service';
import { OutboxService } from '../shared/outbox.service';
import { assertTransition, CHARGEBACK_TRANSITIONS } from '../common/guards/fsm.guard';

@Injectable()
export class ChargebackResolutionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditService: AuditService,
        private readonly outbox: OutboxService,
    ) { }

    /**
     * UC-6: Resolve a chargeback → reverse ledger entries if needed.
     * FSM: PENDING → RESOLVED
     */
    async resolveChargeback(
        tenantId: string, chargebackId: string, userId: string,
        notes?: string, correlationId?: string,
    ) {
        const chargeback = await this.prisma.chargeback.findFirst({
            where: { id: chargebackId, tenantId },
        });
        if (!chargeback) throw new NotFoundException('Chargeback not found');

        assertTransition(
            'Chargeback', chargebackId,
            chargeback.status, 'RESOLVED' as ChargebackStatus,
            CHARGEBACK_TRANSITIONS,
        );

        return this.prisma.$transaction(async (tx) => {
            // Update chargeback status
            await tx.chargeback.update({
                where: { id: chargebackId },
                data: {
                    status: 'RESOLVED' as ChargebackStatus,
                    resolvedAt: new Date(),
                },
            });

            // Create resolution record
            const resolution = await tx.chargebackResolution.create({
                data: {
                    tenantId,
                    chargebackId,
                    resolvedById: userId,
                    action: 'RESOLVED',
                    notes,
                },
            });

            // Create reversal journal entry for the chargeback amount
            const jeRef = `CB-REV-${chargebackId.substring(0, 8)}`;
            const journalEntry = await tx.journalEntry.create({
                data: {
                    tenantId,
                    reference: jeRef,
                    date: new Date(),
                    description: `Chargeback resolution reversal for CB ${chargebackId}`,
                    totalAmount: chargeback.amount,
                    status: 'POSTED',
                    isPosted: true,
                    postedAt: new Date(),
                    postedById: userId,
                    createdById: userId,
                    lines: {
                        create: [
                            {
                                accountId: (await tx.chartOfAccount.findFirst({
                                    where: { tenantId, code: '1100' },
                                }))?.id || '',
                                description: 'Chargeback reversal - AR',
                                debit: 0,
                                credit: chargeback.amount,
                            },
                            {
                                accountId: (await tx.chartOfAccount.findFirst({
                                    where: { tenantId, code: '5200' },
                                }))?.id || '',
                                description: 'Chargeback reversal - Expense',
                                debit: chargeback.amount,
                                credit: 0,
                            },
                        ],
                    },
                },
            });

            // Link resolution to journal entry
            await tx.chargebackResolution.update({
                where: { id: resolution.id },
                data: { ledgerEntryId: journalEntry.id },
            });

            await this.outbox.schedule(tx as any, {
                tenantId,
                topic: 'finance.chargeback.resolved',
                payload: { chargebackId, resolutionId: resolution.id, amount: Number(chargeback.amount) },
                correlationId,
            });

            await this.auditService.logAction(
                tenantId, userId, 'RESOLVE_CHARGEBACK', 'Chargeback', chargebackId,
                { status: chargeback.status },
                { status: 'RESOLVED', journalEntryRef: jeRef },
                correlationId, undefined, tx as any,
            );

            return { chargeback: await tx.chargeback.findUnique({ where: { id: chargebackId } }), resolution };
        });
    }

    /**
     * UC-6: Reject a chargeback.
     * FSM: PENDING → REJECTED
     */
    async rejectChargeback(
        tenantId: string, chargebackId: string, userId: string,
        notes?: string, correlationId?: string,
    ) {
        const chargeback = await this.prisma.chargeback.findFirst({
            where: { id: chargebackId, tenantId },
        });
        if (!chargeback) throw new NotFoundException('Chargeback not found');

        assertTransition(
            'Chargeback', chargebackId,
            chargeback.status, 'REJECTED' as ChargebackStatus,
            CHARGEBACK_TRANSITIONS,
        );

        return this.prisma.$transaction(async (tx) => {
            await tx.chargeback.update({
                where: { id: chargebackId },
                data: {
                    status: 'REJECTED' as ChargebackStatus,
                    resolvedAt: new Date(),
                },
            });

            const resolution = await tx.chargebackResolution.create({
                data: {
                    tenantId, chargebackId,
                    resolvedById: userId,
                    action: 'REJECTED', notes,
                },
            });

            await this.auditService.logAction(
                tenantId, userId, 'REJECT_CHARGEBACK', 'Chargeback', chargebackId,
                { status: chargeback.status }, { status: 'REJECTED' },
                correlationId, undefined, tx as any,
            );

            return { chargeback: await tx.chargeback.findUnique({ where: { id: chargebackId } }), resolution };
        });
    }

    async findAll(tenantId: string, status?: ChargebackStatus) {
        return this.prisma.chargeback.findMany({
            where: { tenantId, ...(status && { status }) },
            orderBy: { createdAt: 'desc' },
        });
    }
}
