import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('purchase-orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PurchaseOrdersController {
    constructor(private readonly purchaseOrdersService: PurchaseOrdersService) { }

    @Post()
    @RequirePermissions('CREATE_PURCHASE_ORDER')
    create(@Body() dto: CreatePurchaseOrderDto, @Request() req) {
        if (!dto.branchId) {
            dto.branchId = req.user.branchId;
        }
        return this.purchaseOrdersService.create(req.user.id, dto);
    }

    @Get()
    @RequirePermissions('VIEW_INVENTORY')
    findAll(@Request() req) {
        return this.purchaseOrdersService.findAll(req.user.tenantId, req.user.branchId);
    }

    @Get(':id')
    @RequirePermissions('VIEW_INVENTORY')
    findOne(@Param('id') id: string, @Request() req) {
        return this.purchaseOrdersService.findOne(id, req.user.tenantId);
    }

    @Post(':id/receive')
    @RequirePermissions('RECEIVE_STOCK')
    receive(@Param('id') id: string, @Body() body: { items: { productId: string; quantity: number }[], freightCost?: number }, @Request() req) {
        return this.purchaseOrdersService.receive(req.user.id, id, body.items, body.freightCost);
    }
}
