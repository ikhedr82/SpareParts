import { Controller, Post, Patch, Get, Body, Param, Query, Req } from '@nestjs/common';
import { DeliveryExceptionsService } from './delivery-exceptions.service';
import { CreateDeliveryExceptionDto, ResolveExceptionDto } from './dto/exceptions.dto';

@Controller('logistics/exceptions')
export class DeliveryExceptionsController {
    constructor(private readonly service: DeliveryExceptionsService) { }

    @Post()
    async createException(@Req() req, @Body() dto: CreateDeliveryExceptionDto) {
        const tenantId = req.user.tenantId;
        return this.service.createException(
            tenantId,
            dto.tripStopId,
            dto.exceptionType,
            dto.description,
            req.user.id, // Reported by currently logged in user
        );
    }

    @Patch(':id/resolve')
    async resolveException(
        @Req() req,
        @Param('id') id: string,
        @Body() dto: ResolveExceptionDto,
    ) {
        const tenantId = req.user.tenantId;
        // Assuming resolution notes are optional in DTO but needed here
        return this.service.resolveException(
            tenantId,
            id,
            dto.resolutionType,
            dto.resolutionNotes || '',
            req.user.id,
        );
    }

    @Get()
    async findAll(@Req() req, @Query('resolved') resolved?: string, @Query('tripId') tripId?: string) {
        const tenantId = req.user.tenantId;
        const isResolved = resolved === 'true' ? true : resolved === 'false' ? false : undefined;
        return this.service.findAll(tenantId, isResolved, tripId);
    }

    @Get('unresolved/count')
    async getUnresolvedCount(@Req() req) {
        const tenantId = req.user.tenantId;
        const count = await this.service.getUnresolvedCount(tenantId);
        return { count };
    }
}
