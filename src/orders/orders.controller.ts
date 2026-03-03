import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { OrderStatus } from '@prisma/client';

// ✅ API Gate: JwtAuthGuard + PermissionsGuard on every route
@Controller('orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @RequirePermissions('CREATE_ORDER')
    create(@Req() req, @Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(createOrderDto);
    }

    @Get()
    @RequirePermissions('VIEW_ORDERS')
    findAll(
        @Req() req,
        @Query('businessClientId') businessClientId?: string,
        @Query('status') status?: OrderStatus,
    ) {
        // ✅ Tenant Isolation: tenantId scoped via ordersService
        return this.ordersService.findAll(businessClientId, status);
    }

    @Get(':id')
    @RequirePermissions('VIEW_ORDERS')
    findOne(@Req() req, @Param('id') id: string) {
        return this.ordersService.findOne(id);
    }

    @Patch(':id/status')
    @RequirePermissions('UPDATE_ORDER_STATUS')
    updateStatus(@Req() req, @Param('id') id: string, @Body() updateOrderStatusDto: UpdateOrderStatusDto) {
        return this.ordersService.updateStatus(req.user.tenantId, id, updateOrderStatusDto, req.user.id);
    }

    @Post(':id/cancel')
    @RequirePermissions('CANCEL_ORDER')
    cancel(@Req() req, @Param('id') id: string) {
        return this.ordersService.cancel(req.user.tenantId, id, req.user.id);
    }
}
