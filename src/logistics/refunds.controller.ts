import { Controller, Post, Patch, Get, Body, Param, Query, Req } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { CreateRefundDto, CancelRefundDto } from './dto/exceptions.dto'; // Reusing from combined dto file
import { RefundStatus } from '@prisma/client';

@Controller('logistics/refunds')
export class RefundsController {
    constructor(private readonly service: RefundsService) { }

    @Post()
    async createRefund(@Req() req, @Body() dto: CreateRefundDto) {
        const tenantId = req.user.tenantId;
        return this.service.createRefund(
            tenantId,
            dto.orderId,
            dto.amount,
            dto.reason,
            req.user.id,
            dto.returnId,
        );
    }

    @Patch(':id/process')
    async processRefund(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.service.processRefund(tenantId, id, req.user.id);
    }

    @Get()
    async findAll(@Req() req, @Query('status') status?: string, @Query('orderId') orderId?: string) {
        const tenantId = req.user.tenantId;
        const refundStatus = status as RefundStatus | undefined;
        return this.service.findAll(tenantId, refundStatus, orderId);
    }
}
