import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VehicleType } from '@prisma/client';

@Injectable()
export class VehiclesService {
    constructor(private prisma: PrismaService) { }

    async create(
        tenantId: string,
        branchId: string,
        plateNumber: string,
        type: VehicleType,
        capacityKg?: number,
    ) {
        // Verify branch belongs to tenant
        const branch = await this.prisma.branch.findFirst({
            where: { id: branchId, tenantId },
        });

        if (!branch) {
            throw new NotFoundException('Branch not found');
        }

        return this.prisma.vehicle.create({
            data: {
                tenantId,
                branchId,
                plateNumber,
                type,
                capacityKg,
            },
        });
    }

    async findAll(tenantId: string, branchId?: string, isActive?: boolean) {
        return this.prisma.vehicle.findMany({
            where: {
                tenantId,
                ...(branchId && { branchId }),
                ...(isActive !== undefined && { isActive }),
            },
            include: {
                branch: true,
                currentTrip: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
