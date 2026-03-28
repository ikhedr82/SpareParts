import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { InfrastructureService } from './infrastructure.service';
import { FeatureFlagService } from './feature-flag.service';
import { SystemConfigService } from './system-config.service';
import { ApiKeyService } from './api-key.service';
import { CmsService } from './cms.service';
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
        private readonly cmsService: CmsService,
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

    // CMS - Page Content
    @Get('cms/content')
    async getAllPageContent(@Request() req) {
        assertPlatformAdmin(req.user);
        return this.cmsService.findAllPageContent();
    }

    @Post('cms/content')
    async upsertPageContent(@Body() data: any, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.cmsService.upsertPageContent(data.key, data);
    }

    // CMS - Testimonials
    @Get('cms/testimonials')
    async getAllTestimonials(@Request() req) {
        assertPlatformAdmin(req.user);
        return this.cmsService.findAllTestimonials();
    }

    @Post('cms/testimonials')
    async createTestimonial(@Body() data: any, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.cmsService.createTestimonial(data);
    }

    @Patch('cms/testimonials/:id')
    async updateTestimonial(@Param('id') id: string, @Body() data: any, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.cmsService.updateTestimonial(id, data);
    }

    @Delete('cms/testimonials/:id')
    async deleteTestimonial(@Param('id') id: string, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.cmsService.deleteTestimonial(id);
    }

    // CMS - FAQs
    @Get('cms/faqs')
    async getAllFAQs(@Request() req) {
        assertPlatformAdmin(req.user);
        return this.cmsService.findAllFAQs();
    }

    @Post('cms/faqs')
    async createFAQ(@Body() data: any, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.cmsService.createFAQ(data);
    }

    @Patch('cms/faqs/:id')
    async updateFAQ(@Param('id') id: string, @Body() data: any, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.cmsService.updateFAQ(id, data);
    }

    @Delete('cms/faqs/:id')
    async deleteFAQ(@Param('id') id: string, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.cmsService.deleteFAQ(id);
    }

    // CMS - Legal
    @Get('cms/legal')
    async getAllLegal(@Request() req) {
        assertPlatformAdmin(req.user);
        return this.cmsService.findAllLegal();
    }

    @Post('cms/legal')
    async upsertLegal(@Body() data: any, @Request() req) {
        assertPlatformAdmin(req.user);
        return this.cmsService.upsertLegal(data.type, data);
    }

    // Sync Monitoring
    @Get('sync-health')
    async getSyncHealth(@Request() req) {
        assertPlatformAdmin(req.user);
        
        // This simulates aggregated sync health metrics from Redis/Logs
        return {
           totalPending: 145,
           totalFailed: 12,
           activeDevices: 34,
           tenantBreakdown: [
              { tenantId: 'tenant-1', name: 'Al-Farouk Parts', failed: 2, pending: 45, devices: 10 },
              { tenantId: 'tenant-2', name: 'AutoMax', failed: 10, pending: 100, devices: 24 }
           ]
        };
    }
}
