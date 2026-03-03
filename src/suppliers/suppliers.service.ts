import { Injectable } from '@nestjs/common';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SuppliersService {
    constructor(private readonly prisma: TenantAwarePrismaService) { }

    async create(dto: CreateSupplierDto) {
        return this.prisma.client.supplier.create({
            data: {
                tenantId: this.prisma.tenantId,
                name: dto.name,
                balance: 0,
            },
        });
    }

    async findAll() {
        return this.prisma.client.supplier.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.client.supplier.findUnique({
            where: { id },
            include: { purchaseOrders: true },
        });
    }

    async update(id: string, dto: CreateSupplierDto) {
        return this.prisma.client.supplier.update({
            where: { id },
            data: {
                name: dto.name,
            },
        });
    }

    async remove(id: string) {
        return this.prisma.client.supplier.delete({
            where: { id },
        });
    }

    async importPriceList(supplierId: string, items: { productId: string; sku: string; cost: number; currency?: string }[]) {
        return this.prisma.client.$transaction(async (tx) => {
            const results = [];
            for (const item of items) {
                const entry = await tx.productSupplier.upsert({
                    where: {
                        supplierId_productId: {
                            supplierId,
                            productId: item.productId
                        }
                    },
                    update: {
                        supplierSku: item.sku,
                        costPrice: item.cost,
                        currency: item.currency || 'USD'
                    },
                    create: {
                        tenantId: this.prisma.tenantId,
                        supplierId,
                        productId: item.productId,
                        supplierSku: item.sku,
                        costPrice: item.cost,
                        currency: item.currency || 'USD'
                    }
                });
                results.push(entry);
            }
            return results;
        });
    }

    async getProductSuppliers(productId: string) {
        return this.prisma.client.productSupplier.findMany({
            where: { productId, tenantId: this.prisma.tenantId },
            include: { supplier: true },
            orderBy: { costPrice: 'asc' }
        });
    }
}
