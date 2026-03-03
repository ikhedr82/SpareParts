import { Controller, Post, Get, Param, Body, Req, UseGuards } from '@nestjs/common';
import { PartialFulfillmentService } from './partial-fulfillment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('orders/:orderId/partial-fulfill')
export class PartialFulfillmentController {
    constructor(private readonly service: PartialFulfillmentService) { }

    @Post()
    async partialFulfill(
        @Param('orderId') orderId: string,
        @Body() body: { lines: { orderItemId: string; fulfilledQty: number }[] },
        @Req() req: any,
    ) {
        return this.service.partialFulfill(
            req.user.tenantId, orderId, req.user.sub,
            body.lines, req.correlationId,
        );
    }

    @Get()
    async getFulfillmentLines(@Param('orderId') orderId: string, @Req() req: any) {
        return this.service.getFulfillmentLines(req.user.tenantId, orderId);
    }
}
