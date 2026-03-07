import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { DeliveryTripsService } from './delivery-trips.service';
import {
    CreateTripDto,
    AddTripStopDto,
    AddTripPackDto,
    CompleteStopDto,
} from './dto/logistics.dto';
import { AssignProviderDto, ManualDeliveryDto } from './dto/fulfillment.dto';
import { DeliveryTripStatus } from '@prisma/client';
import { AuthGuard, Roles, Permissions } from '../shared/auth.guard';

@Controller('logistics')
@UseGuards(AuthGuard)
export class DeliveryTripsController {
    constructor(private readonly deliveryTripsService: DeliveryTripsService) { }

    @Post('trips')
    @Roles('Logistics Manager', 'Admin')
    @Permissions('MANAGE_FLEET')
    async createTrip(@Req() req, @Body() dto: CreateTripDto) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.createTrip(
            tenantId,
            dto.branchId,
            dto.mode,
            dto.driverId,
            dto.vehicleId,
            dto.fulfillmentProviderId,
        );
    }

    @Post('trips/:id/assign-provider')
    @Roles('Logistics Manager', 'Admin')
    @Permissions('MANAGE_FLEET')
    async assignProvider(@Req() req, @Param('id') tripId: string, @Body() dto: AssignProviderDto) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.assignProvider(tenantId, tripId, dto.providerId);
    }

    @Post('trips/:id/add-pack')
    @Roles('Logistics Manager', 'Warehouse Manager', 'Admin')
    @Permissions('MANAGE_FLEET')
    async addPack(@Req() req, @Param('id') tripId: string, @Body() dto: AddTripPackDto) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.addPack(tenantId, tripId, dto.packId);
    }

    @Post('trips/:id/add-stop')
    @Roles('Logistics Manager', 'Admin')
    @Permissions('MANAGE_FLEET')
    async addStop(@Req() req, @Param('id') tripId: string, @Body() dto: AddTripStopDto) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.addStop(
            tenantId,
            tripId,
            dto.orderId,
            dto.supplierId,
            dto.customerId,
        );
    }

    @Post('trips/:id/start-loading')
    @Roles('Logistics Manager', 'Warehouse Manager', 'Admin')
    @Permissions('MANAGE_FLEET')
    async startLoading(@Req() req, @Param('id') tripId: string) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.startLoading(tenantId, tripId);
    }

    @Post('trips/:id/start')
    @Roles('Logistics Manager', 'Admin')
    @Permissions('MANAGE_FLEET')
    async startTrip(@Req() req, @Param('id') tripId: string) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.startTrip(tenantId, tripId);
    }

    @Post('stops/:id/arrive')
    @Roles('Driver', 'Logistics Manager', 'Admin')
    @Permissions('COMPLETE_DELIVERY')
    async arriveAtStop(@Req() req, @Param('id') stopId: string) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.arriveAtStop(tenantId, stopId);
    }

    @Post('stops/:id/manual-arrival')
    @Roles('Logistics Manager', 'Admin')
    @Permissions('MANAGE_FLEET')
    async manualArrival(@Req() req, @Param('id') stopId: string) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.manualArrival(tenantId, stopId);
    }

    @Post('stops/:id/complete')
    @Roles('Driver', 'Logistics Manager', 'Admin')
    @Permissions('COMPLETE_DELIVERY')
    async completeStop(@Req() req, @Param('id') stopId: string, @Body() dto: CompleteStopDto) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.completeStop(tenantId, stopId, dto.success, req.user.id);
    }

    @Post('stops/:id/manual-delivery')
    @Roles('Logistics Manager', 'Admin')
    @Permissions('MANAGE_FLEET')
    async manualDelivery(@Req() req, @Param('id') stopId: string, @Body() dto: ManualDeliveryDto) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.manualDelivery(tenantId, stopId, dto.success, req.user.id, dto.notes);
    }

    @Post('trips/:id/complete')
    @Roles('Logistics Manager', 'Admin')
    @Permissions('MANAGE_FLEET')
    async completeTrip(@Req() req, @Param('id') tripId: string) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.completeTrip(tenantId, tripId, req.user.id);
    }

    @Post('trips/:id/fail')
    @Roles('Logistics Manager', 'Admin')
    @Permissions('MANAGE_FLEET')
    async failTrip(@Req() req, @Param('id') tripId: string, @Body() body: { reason: string }) {
        const tenantId = req.user.tenantId;
        return this.deliveryTripsService.failTrip(tenantId, tripId, body.reason);
    }

    @Get('trips')
    @Roles('Logistics Manager', 'Admin', 'Driver')
    @Permissions('VIEW_FLEET')
    async findAll(
        @Req() req,
        @Query('branchId') branchId?: string,
        @Query('status') status?: string,
    ) {
        const tenantId = req.user.tenantId;
        const tripStatus = status as DeliveryTripStatus | undefined;
        return this.deliveryTripsService.findAll(tenantId, branchId, tripStatus);
    }
}
