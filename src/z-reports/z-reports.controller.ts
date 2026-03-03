import { Controller, Post, Body, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ZReportsService } from './z-reports.service';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('z-reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ZReportsController {
    constructor(private readonly zReportsService: ZReportsService) { }

    @Post('close-day')
    @RequirePermissions('CLOSE_Z_REPORT')
    async closeDay(@Body() body: { branchId: string; closingCash: number }) {
        return this.zReportsService.closeDay(body.branchId, body.closingCash);
    }

    @Get()
    @RequirePermissions('VIEW_Z_REPORT')
    async findAll(@Query('branchId') branchId: string) {
        return this.zReportsService.findAll(branchId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.zReportsService.findOne(id);
    }
}
