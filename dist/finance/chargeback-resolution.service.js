"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChargebackResolutionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../shared/audit.service");
const outbox_service_1 = require("../shared/outbox.service");
const fsm_guard_1 = require("../common/guards/fsm.guard");
let ChargebackResolutionService = class ChargebackResolutionService {
    constructor(prisma, auditService, outbox) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.outbox = outbox;
    }
    async resolveChargeback(tenantId, chargebackId, userId, notes, correlationId) {
        const chargeback = await this.prisma.chargeback.findFirst({
            where: { id: chargebackId, tenantId },
        });
        if (!chargeback)
            throw new common_1.NotFoundException('Chargeback not found');
        (0, fsm_guard_1.assertTransition)('Chargeback', chargebackId, chargeback.status, 'RESOLVED', fsm_guard_1.CHARGEBACK_TRANSITIONS);
        return this.prisma.$transaction(async (tx) => {
            var _a, _b;
            await tx.chargeback.update({
                where: { id: chargebackId },
                data: {
                    status: 'RESOLVED',
                    resolvedAt: new Date(),
                },
            });
            const resolution = await tx.chargebackResolution.create({
                data: {
                    tenantId,
                    chargebackId,
                    resolvedById: userId,
                    action: 'RESOLVED',
                    notes,
                },
            });
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
                                accountId: ((_a = (await tx.chartOfAccount.findFirst({
                                    where: { tenantId, code: '1100' },
                                }))) === null || _a === void 0 ? void 0 : _a.id) || '',
                                description: 'Chargeback reversal - AR',
                                debit: 0,
                                credit: chargeback.amount,
                            },
                            {
                                accountId: ((_b = (await tx.chartOfAccount.findFirst({
                                    where: { tenantId, code: '5200' },
                                }))) === null || _b === void 0 ? void 0 : _b.id) || '',
                                description: 'Chargeback reversal - Expense',
                                debit: chargeback.amount,
                                credit: 0,
                            },
                        ],
                    },
                },
            });
            await tx.chargebackResolution.update({
                where: { id: resolution.id },
                data: { ledgerEntryId: journalEntry.id },
            });
            await this.outbox.schedule(tx, {
                tenantId,
                topic: 'finance.chargeback.resolved',
                payload: { chargebackId, resolutionId: resolution.id, amount: Number(chargeback.amount) },
                correlationId,
            });
            await this.auditService.logAction(tenantId, userId, 'RESOLVE_CHARGEBACK', 'Chargeback', chargebackId, { status: chargeback.status }, { status: 'RESOLVED', journalEntryRef: jeRef }, correlationId, undefined, tx);
            return { chargeback: await tx.chargeback.findUnique({ where: { id: chargebackId } }), resolution };
        });
    }
    async rejectChargeback(tenantId, chargebackId, userId, notes, correlationId) {
        const chargeback = await this.prisma.chargeback.findFirst({
            where: { id: chargebackId, tenantId },
        });
        if (!chargeback)
            throw new common_1.NotFoundException('Chargeback not found');
        (0, fsm_guard_1.assertTransition)('Chargeback', chargebackId, chargeback.status, 'REJECTED', fsm_guard_1.CHARGEBACK_TRANSITIONS);
        return this.prisma.$transaction(async (tx) => {
            await tx.chargeback.update({
                where: { id: chargebackId },
                data: {
                    status: 'REJECTED',
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
            await this.auditService.logAction(tenantId, userId, 'REJECT_CHARGEBACK', 'Chargeback', chargebackId, { status: chargeback.status }, { status: 'REJECTED' }, correlationId, undefined, tx);
            return { chargeback: await tx.chargeback.findUnique({ where: { id: chargebackId } }), resolution };
        });
    }
    async findAll(tenantId, status) {
        return this.prisma.chargeback.findMany({
            where: Object.assign({ tenantId }, (status && { status })),
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.ChargebackResolutionService = ChargebackResolutionService;
exports.ChargebackResolutionService = ChargebackResolutionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        outbox_service_1.OutboxService])
], ChargebackResolutionService);
//# sourceMappingURL=chargeback-resolution.service.js.map