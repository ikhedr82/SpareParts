import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CashSessionService } from './cash-session.service';
import { OpenCashSessionDto } from './dto/open-cash-session.dto';
import { CloseCashSessionDto } from './dto/close-cash-session.dto';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cash-sessions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CashSessionController {
    constructor(private readonly cashSessionService: CashSessionService) { }

    @Post('open')
    @RequirePermissions('MANAGE_BRANCH') // Or custom permission OPEN_CASH
    async open(@Body() dto: OpenCashSessionDto, @Request() req) {
        if (!dto.branchId) dto.branchId = req.user.branchId;
        return this.cashSessionService.open(dto, req.user.id);
    }

    @Post('close')
    @RequirePermissions('CLOSE_Z_REPORT') // Or custom permission CLOSE_CASH
    async close(@Body() dto: CloseCashSessionDto, @Request() req) {
        if (!dto.branchId) dto.branchId = req.user.branchId;
        return this.cashSessionService.close(dto, req.user.id);
    }

    @Get('current')
    async getCurrent(@Request() req) {
        return this.cashSessionService.getCurrent(req.user.branchId);
    }
}
