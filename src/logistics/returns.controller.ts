import { Controller, Post, Patch, Get, Body, Param, Query, Req } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { InitiateReturnDto, RejectReturnDto, ReceiveReturnDto } from './dto/exceptions.dto';
import { ReturnStatus } from '@prisma/client';

@Controller('logistics/returns')
export class ReturnsController {
    constructor(private readonly service: ReturnsService) { }

    @Post()
    async initiateReturn(@Req() req, @Body() dto: InitiateReturnDto) {
        const tenantId = req.user.tenantId;
        return this.service.initiateReturn(
            tenantId,
            dto.orderId,
            dto.reason,
            dto.items,
            req.user.id,
            dto.reasonNotes,
            dto.deliveryExceptionId,
        );
    }

    @Patch(':id/approve')
    async approveReturn(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.service.approveReturn(tenantId, id, req.user.id);
    }

    @Patch(':id/reject')
    async rejectReturn(@Req() req, @Param('id') id: string, @Body() dto: RejectReturnDto) {
        const tenantId = req.user.tenantId;
        return this.service.rejectReturn(tenantId, id, req.user.id, dto.reason);
    }

    @Patch(':id/receive')
    async receiveReturn(@Req() req, @Param('id') id: string, @Body() dto: ReceiveReturnDto) {
        const tenantId = req.user.tenantId;
        return this.service.receiveReturn(tenantId, id, dto.items, req.user.id);
    }

    @Patch(':id/complete')
    async completeReturn(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.service.completeReturn(tenantId, id, req.user.id);
    }

    @Get()
    async findAll(@Req() req, @Query('status') status?: string, @Query('orderId') orderId?: string) {
        const tenantId = req.user.tenantId;
        const returnStatus = status as ReturnStatus | undefined;
        return this.service.findAll(tenantId, returnStatus, orderId);
    }
}
