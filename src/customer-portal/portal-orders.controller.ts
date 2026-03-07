import { Controller, Get, Post, Body, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { PortalAuthGuard } from './portal-auth.guard';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service'; // Using untypped service for now or need generic
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { CreateOrderDto } from '../orders/dto/create-order.dto';

@Controller('portal/orders')
@UseGuards(PortalAuthGuard)
export class PortalOrdersController {
    constructor(
        private prisma: PrismaService,
        private ordersService: OrdersService
    ) { }

    @Get()
    async findAll(@Req() req) {
        const { tenantId, businessClientId } = req.user;

        return this.prisma.order.findMany({
            where: {
                tenantId,
                businessClientId, // Strict scoping
            },
            include: {
                items: true,
                deliveryAddress: true,
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    @Get(':id')
    async findOne(@Req() req, @Param('id') id: string) {
        const { tenantId, businessClientId } = req.user;

        const order = await this.prisma.order.findFirst({
            where: {
                id,
                tenantId,
                businessClientId // Strict scoping
            },
            include: {
                items: { include: { product: true } },
                deliveryAddress: true,
                tripStops: { include: { trip: true } }, // Tracking info
            }
        });

        if (!order) {
            throw new BadRequestException('Order not found or access denied');
        }

        return order;
    }

    @Post()
    async create(@Req() req, @Body() dto: CreateOrderDto) {
        const { tenantId, businessClientId, id: userId } = req.user;

        // Force the DTO to use the authenticated client ID
        // The DTO might have businessClientId, but we override it for safety
        const safeDto = {
            ...dto,
            businessClientId,
            // We might need to ensure the service uses the correct user context
        };

        // OrdersService.create() logic might need adaptation to accept 'createdById' if not present
        // For now assuming the service extracts from context or we pass it?
        // Looking at OrdersService, it uses `businessClientId` from DTO.
        // It doesn't seem to take `createdById` for the Order itself, maybe `createdById` is on Order?
        // Let's check Order model. defined: no `createdById` on Order in schema view I saw earlier? 
        // Wait, Order model has `contactId`?

        // We will trust OrdersService for now, but ensure we pass the right DTO.
        if (dto.businessClientId && dto.businessClientId !== businessClientId) {
            throw new BadRequestException('Cannot place order for another client');
        }

        return this.ordersService.create(safeDto);
    }
}
