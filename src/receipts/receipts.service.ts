import { Injectable } from '@nestjs/common';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';

@Injectable()
export class ReceiptsService {
    constructor(private readonly prisma: TenantAwarePrismaService) { }

    findAll() {
        return this.prisma.client.receipt.findMany({
            include: { payment: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    findOne(id: string) {
        return this.prisma.client.receipt.findUnique({
            where: { id },
            include: {
                payment: {
                    include: { sale: { include: { items: { include: { product: { select: { id: true, name: true, nameAr: true, description: true, descriptionAr: true } } } } } } }
                }
            },
        });
    }

    findByPayment(paymentId: string) {
        return this.prisma.client.receipt.findUnique({
            where: { paymentId },
        });
    }
}
