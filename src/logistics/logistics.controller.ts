import { Controller, Post, Patch, Body, UseGuards, Param, Req, Request } from '@nestjs/common';
import { AuthGuard, Roles, Permissions } from '../shared/auth.guard';
import { LogisticsService } from './logistics.service';
import { CreateTripDto } from './dtos/create-trip.dto';
import { DispatchTripDto } from './dtos/dispatch-trip.dto';
import { PlanEnforcementService } from '../tenant-admin/plan-enforcement.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('logistics/trips')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LogisticsController {
    constructor(
        private readonly service: LogisticsService,
        private readonly planEnforcement: PlanEnforcementService,
    ) { }

    @Post()
    @Post()
    @RequirePermissions('MANAGE_FLEET')
    async createTrip(@Request() req, @Body() dto: CreateTripDto) {
        if (req.user?.tenantId) {
            await this.planEnforcement.checkFeatureAccess(req.user.tenantId, 'logisticsEnabled');
        }
        return this.service.createTrip(req.user.tenantId, req.user.branchId, req.user.id, dto);
    }

    @Post(':id/dispatch')
    @RequirePermissions('MANAGE_FLEET')
    async dispatchTrip(@Request() req, @Param('id') tripId: string, @Body() dto: DispatchTripDto) {
        return this.service.dispatchTrip(req.user.tenantId, req.user.id, tripId, dto);
    }
}
