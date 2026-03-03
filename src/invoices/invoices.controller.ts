import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('invoices')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Get()
    @RequirePermissions('VIEW_INVOICES')
    findAll() {
        return this.invoicesService.findAll();
    }

    @Get(':id')
    @RequirePermissions('VIEW_INVOICES')
    findOne(@Param('id') id: string) {
        return this.invoicesService.findOne(id);
    }

    @Get('sale/:saleId')
    @RequirePermissions('VIEW_INVOICES')
    findBySale(@Param('saleId') saleId: string) {
        return this.invoicesService.findBySale(saleId);
    }
}
