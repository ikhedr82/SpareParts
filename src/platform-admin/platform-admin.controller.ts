import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { InfrastructureService } from './infrastructure.service';
import { FeatureFlagService } from './feature-flag.service';
import { SystemConfigService } from './system-config.service';
import { ApiKeyService } from './api-key.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { assertPlatformAdmin } from '../auth/utils/auth-utils';

@Controller('api/platform')
@UseGuards(JwtAuthGuard)
export class PlatformAdminController {
    constructor(
        private readonly infraService: InfrastructureService,
        private readonly featureService: FeatureFlagService,
        private readonly configService: SystemConfigService,
        private readonly apiKeyService: ApiKeyService,
    ) { }

    @Get('health')
    async getHealth(@Request() req) {
        assertPlatformAdmin(req.user);
        return this.infraService.getHealthStatus();
    }

    @Get('feature-flags')
    async getFlags(@Request() req) {
        assertPlatformAdmin(req.user);
        return this.featureService.findAll();
    }

    @Post('feature-flags')
    async createFlag(@Body() data: any, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.featureService.create(data);
    }

    @Patch('feature-flags/:id')
    async updateFlag(@Param('id') id: string, @Body() data: any, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.featureService.update(id, data);
    }

    @Delete('feature-flags/:id')
    async deleteFlag(@Param('id') id: string, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.featureService.delete(id);
    }

    @Get('config')
    async getConfig(@Request() req) {
        assertPlatformAdmin(req.user);
        return this.configService.findAll();
    }

    @Post('config')
    async setConfig(@Body() data: { key: string; value: string; description?: string; type?: string }, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.configService.set(data.key, data.value, data.description, data.type);
    }

    @Delete('config/:key')
    async removeConfig(@Param('key') key: string, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.configService.remove(key);
    }

    @Get('api-keys')
    async getApiKeys(@Request() req) {
        assertPlatformAdmin(req.user);
        return this.apiKeyService.findAll();
    }

    @Post('api-keys')
    async createApiKey(@Body() data: any, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.apiKeyService.create(data);
    }

    @Delete('api-keys/:id')
    async deleteApiKey(@Param('id') id: string, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.apiKeyService.delete(id);
    }

    @Get('api-keys/:id/metrics')
    async getApiKeyMetrics(@Param('id') id: string, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.apiKeyService.getMetrics(id);
    }
}
