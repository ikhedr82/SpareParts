import { Module } from '@nestjs/common';
import { InfrastructureService } from './infrastructure.service';
import { FeatureFlagService } from './feature-flag.service';
import { SystemConfigService } from './system-config.service';
import { ApiKeyService } from './api-key.service';
import { CmsService } from './cms.service';
import { PlatformAdminController } from './platform-admin.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [PlatformAdminController],
    providers: [
        PrismaService,
        InfrastructureService,
        FeatureFlagService,
        SystemConfigService,
        ApiKeyService,
        CmsService,
    ],
    exports: [FeatureFlagService, SystemConfigService, ApiKeyService],
})
export class PlatformAdminModule { }
