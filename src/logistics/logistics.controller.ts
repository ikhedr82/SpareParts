import { Controller, Post, Patch, Body, UseGuards, Param, Req, Request } from '@nestjs/common';
import { AuthGuard, Roles, Permissions } from '../shared/auth.guard';
import { LogisticsService } from './logistics.service';
import { CreateTripDto } from './dtos/create-trip.dto';
import { DispatchTripDto } from './dtos/dispatch-trip.dto';
import { PlanEnforcementService } from '../tenant-admin/plan-enforcement.service';

@Controller('api/v1/logistics/trips')
@UseGuards(AuthGuard)
export class LogisticsController {
    constructor(
        private readonly service: LogisticsService,
        private readonly planEnforcement: PlanEnforcementService,
    ) { }

    @Post()
    @Roles('Logistics Manager', 'Admin')
    @Permissions('MANAGE_FLEET')
    async createTrip(@Req() req, @Body() dto: CreateTripDto) {
        if (req.user?.tenantId) {
            await this.planEnforcement.checkFeatureAccess(req.user.tenantId, 'logisticsEnabled');
        }
        // Assuming branchId is on user or passed (using tenant/branch from user)
        return this.service.createTrip(req.user.tenantId, req.user.branchId, req.user.id, dto);
    }

    @Post(':id/dispatch') // Or PATCH
    @Roles('Logistics Manager', 'Admin')
    @Permissions('MANAGE_FLEET')
    async dispatchTrip(@Req() req, @Param('id') tripId: string, @Body() dto: DispatchTripDto) {
        return this.service.dispatchTrip(req.user.tenantId, req.user.id, tripId, dto);
    }
}
