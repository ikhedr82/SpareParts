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
exports.CashSessionService = void 0;
const common_1 = require("@nestjs/common");
const library_1 = require("@prisma/client/runtime/library");
const tenant_aware_prisma_service_1 = require("../prisma/tenant-aware-prisma.service");
let CashSessionService = class CashSessionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async open(dto, userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const zReport = await this.prisma.client.zReport.findFirst({
            where: {
                branchId: dto.branchId,
                businessDate: today,
            },
        });
        if (zReport) {
            throw new common_1.BadRequestException('Cannot open session: Z-Report already generated for today.');
        }
        const existing = await this.prisma.client.cashSession.findFirst({
            where: {
                branchId: dto.branchId,
                status: 'OPEN',
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('A cash session is already open for this branch');
        }
        return this.prisma.client.cashSession.create({
            data: {
                branchId: dto.branchId,
                openedById: userId,
                openingCash: dto.openingCash,
                status: 'OPEN',
                tenantId: this.prisma.tenantId,
            },
        });
    }
    async close(dto, userId) {
        const session = await this.prisma.client.cashSession.findFirst({
            where: {
                branchId: dto.branchId,
                status: 'OPEN',
            },
            include: {
                payments: true,
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('No open cash session found for this branch');
        }
        const payments = session.payments;
        const totalCashPayments = payments
            .filter(p => p.method === 'CASH' && !p.isRefund)
            .reduce((sum, p) => sum.add(new library_1.Decimal(p.amount)), new library_1.Decimal(0));
        const totalCashRefunds = payments
            .filter(p => p.method === 'CASH' && p.isRefund)
            .reduce((sum, p) => sum.add(new library_1.Decimal(p.amount)), new library_1.Decimal(0));
        const openingCash = new library_1.Decimal(session.openingCash);
        const expectedCash = openingCash.add(totalCashPayments).minus(totalCashRefunds);
        const closingCash = new library_1.Decimal(dto.closingCash);
        const difference = closingCash.minus(expectedCash);
        return this.prisma.client.cashSession.update({
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
    async getCurrent(branchId) {
        return this.prisma.client.cashSession.findFirst({
            where: {
                branchId,
                status: 'OPEN',
            },
            include: {
                payments: true,
            },
        });
    }
};
exports.CashSessionService = CashSessionService;
exports.CashSessionService = CashSessionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_aware_prisma_service_1.TenantAwarePrismaService])
], CashSessionService);
//# sourceMappingURL=cash-session.service.js.map