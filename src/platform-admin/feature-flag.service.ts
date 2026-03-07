import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeatureFlagService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.featureFlag.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByName(name: string) {
        return this.prisma.featureFlag.findUnique({
            where: { name },
        });
    }

    async create(data: {
        name: string;
        description?: string;
        type?: string;
        value?: string;
        isGlobal?: boolean;
        tenantId?: string;
    }) {
        return this.prisma.featureFlag.create({
            data,
        });
    }

    async update(id: string, data: any) {
        return this.prisma.featureFlag.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        return this.prisma.featureFlag.delete({
            where: { id },
        });
    }

    async isEnabled(name: string, tenantId?: string): Promise<boolean> {
        const flag = await this.prisma.featureFlag.findFirst({
            where: {
                name,
                OR: [
                    { isGlobal: true },
                    { tenantId: tenantId },
                ],
                isActive: true,
            },
        });

        if (!flag) return false;
        if (flag.type === 'BOOLEAN') return flag.value === 'true';
        return !!flag.value;
    }
}
