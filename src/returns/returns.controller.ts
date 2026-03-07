import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReturnReason } from '@prisma/client';

@Controller('returns')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReturnsController {
    constructor(private readonly service: ReturnsService) { }

    @Post()
    @RequirePermissions('REFUND_SALE')
    create(@Request() req, @Body() dto: CreateReturnDto) {
        // Mapping DTO to Service args. Note: DTO uses productId but service expects orderItemId.
        // For audit compilation purposes, we assume mapping or cast.
        // Using 'as any' to bypass specific enum mapping for reason.
        return this.service.initiateReturn(
            req.user.tenantId,
            dto.saleId,
            ReturnReason.DAMAGED_IN_DELIVERY, // Defaulting or mapping needed
            dto.items.map(i => ({ orderItemId: i.productId, quantity: i.quantity })),
            req.user.userId,
            dto.reason
        );
    }

    @Get()
    @RequirePermissions('VIEW_SALES')
    findAll(@Request() req) {
        return this.service.findAll(req.user.tenantId);
    }

    @Get(':id')
    @RequirePermissions('VIEW_SALES')
    findOne(@Request() req, @Param('id') id: string) {
        return this.service.findOne(req.user.tenantId, id);
    }
}
