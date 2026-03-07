import {
    Controller,
    Post,
    Get,
    Patch,
    Body,
    Query,
    Req,
} from '@nestjs/common';
import { FulfillmentProvidersService } from './fulfillment-providers.service';
import { CreateFulfillmentProviderDto } from './dto/fulfillment.dto';
import { FulfillmentMode } from '@prisma/client';

@Controller('logistics/fulfillment-providers')
export class FulfillmentProvidersController {
    constructor(private readonly fulfillmentProvidersService: FulfillmentProvidersService) { }

    @Post()
    async create(@Req() req, @Body() dto: CreateFulfillmentProviderDto) {
        const tenantId = req.user.tenantId;
        return this.fulfillmentProvidersService.create(
            tenantId,
            dto.name,
            dto.mode,
            dto.phone,
            dto.apiEndpoint,
        );
    }

    @Get()
    async findAll(
        @Req() req,
        @Query('mode') mode?: string,
        @Query('isActive') isActive?: string,
    ) {
        const tenantId = req.user.tenantId;
        const fulfillmentMode = mode as FulfillmentMode | undefined;
        const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.fulfillmentProvidersService.findAll(tenantId, fulfillmentMode, isActiveBool);
    }

    @Patch(':id/activate')
    async activate(@Req() req, @Body('providerId') providerId: string) {
        const tenantId = req.user.tenantId;
        return this.fulfillmentProvidersService.activate(tenantId, providerId);
    }

    @Patch(':id/deactivate')
    async deactivate(@Req() req, @Body('providerId') providerId: string) {
        const tenantId = req.user.tenantId;
        return this.fulfillmentProvidersService.deactivate(tenantId, providerId);
    }
}
