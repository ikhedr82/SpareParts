import { Injectable } from '@nestjs/common';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
    constructor(private readonly prisma: TenantAwarePrismaService) { }

    async create(dto: CreateCustomerDto) {
        return this.prisma.client.customer.create({
            data: {
                tenantId: this.prisma.tenantId,
                name: dto.name,
                phone: dto.phone,
                email: dto.email,
                balance: 0,
            },
        });
    }

    async findAll() {
        return this.prisma.client.customer.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.client.customer.findUnique({
            where: { id },
            include: { sales: true },
        });
    }

    async update(id: string, dto: CreateCustomerDto) {
        return this.prisma.client.customer.update({
            where: { id },
            data: {
                name: dto.name,
                phone: dto.phone,
                email: dto.email,
            },
        });
    }

    async remove(id: string) {
        return this.prisma.client.customer.delete({
            where: { id },
        });
    }
}
