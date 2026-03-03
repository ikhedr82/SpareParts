import {
    Controller,
    Post,
    Get,
    Body,
    Query,
    Req,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/logistics.dto';

@Controller('logistics/vehicles')
export class VehiclesController {
    constructor(private readonly vehiclesService: VehiclesService) { }

    @Post()
    async create(@Req() req, @Body() dto: CreateVehicleDto) {
        const tenantId = req.user.tenantId;
        return this.vehiclesService.create(
            tenantId,
            dto.branchId,
            dto.plateNumber,
            dto.type,
            dto.capacityKg,
        );
    }

    @Get()
    async findAll(
        @Req() req,
        @Query('branchId') branchId?: string,
        @Query('isActive') isActive?: string,
    ) {
        const tenantId = req.user.tenantId;
        const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.vehiclesService.findAll(tenantId, branchId, isActiveBool);
    }
}
