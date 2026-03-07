import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    Body,
    UseGuards,
    Req,
} from '@nestjs/common';
import { PickListsService } from './picklists.service';
import { PickItemDto } from './dto/warehouse.dto';
import { AuthGuard, Roles, Permissions } from '../shared/auth.guard';

@Controller('warehouse/picklists')
@UseGuards(AuthGuard)
export class PickListsController {
    constructor(private readonly pickListsService: PickListsService) { }

    @Get()
    @Roles('Warehouse Staff', 'Warehouse Manager', 'Admin')
    @Permissions('VIEW_PICKLISTS')
    async findAll(
        @Req() req,
        @Query('branchId') branchId?: string,
        @Query('status') status?: string,
    ) {
        return this.pickListsService.findAll(req.user.tenantId, branchId, status as any);
    }

    @Get(':id')
    @Roles('Warehouse Staff', 'Warehouse Manager', 'Admin')
    @Permissions('VIEW_PICKLISTS')
    async findOne(@Req() req, @Param('id') id: string) {
        return this.pickListsService.findOne(id, req.user.tenantId);
    }

    @Post(':id/start')
    @Roles('Warehouse Staff', 'Warehouse Manager', 'Admin')
    @Permissions('PICK_ORDERS')
    async startPicking(@Req() req, @Param('id') id: string) {
        return this.pickListsService.startPicking(id, req.user.id, req.correlationId, req.user.tenantId);
    }

    @Post(':id/pick-item')
    @Roles('Warehouse Staff', 'Warehouse Manager', 'Admin')
    @Permissions('PICK_ORDERS')
    async pickItem(@Req() req, @Param('id') id: string, @Body() dto: PickItemDto) {
        return this.pickListsService.pickItem(id, dto.pickListItemId, dto.pickedQty);
    }

    @Post(':id/cancel')
    @Roles('Warehouse Manager', 'Admin')
    @Permissions('CANCEL_PICKLIST')
    async cancel(@Req() req, @Param('id') id: string) {
        return this.pickListsService.cancelPickList(id, req.user.tenantId);
    }
}
