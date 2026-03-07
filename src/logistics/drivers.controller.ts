import {
    Controller,
    Post,
    Get,
    Patch,
    Param,
    Body,
    Query,
    Req,
} from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/logistics.dto';

@Controller('logistics/drivers')
export class DriversController {
    constructor(private readonly driversService: DriversService) { }

    @Post()
    async create(@Req() req, @Body() dto: CreateDriverDto) {
        const tenantId = req.user.tenantId;
        return this.driversService.create(tenantId, dto.branchId, dto.name, dto.phone);
    }

    @Get()
    async findAll(
        @Req() req,
        @Query('branchId') branchId?: string,
        @Query('isActive') isActive?: string,
    ) {
        const tenantId = req.user.tenantId;
        const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.driversService.findAll(tenantId, branchId, isActiveBool);
    }

    @Patch(':id/activate')
    async activate(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.driversService.activate(tenantId, id);
    }

    @Patch(':id/deactivate')
    async deactivate(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.driversService.deactivate(tenantId, id);
    }
}
