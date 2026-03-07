import { Controller, Get, Param, UseGuards, Post, Body, Request } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';

@Controller('branches')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BranchesController {
    constructor(private readonly branchesService: BranchesService) { }

    @Get()
    findAll() {
        return this.branchesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.branchesService.findOne(id);
    }

    @Post()
    @RequirePermissions('MANAGE_BRANCH')
    async create(@Body() body: any, @Request() req) {
        return this.branchesService.create(req.user.tenantId, body);
    }
}
