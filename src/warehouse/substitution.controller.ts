import { Controller, Post, Patch, Get, Param, Body, Req, UseGuards, Query } from '@nestjs/common';
import { SubstitutionService } from './substitution.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('warehouse')
export class SubstitutionController {
    constructor(private readonly service: SubstitutionService) { }

    @Post('picklists/:pickListId/items/:itemId/substitution')
    async suggest(
        @Param('pickListId') pickListId: string,
        @Param('itemId') itemId: string,
        @Body() body: { substituteProductId: string; reason: string },
        @Req() req: any,
    ) {
        return this.service.suggestSubstitution(
            req.user.tenantId, itemId, body.substituteProductId, body.reason,
            req.user.sub, req.correlationId,
        );
    }

    @Patch('substitutions/:id/approve')
    async approve(@Param('id') id: string, @Req() req: any) {
        return this.service.approveSubstitution(req.user.tenantId, id, req.user.sub, req.correlationId);
    }

    @Patch('substitutions/:id/reject')
    async reject(@Param('id') id: string, @Req() req: any) {
        return this.service.rejectSubstitution(req.user.tenantId, id, req.user.sub, req.correlationId);
    }

    @Get('picklists/:pickListId/substitutions')
    async findByPickList(@Param('pickListId') pickListId: string, @Req() req: any) {
        return this.service.findByPickList(req.user.tenantId, pickListId);
    }
}
