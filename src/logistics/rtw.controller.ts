import { Controller, Post, Get, Param, Body, Req, UseGuards, Query } from '@nestjs/common';
import { ReturnToWarehouseService } from './rtw.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('logistics/trips/:tripId/stops/:stopId')
export class ReturnToWarehouseController {
    constructor(private readonly rtwService: ReturnToWarehouseService) { }

    @Post('return-to-warehouse')
    async returnToWarehouse(
        @Param('tripId') tripId: string,
        @Param('stopId') stopId: string,
        @Body() body: { reason: string },
        @Req() req: any,
    ) {
        return this.rtwService.returnToWarehouse(
            req.user.tenantId, tripId, stopId,
            body.reason, req.user.sub,
            req.correlationId,
        );
    }
}

@UseGuards(JwtAuthGuard)
@Controller('logistics/rtw')
export class RtwListController {
    constructor(private readonly rtwService: ReturnToWarehouseService) { }

    @Get()
    async findAll(@Req() req: any, @Query('branchId') branchId?: string) {
        return this.rtwService.findAll(req.user.tenantId, branchId);
    }
}
