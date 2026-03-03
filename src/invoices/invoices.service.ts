import { Injectable } from '@nestjs/common';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';

@Injectable()
export class InvoicesService {
    constructor(private readonly prisma: TenantAwarePrismaService) { }

    findAll() {
        return this.prisma.client.invoice.findMany({
            include: { sale: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    findOne(id: string) {
        return this.prisma.client.invoice.findUnique({
            where: { id },
            include: {
                sale: {
                    include: { items: { include: { product: { select: { id: true, name: true, nameAr: true, description: true, descriptionAr: true } } } } }
                }
            },
        });
    }

    findBySale(saleId: string) {
        return this.prisma.client.invoice.findUnique({
            where: { saleId },
        });
    }
}
