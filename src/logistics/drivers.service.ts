import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DriversService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, branchId: string, name: string, phone: string) {
        // Verify branch belongs to tenant
        const branch = await this.prisma.branch.findFirst({
            where: { id: branchId, tenantId },
        });

        if (!branch) {
            throw new NotFoundException('Branch not found');
        }

        return this.prisma.driver.create({
            data: {
                tenantId,
                branchId,
                name,
                phone,
            },
        });
    }

    async findAll(tenantId: string, branchId?: string, isActive?: boolean) {
        return this.prisma.driver.findMany({
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

    async activate(tenantId: string, driverId: string) {
        const driver = await this.prisma.driver.findFirst({
            where: { id: driverId, tenantId },
        });

        if (!driver) {
            throw new NotFoundException('Driver not found');
        }

        return this.prisma.driver.update({
            where: { id: driverId },
            data: { isActive: true },
        });
    }

    async deactivate(tenantId: string, driverId: string) {
        const driver = await this.prisma.driver.findFirst({
            where: { id: driverId, tenantId },
        });

        if (!driver) {
            throw new NotFoundException('Driver not found');
        }

        // Check if driver has an active trip
        if (driver.currentTripId) {
            throw new BadRequestException('Cannot deactivate driver with an active trip');
        }

        return this.prisma.driver.update({
            where: { id: driverId },
            data: { isActive: false },
        });
    }
}
