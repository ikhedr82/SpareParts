import { Controller, Post, Patch, Get, Param, Body, Req, UseGuards, Query } from '@nestjs/common';
import { BranchTransferService } from './branch-transfer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('inventory/branch-transfers')
export class BranchTransferController {
    constructor(private readonly service: BranchTransferService) { }

    @Post()
    async create(@Req() req: any, @Body() body: any) {
        return this.service.createTransfer(
            req.user.tenantId, req.user.sub, body, req.correlationId,
        );
    }

    @Get()
    async findAll(@Req() req: any, @Query('branchId') branchId?: string, @Query('status') status?: any) {
        return this.service.findAll(req.user.tenantId, branchId, status);
    }

    @Get(':id')
    async findOne(@Req() req: any, @Param('id') id: string) {
        return this.service.findOne(req.user.tenantId, id);
    }

    @Patch(':id/approve')
    async approve(@Req() req: any, @Param('id') id: string) {
        return this.service.approveTransfer(req.user.tenantId, id, req.user.sub, req.correlationId);
    }

    @Patch(':id/ship')
    async ship(@Req() req: any, @Param('id') id: string) {
        return this.service.shipTransfer(req.user.tenantId, id, req.user.sub, req.correlationId);
    }

    @Patch(':id/receive')
    async receive(@Req() req: any, @Param('id') id: string, @Body() body: { items: { itemId: string; receivedQty: number }[] }) {
        return this.service.receiveTransfer(req.user.tenantId, id, req.user.sub, body.items, req.correlationId);
    }
}
