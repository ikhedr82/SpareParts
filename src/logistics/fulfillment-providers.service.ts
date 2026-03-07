import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FulfillmentMode } from '@prisma/client';

@Injectable()
export class FulfillmentProvidersService {
    constructor(private prisma: PrismaService) { }

    async create(
        tenantId: string,
        name: string,
        mode: FulfillmentMode,
        phone?: string,
        apiEndpoint?: string,
    ) {
        return this.prisma.fulfillmentProvider.create({
            data: {
                tenantId,
                name,
                mode,
                phone,
                apiEndpoint,
            },
        });
    }

    async findAll(tenantId: string, mode?: FulfillmentMode, isActive?: boolean) {
        return this.prisma.fulfillmentProvider.findMany({
            where: {
                tenantId,
                ...(mode && { mode }),
                ...(isActive !== undefined && { isActive }),
            },
            include: {
                _count: {
                    select: {
                        trips: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async activate(tenantId: string, providerId: string) {
        const provider = await this.prisma.fulfillmentProvider.findFirst({
            where: { id: providerId, tenantId },
        });

        if (!provider) {
            throw new NotFoundException('Fulfillment provider not found');
        }

        return this.prisma.fulfillmentProvider.update({
            where: { id: providerId },
            data: { isActive: true },
        });
    }

    async deactivate(tenantId: string, providerId: string) {
        const provider = await this.prisma.fulfillmentProvider.findFirst({
            where: { id: providerId, tenantId },
            include: {
                trips: {
                    where: {
                        status: {
                            in: ['PLANNED', 'LOADING', 'IN_TRANSIT'],
                        },
                    },
                },
            },
        });

        if (!provider) {
            throw new NotFoundException('Fulfillment provider not found');
        }

        if (provider.trips.length > 0) {
            throw new BadRequestException('Cannot deactivate provider with active trips');
        }

        return this.prisma.fulfillmentProvider.update({
            where: { id: providerId },
            data: { isActive: false },
        });
    }
}
