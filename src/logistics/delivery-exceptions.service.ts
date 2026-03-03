import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeliveryExceptionType } from '@prisma/client';

@Injectable()
export class DeliveryExceptionsService {
    constructor(private prisma: PrismaService) { }

    async createException(
        tenantId: string,
        tripStopId: string,
        exceptionType: DeliveryExceptionType,
        description: string,
        reportedBy: string,
    ) {
        const tripStop = await this.prisma.tripStop.findFirst({
            where: { id: tripStopId },
            include: { trip: true },
        });

        if (!tripStop) {
            throw new NotFoundException('Trip stop not found');
        }

        if (tripStop.trip.tenantId !== tenantId) {
            throw new BadRequestException('Trip stop does not belong to this tenant');
        }

        // Create exception and update trip stop status
        return this.prisma.$transaction(async (tx) => {
            const exception = await tx.deliveryException.create({
                data: {
                    tenantId,
                    tripStopId,
                    exceptionType,
                    description,
                    reportedBy,
                    resolved: false,
                },
            });

            // Mark stop as having unresolved exception
            await tx.tripStop.update({
                where: { id: tripStopId },
                data: {
                    exceptionResolved: false,
                    failureReason: description,
                },
            });

            return exception;
        });
    }

    async resolveException(
        tenantId: string,
        exceptionId: string,
        resolutionType: string,
        notes: string,
        resolvedBy: string,
    ) {
        const exception = await this.prisma.deliveryException.findFirst({
            where: { id: exceptionId, tenantId },
            include: { tripStop: true },
        });

        if (!exception) {
            throw new NotFoundException('Exception not found');
        }

        if (exception.resolved) {
            throw new BadRequestException('Exception is already resolved');
        }

        return this.prisma.$transaction(async (tx) => {
            const updatedException = await tx.deliveryException.update({
                where: { id: exceptionId },
                data: {
                    resolved: true,
                    resolutionType,
                    resolutionNotes: notes,
                    resolvedBy,
                    resolvedAt: new Date(),
                },
            });

            // Check if there are other unresolved exceptions for this stop
            const unresolvedCount = await tx.deliveryException.count({
                where: {
                    tripStopId: exception.tripStopId,
                    resolved: false,
                },
            });

            if (unresolvedCount === 0) {
                await tx.tripStop.update({
                    where: { id: exception.tripStopId },
                    data: { exceptionResolved: true },
                });
            }

            return updatedException;
        });
    }

    async findAll(tenantId: string, resolved?: boolean, tripId?: string) {
        return this.prisma.deliveryException.findMany({
            where: {
                tenantId,
                ...(resolved !== undefined && { resolved }),
                ...(tripId && { tripStop: { tripId } }),
            },
            include: {
                tripStop: {
                    include: {
                        order: {
                            select: { orderNumber: true },
                        },
                        customer: {
                            select: { name: true },
                        },
                    },
                },
            },
            orderBy: { reportedAt: 'desc' },
        });
    }

    async getUnresolvedCount(tenantId: string) {
        return this.prisma.deliveryException.count({
            where: {
                tenantId,
                resolved: false,
            },
        });
    }
}
