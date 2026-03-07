import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaymentsController {
    constructor(private readonly service: PaymentsService) { }

    @Post()
    @RequirePermissions('TAKE_PAYMENT')
    create(@Request() req: any, @Body() dto: CreatePaymentDto) {
        return this.service.create(req.user.id, req.correlationId, dto);
    }

    @Get('sale/:saleId')
    @RequirePermissions('VIEW_SALES')
    findBySale(@Param('saleId') saleId: string) {
        return this.service.findBySale(saleId);
    }
}
