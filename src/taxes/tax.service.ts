import { Injectable } from '@nestjs/common';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { CreateTaxRateDto } from './dto/create-tax-rate.dto';

@Injectable()
export class TaxService {
    constructor(private readonly prisma: TenantAwarePrismaService) { }

    async create(dto: CreateTaxRateDto) {
        return this.prisma.client.taxRate.create({
            data: {
                tenantId: this.prisma.tenantId,
                name: dto.name,
                percentage: dto.percentage,
            },
        });
    }

    async findAll() {
        return this.prisma.client.taxRate.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.client.taxRate.findUnique({
            where: { id },
        });
    }

    async update(id: string, dto: CreateTaxRateDto) {
        return this.prisma.client.taxRate.update({
            where: { id },
            data: {
                name: dto.name,
                percentage: dto.percentage,
            },
        });
    }

    async remove(id: string) {
        return this.prisma.client.taxRate.delete({
            where: { id },
        });
    }
}
