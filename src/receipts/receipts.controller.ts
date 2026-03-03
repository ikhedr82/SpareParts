import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('receipts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReceiptsController {
    constructor(private readonly receiptsService: ReceiptsService) { }

    @Get()
    @RequirePermissions('VIEW_RECEIPTS')
    findAll() {
        return this.receiptsService.findAll();
    }

    @Get(':id')
    @RequirePermissions('VIEW_RECEIPTS')
    findOne(@Param('id') id: string) {
        return this.receiptsService.findOne(id);
    }

    @Get('payment/:paymentId')
    @RequirePermissions('VIEW_RECEIPTS')
    findByPayment(@Param('paymentId') paymentId: string) {
        return this.receiptsService.findByPayment(paymentId);
    }
}
