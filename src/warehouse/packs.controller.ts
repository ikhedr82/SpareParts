import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    UseGuards,
} from '@nestjs/common';
import { PacksService } from './packs.service';
import { AddPackItemDto, SealPackDto } from './dto/warehouse.dto';
import { AuthGuard, Roles, Permissions } from '../shared/auth.guard';

@Controller('warehouse')
@UseGuards(AuthGuard)
export class PacksController {
    constructor(private readonly packsService: PacksService) { }

    @Post('picklists/:id/create-pack')
    @Roles('Warehouse Staff', 'Warehouse Manager', 'Admin')
    @Permissions('PACK_ORDERS')
    async createPack(@Param('id') pickListId: string) {
        return this.packsService.createPack(pickListId);
    }

    @Post('packs/:id/add-item')
    @Roles('Warehouse Staff', 'Warehouse Manager', 'Admin')
    @Permissions('PACK_ORDERS')
    async addItem(@Param('id') packId: string, @Body() dto: AddPackItemDto) {
        return this.packsService.addItemToPack(packId, dto.productId, dto.quantity);
    }

    @Post('packs/:id/seal')
    @Roles('Warehouse Manager', 'Admin')
    @Permissions('SEAL_PACK')
    async seal(@Param('id') packId: string, @Body() dto: SealPackDto) {
        return this.packsService.sealPack(packId, dto.weight);
    }

    @Get('picklists/:id/packs')
    @Roles('Warehouse Staff', 'Warehouse Manager', 'Logistics Manager', 'Admin')
    @Permissions('VIEW_PICKLISTS')
    async findByPickList(@Param('id') pickListId: string) {
        return this.packsService.findByPickList(pickListId);
    }
}
