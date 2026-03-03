"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const analytics_service_1 = require("./analytics.service");
const tenant_aware_prisma_service_1 = require("../prisma/tenant-aware-prisma.service");
describe('AnalyticsService', () => {
    let service;
    let prisma;
    beforeEach(async () => {
        prisma = {
            tenantId: 'test-tenant-id',
            client: {
                sale: {
                    aggregate: jest.fn(),
                    findMany: jest.fn(),
                    groupBy: jest.fn(),
                },
                inventory: {
                    findMany: jest.fn(),
                    count: jest.fn(),
                },
                invoice: {
                    findMany: jest.fn(),
                },
                payment: {
                    groupBy: jest.fn(),
                    findMany: jest.fn(),
                },
                saleItem: {
                    groupBy: jest.fn(),
                },
                product: {
                    findMany: jest.fn(),
                },
                $transaction: jest.fn((cb) => cb(prisma.client)),
            },
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                analytics_service_1.AnalyticsService,
                { provide: tenant_aware_prisma_service_1.TenantAwarePrismaService, useValue: prisma },
            ],
        }).compile();
        service = module.get(analytics_service_1.AnalyticsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('getDashboardKPIs', () => {
        it('should calculate revenue and count low stock', async () => {
            prisma.client.sale.aggregate.mockResolvedValue({
                _sum: { total: 1000 },
                _count: { id: 10 },
            });
            prisma.client.inventory.findMany.mockResolvedValue([{ quantity: 5, sellingPrice: 100 }]);
            prisma.client.invoice.findMany.mockResolvedValue([{ amount: 200 }]);
            prisma.client.payment.groupBy.mockResolvedValue([
                { method: 'CASH', _sum: { amount: 600 } },
                { method: 'CARD', _sum: { amount: 400 } },
            ]);
            prisma.client.inventory.count.mockResolvedValue(5);
            const result = await service.getDashboardKPIs();
            expect(result.kpis.revenue).toBe(1000);
            expect(result.kpis.lowStockAlerts).toBe(5);
            expect(result.kpis.unpaidInvoicesCount).toBe(1);
            expect(result.kpis.unpaidInvoicesTotal).toBe(200);
            expect(result.payments).toHaveLength(2);
        });
    });
    describe('getSalesReports', () => {
        it('should aggregate sales by date', async () => {
            var _a, _b;
            const mockSales = [
                { createdAt: new Date('2026-02-01T10:00:00Z'), total: 100 },
                { createdAt: new Date('2026-02-01T15:00:00Z'), total: 150 },
                { createdAt: new Date('2026-02-02T10:00:00Z'), total: 200 },
            ];
            prisma.client.sale.findMany.mockResolvedValue(mockSales);
            const result = await service.getSalesReports('monthly');
            expect(result).toHaveLength(2);
            expect((_a = result.find(r => r.date === '2026-02-01')) === null || _a === void 0 ? void 0 : _a.total).toBe(250);
            expect((_b = result.find(r => r.date === '2026-02-02')) === null || _b === void 0 ? void 0 : _b.total).toBe(200);
        });
    });
});
//# sourceMappingURL=analytics.service.spec.js.map