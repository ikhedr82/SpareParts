import { Controller, Post, Body, UseGuards, Param, Req } from '@nestjs/common';
import { AuthGuard, Roles, Permissions } from '../shared/auth.guard';
import { WarehouseService } from './warehouse.service';
import { PickItemDto } from './dtos/pick-item.dto';

@Controller('api/v1/wms/pick-lists')
@UseGuards(AuthGuard)
export class WarehouseController {
    constructor(private readonly service: WarehouseService) { }

    @Post(':id/items/:itemId/pick')
    @Roles('Warehouse Staff')
    @Permissions('PICK_ORDERS')
    async pickItem(
        @Req() req,
        @Param('id') pickListId: string,
        @Param('itemId') itemId: string,
        @Body() dto: PickItemDto
    ) {
        return this.service.pickItem(req.user.tenantId, req.user.id, pickListId, itemId, dto);
    }
}
