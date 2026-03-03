import { Controller, Post, Get, Param, Body, Req, UseGuards } from '@nestjs/common';
import { UserOffboardingService } from './user-offboarding.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/users')
export class UserOffboardingController {
    constructor(private readonly service: UserOffboardingService) { }

    @Get()
    async findAll(@Req() req: any) {
        return this.service.findAll(req.user.tenantId);
    }

    @Post(':id/offboard')
    async offboard(
        @Param('id') id: string,
        @Body() body: { reason: string },
        @Req() req: any,
    ) {
        return this.service.offboardUser(
            req.user.tenantId, id, req.user.sub,
            body.reason, req.correlationId,
        );
    }
}
