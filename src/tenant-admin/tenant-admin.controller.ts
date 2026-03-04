import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { TenantAdminService } from './tenant-admin.service';
import { AuditService } from '../shared/audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { assertPlatformAdmin } from '../auth/utils/auth-utils';
import { SuspendTenantDto } from './dtos/suspend-tenant.dto';
import { UpdateTenantLanguageDto } from './dto/update-tenant-language.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';
import { CreateCurrencyDto, UpdateCurrencyDto } from './dto/currency.dto';
import { CreateExchangeRateDto } from './dto/exchange-rate.dto';

@Controller('api/platform/tenants')
@UseGuards(JwtAuthGuard)
export class TenantAdminController {
    constructor(private readonly service: TenantAdminService) { }

    @Post()
    async create(@Body() dto: CreateTenantDto, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.createTenant(req.user.id, dto);
    }

    @Post(':id/suspend')
    async suspend(@Param('id') id: string, @Body() dto: SuspendTenantDto, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.suspendTenant(req.user.id, id, dto);
    }

    @Post(':id/reactivate')
    async reactivate(@Param('id') id: string, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.reactivateTenant(req.user.id, id);
    }

    @Get()
    async findAll(
        @Request() req,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('status') status?: string,
        @Query('planId') planId?: string,
    ) {
        assertPlatformAdmin(req.user);
        return this.service.findAll({ page, limit, search, status, planId });
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.findOne(id);
    }

    @Get(':id/invoices')
    async getTenantInvoices(@Param('id') id: string, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.getTenantInvoices(id);
    }

    @Get(':id/activity')
    async getTenantActivity(@Param('id') id: string, @Query('limit') limit: number, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.getTenantActivity(id, limit);
    }

    @Patch(':id/language')
    async updateLanguage(@Param('id') id: string, @Body() dto: UpdateTenantLanguageDto, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.updateLanguageSettings(req.user.id, id, dto);
    }

    @Get('billing/stats')
    async getStats(@Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.getGlobalBillingStats();
    }

    @Get('billing/activity')
    async getGlobalBillingActivity(@Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.getGlobalBillingActivity();
    }

    @Get('billing/invoices')
    async getGlobalInvoices(
        @Request() req,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
    ) {
        assertPlatformAdmin(req.user);
        return this.service.getGlobalInvoices({ page, limit, search });
    }

    @Patch(':id/plan')
    async changePlan(@Param('id') id: string, @Body('planId') planId: string, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.changeTenantPlan(req.user.id, id, planId);
    }
}

@Controller('api/platform/support')
@UseGuards(JwtAuthGuard)
export class SupportController {
    constructor(private readonly service: TenantAdminService) { }

    @Post()
    async create(@Body() dto: { subject: string; description: string; priority: string; tenantId?: string }, @Request() req) {
        // Platform admins can create tickets for any tenant or platform-wide (null tenantId)
        assertPlatformAdmin(req.user);
        return this.service.createSupportTicket(req.user.id, dto.tenantId || null, dto.subject, dto.description, dto.priority);
    }

    @Get()
    async findAll(
        @Request() req,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('status') status?: string,
    ) {
        assertPlatformAdmin(req.user);
        return this.service.findAllTickets({ page, limit, search, status });
    }

    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body('status') status: string, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.updateTicketStatus(req.user.id, id, status);
    }
}

@Controller('api/platform/users')
@UseGuards(JwtAuthGuard)
export class PlatformUsersController {
    constructor(private readonly service: TenantAdminService) { }

    @Get()
    async findAll(
        @Request() req,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
    ) {
        assertPlatformAdmin(req.user);
        return this.service.findAllUsers({ page, limit, search });
    }
}

@Controller('api/platform/plans')
@UseGuards(JwtAuthGuard)
export class PlansController {
    constructor(private readonly service: TenantAdminService) { }

    @Post()
    async create(@Body() dto: CreatePlanDto, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.createPlan(req.user.id, dto);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdatePlanDto, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.updatePlan(req.user.id, id, dto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.deletePlan(req.user.id, id);
    }

    @Get()
    async findAll(@Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.findAllPlans();
    }
}

@Controller('api/platform/currencies')
@UseGuards(JwtAuthGuard)
export class CurrenciesController {
    constructor(private readonly service: TenantAdminService) { }

    @Post()
    async create(@Body() dto: CreateCurrencyDto, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.createCurrency(req.user.id, dto);
    }

    @Patch(':code')
    async update(@Param('code') code: string, @Body() dto: UpdateCurrencyDto, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.updateCurrency(req.user.id, code, dto);
    }

    @Get()
    async findAll(
        @Request() req,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
    ) {
        assertPlatformAdmin(req.user);
        return this.service.findAllCurrencies({ page, limit, search });
    }

    @Post('rates')
    async createRate(@Body() dto: CreateExchangeRateDto, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.createExchangeRate(req.user.id, req.user.tenantId, dto);
    }

    @Get('rates')
    async findAllRates(
        @Request() req,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
    ) {
        assertPlatformAdmin(req.user);
        return this.service.findAllExchangeRates({ page, limit, search });
    }
}

@Controller('api/platform/audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogsController {
    constructor(private readonly auditService: AuditService) { }

    @Get()
    async findAll(
        @Request() req,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('tenantId') tenantId?: string,
        @Query('action') action?: string,
        @Query('entityType') entityType?: string,
        @Query('search') search?: string,
    ) {
        assertPlatformAdmin(req.user);
        return this.auditService.getPlatformAuditLogs({ page, limit, tenantId, action, entityType, search });
    }
}

@Controller('api/platform/subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
    constructor(private readonly service: TenantAdminService) { }

    @Get()
    async findAll(
        @Request() req,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('status') status?: string,
    ) {
        assertPlatformAdmin(req.user);
        return this.service.findAllSubscriptions({ page, limit, search, status });
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.cancelSubscription(req.user.id, id);
    }
}

@Controller('api/tenant/plan')
@UseGuards(JwtAuthGuard)
export class PlanStatusController {
    constructor(private readonly service: TenantAdminService) { }

    @Get()
    async getStatus(@Request() req) {
        return this.service.getPlanStatus(req.user.tenantId);
    }
}
