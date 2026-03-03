import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { RefundSaleDto } from './dto/refund-sale.dto';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sales')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    @Post()
    @RequirePermissions('CREATE_SALE')
    create(@Body() dto: CreateSaleDto, @Request() req: any) {
        if (!dto.branchId) {
            dto.branchId = req.user.branchId;
        }
        return this.salesService.create(req.user.id, dto);
    }

    @Get()
    @RequirePermissions('VIEW_SALES')
    findAll(@Request() req: any) {
        return this.salesService.findAll(req.user.tenantId);
    }

    @Get(':id')
    @RequirePermissions('VIEW_SALES')
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.salesService.findOne(id, req.user.tenantId);
    }

    @Post('refund')
    @RequirePermissions('REFUND_SALE')
    async refund(@Body() dto: RefundSaleDto, @Request() req) {
        return this.salesService.refundSale(req.user.id, dto);
    }

    @Post('void')
    @RequirePermissions('VOID_SALE')
    async voidSale(@Body('saleId') saleId: string, @Request() req) {
        return this.salesService.voidSale(req.user.id, saleId);
    }
}
