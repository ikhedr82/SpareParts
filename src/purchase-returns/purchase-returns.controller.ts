import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard, Roles, Permissions } from '../shared/auth.guard';
import { PurchaseReturnsService } from './purchase-returns.service';
import { CreatePurchaseReturnDto } from './dtos/create-return.dto';
import { RejectReturnDto } from './dtos/reject-return.dto';

@Controller('api/v1/purchase-returns')
@UseGuards(AuthGuard)
export class PurchaseReturnsController {
    constructor(private readonly service: PurchaseReturnsService) { }

    @Get()
    @Roles('Admin', 'Manager', 'Inventory Manager')
    @Permissions('VIEW_PURCHASE_RETURNS')
    async findAll(@Req() req) {
        return this.service.findAll(req.user.tenantId);
    }

    @Get(':id')
    @Roles('Admin', 'Manager', 'Inventory Manager')
    @Permissions('VIEW_PURCHASE_RETURNS')
    async findOne(@Req() req, @Param('id') id: string) {
        return this.service.findOne(req.user.tenantId, id);
    }

    @Post()
    @Roles('Admin', 'Inventory Manager')
    @Permissions('CREATE_PURCHASE_RETURN')
    async createReturn(@Req() req, @Body() dto: CreatePurchaseReturnDto) {
        return this.service.createReturn(req.user.tenantId, req.user.id, dto);
    }

    @Post(':id/approve')
    @Roles('Admin', 'Manager')
    @Permissions('APPROVE_PURCHASE_RETURN')
    async approveReturn(@Req() req, @Param('id') id: string) {
        return this.service.approveReturn(req.user.tenantId, req.user.id, id);
    }

    @Post(':id/reject')
    @Roles('Admin', 'Manager')
    @Permissions('APPROVE_PURCHASE_RETURN')
    async rejectReturn(@Req() req, @Param('id') id: string, @Body() dto: RejectReturnDto) {
        return this.service.rejectReturn(req.user.tenantId, req.user.id, id, dto.reason);
    }

    @Post(':id/ship')
    @Roles('Admin', 'Inventory Manager')
    @Permissions('MANAGE_PURCHASE_RETURNS')
    async shipReturn(@Req() req, @Param('id') id: string) {
        return this.service.shipReturn(req.user.tenantId, req.user.id, id);
    }

    @Post(':id/complete')
    @Roles('Admin')
    @Permissions('MANAGE_PURCHASE_RETURNS')
    async completeReturn(@Req() req, @Param('id') id: string) {
        return this.service.completeReturn(req.user.tenantId, req.user.id, id);
    }
}
