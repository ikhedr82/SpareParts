import { Test, TestingModule } from '@nestjs/testing';
import { StripePaymentsService } from './stripe-payments.service';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockStripe = {
    paymentIntents: {
        create: jest.fn(),
        retrieve: jest.fn(),
    },
};

jest.mock('stripe', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => mockStripe),
    };
});

describe('StripePaymentsService', () => {
    let service: StripePaymentsService;
    let prisma: any;

    beforeEach(async () => {
        prisma = {
            tenantId: 'test-tenant-id',
            client: {
                sale: { findUnique: jest.fn() },
                stripePayment: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), findFirst: jest.fn() },
                payment: { create: jest.fn() },
                receipt: { create: jest.fn() },
                invoice: { update: jest.fn() },
                cashSession: { findFirst: jest.fn() },
                $transaction: jest.fn((cb) => cb(prisma.client)),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StripePaymentsService,
                { provide: TenantAwarePrismaService, useValue: prisma },
            ],
        }).compile();

        service = module.get<StripePaymentsService>(StripePaymentsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createIntent', () => {
        it('should create intent and record', async () => {
            prisma.client.sale.findUnique.mockResolvedValue({ id: 's1' });
            mockStripe.paymentIntents.create.mockResolvedValue({ id: 'pi1', client_secret: 'cs1' });
            prisma.client.stripePayment.create.mockResolvedValue({ id: 'sp1' });

            await service.createIntent({ saleId: 's1', amount: 100 });
            expect(mockStripe.paymentIntents.create).toHaveBeenCalled();
        });
    });

    describe('confirm', () => {
        it('should confirm and reconcile', async () => {
            prisma.client.stripePayment.findUnique.mockResolvedValue({ id: 'sp1', saleId: 's1', amount: 100, status: 'PENDING' });
            mockStripe.paymentIntents.retrieve.mockResolvedValue({ status: 'succeeded', metadata: { saleId: 's1' } });
            prisma.client.sale.findUnique.mockResolvedValue({ id: 's1', branchId: 'b1', total: 100, payments: [] });
            prisma.client.payment.create.mockResolvedValue({ id: 'p1' });

            await service.confirm('pi1');
            expect(prisma.client.payment.create).toHaveBeenCalled();
            expect(prisma.client.receipt.create).toHaveBeenCalled();
        });
    });
});
