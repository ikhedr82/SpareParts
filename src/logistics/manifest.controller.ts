import { Controller, Post, Patch, Get, Param, Body, Req, UseGuards, Query } from '@nestjs/common';
import { ManifestService } from './manifest.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('logistics/manifests')
export class ManifestController {
    constructor(private readonly service: ManifestService) { }

    @Post()
    async create(@Req() req: any, @Body() body: any) {
        return this.service.createManifest(req.user.tenantId, req.user.sub, body, req.correlationId);
    }

    @Get()
    async findAll(@Req() req: any, @Query('branchId') branchId?: string, @Query('status') status?: any) {
        return this.service.findAll(req.user.tenantId, branchId, status);
    }

    @Get(':id')
    async findOne(@Req() req: any, @Param('id') id: string) {
        return this.service.findOne(req.user.tenantId, id);
    }

    @Post(':id/orders')
    async addOrders(@Req() req: any, @Param('id') id: string, @Body() body: { orderIds: string[] }) {
        return this.service.addOrders(req.user.tenantId, id, body.orderIds, req.user.sub, req.correlationId);
    }

    @Patch(':id/seal')
    async seal(@Req() req: any, @Param('id') id: string) {
        return this.service.sealManifest(req.user.tenantId, id, req.user.sub, req.correlationId);
    }

    @Patch(':id/dispatch')
    async dispatch(@Req() req: any, @Param('id') id: string, @Body() body: { tripId: string }) {
        return this.service.dispatchManifest(req.user.tenantId, id, body.tripId, req.user.sub, req.correlationId);
    }

    @Patch(':id/complete')
    async complete(@Req() req: any, @Param('id') id: string) {
        return this.service.completeManifest(req.user.tenantId, id, req.user.sub, req.correlationId);
    }
}
