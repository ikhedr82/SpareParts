import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Post()
    @RequirePermissions('ADJUST_STOCK')
    create(@Body() createInventoryDto: CreateInventoryDto, @Request() req) {
        return this.inventoryService.create(req.user.id, createInventoryDto);
    }

    @Post('adjust')
    @RequirePermissions('ADJUST_STOCK')
    adjust(@Body() dto: AdjustInventoryDto, @Request() req) {
        return this.inventoryService.adjustStock(req.user.id, dto);
    }

    @Get()
    @RequirePermissions('VIEW_INVENTORY')
    findAll(
        @Query('branchId') branchId?: string,
        @Query('search') search?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.inventoryService.findAll({
            branchId,
            search,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 25,
        });
    }

    @Get('ledger')
    @RequirePermissions('VIEW_INVENTORY')
    getLedger(@Query('productId') productId: string, @Query('branchId') branchId?: string) {
        return this.inventoryService.getLedger(productId, branchId);
    }

    @Get(':id')
    @RequirePermissions('VIEW_INVENTORY')
    findOne(@Param('id') id: string) {
        return this.inventoryService.findOne(id);
    }

    @Patch(':id')
    @RequirePermissions('ADJUST_STOCK')
    update(@Param('id') id: string, @Body() updateInventoryDto: UpdateInventoryDto, @Request() req) {
        return this.inventoryService.update(id, req.user.id, updateInventoryDto);
    }

    @Delete(':id')
    @RequirePermissions('ADJUST_STOCK')
    remove(@Param('id') id: string, @Request() req) {
        return this.inventoryService.remove(id, req.user.id);
    }
}
