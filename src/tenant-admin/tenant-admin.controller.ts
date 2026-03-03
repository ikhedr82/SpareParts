import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { TenantAdminService } from './tenant-admin.service';
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
    async findAll(@Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.findOne(id);
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

    @Get('billing/invoices')
    async getInvoices(@Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.getGlobalInvoices();
    }
}

@Controller('api/platform/users')
@UseGuards(JwtAuthGuard)
export class PlatformUsersController {
    constructor(private readonly service: TenantAdminService) { }

    @Get()
    async findAll(@Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.findAllUsers();
    }
}

@Controller('api/platform/plans')
@UseGuards(JwtAuthGuard)
export class PlansController {
    constructor(private readonly service: TenantAdminService) { }

    @Post()
    async create(@Body() dto: CreatePlanDto, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.createPlan(dto);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdatePlanDto, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.updatePlan(id, dto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.deletePlan(id);
    }

    @Get()
    async findAll() {
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
        return this.service.createCurrency(dto);
    }

    @Patch(':code')
    async update(@Param('code') code: string, @Body() dto: UpdateCurrencyDto, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.updateCurrency(code, dto);
    }

    @Get()
    async findAll() {
        return this.service.findAllCurrencies();
    }

    @Post('rates')
    async createRate(@Body() dto: CreateExchangeRateDto, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.service.createExchangeRate(req.user.tenantId, dto);
    }

    @Get('rates')
    async findAllRates() {
        return this.service.findAllExchangeRates();
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
