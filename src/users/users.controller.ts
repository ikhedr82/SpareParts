import { Controller, Get, Post, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';

@Controller('api/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @RequirePermissions('MANAGE_USERS')
    async create(@Body() body: any, @Request() req) {
        if (!req.user.tenantId) throw new ForbiddenException('Tenant context required');
        return this.usersService.create(req.user.tenantId, body.email, body.password, body.roleId);
    }

    @Get()
    @RequirePermissions('MANAGE_USERS')
    async findAll(@Request() req) {
        if (!req.user.tenantId) throw new ForbiddenException('Tenant context required');
        return this.usersService.findAll(req.user.tenantId);
    }
}
