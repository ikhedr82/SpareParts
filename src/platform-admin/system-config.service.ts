import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SystemConfigService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.systemConfig.findMany();
    }

    async get(key: string) {
        return this.prisma.systemConfig.findUnique({
            where: { key },
        });
    }

    async set(key: string, value: string, description?: string, type?: string) {
        return this.prisma.systemConfig.upsert({
            where: { key },
            update: { value, description, type },
            create: { key, value, description, type },
        });
    }

    async remove(key: string) {
        return this.prisma.systemConfig.delete({
            where: { key },
        });
    }
}
