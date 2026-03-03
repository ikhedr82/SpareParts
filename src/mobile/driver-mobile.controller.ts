import { Controller, Get, Post, Body, Param, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('mobile/delivery')
@UseGuards(JwtAuthGuard)
export class DriverMobileController {
    constructor(private prisma: PrismaService) { }

    @Get('route')
    async getRoute(@Request() req) {
        // Find active trip for this driver
        return this.prisma.deliveryTrip.findFirst({
            where: {
                tenantId: req.user.tenantId,
                driverId: req.user.id,
                status: { in: ['PLANNED', 'IN_TRANSIT'] }
            },
            include: {
                stops: {
                    orderBy: { sequence: 'asc' },
                    include: {
                        order: {
                            include: {
                                businessClient: true,
                                deliveryAddress: true
                            }
                        }
                    }
                }
            }
        });
    }

    @Post('stop/:id/complete')
    async completeStop(@Request() req, @Param('id') stopId: string, @Body() body: { signature?: string; photo?: string; lat?: number; lng?: number; notes?: string }) {
        return this.prisma.$transaction(async (tx) => {
            const stop = await tx.tripStop.findUnique({ where: { id: stopId } });
            if (!stop) throw new NotFoundException('Stop not found');

            // 1. Create POD
            await tx.proofOfDelivery.create({
                data: {
                    tripStopId: stopId,
                    signatureUrl: body.signature,
                    photoUrl: body.photo,
                    locationLat: body.lat,
                    locationLng: body.lng,
                    notes: body.notes
                }
            });

            // 2. Update Stop
            await tx.tripStop.update({
                where: { id: stopId },
                data: {
                    status: 'DELIVERED', // Was COMPLETED
                    completedAt: new Date()
                }
            });

            // 3. Update Order Status
            if (stop.orderId) {
                await tx.order.update({
                    where: { id: stop.orderId },
                    data: { status: 'DELIVERED' }
                });
            }

            return { success: true };
        });
    }
}
