import { Controller, Post, Patch, Get, Param, Body, Req, UseGuards, Query } from '@nestjs/common';
import { ChargebackResolutionService } from './chargeback-resolution.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('finance/chargebacks')
export class ChargebackResolutionController {
    constructor(private readonly service: ChargebackResolutionService) { }

    @Get()
    async findAll(@Req() req: any, @Query('status') status?: any) {
        return this.service.findAll(req.user.tenantId, status);
    }

    @Patch(':id/resolve')
    async resolve(
        @Param('id') id: string, @Body() body: { notes?: string }, @Req() req: any,
    ) {
        return this.service.resolveChargeback(
            req.user.tenantId, id, req.user.sub, body.notes, req.correlationId,
        );
    }

    @Patch(':id/reject')
    async reject(
        @Param('id') id: string, @Body() body: { notes?: string }, @Req() req: any,
    ) {
        return this.service.rejectChargeback(
            req.user.tenantId, id, req.user.sub, body.notes, req.correlationId,
        );
    }
}
