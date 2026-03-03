import { Module } from '@nestjs/common';
import { TenantAdminController, PlatformUsersController, PlansController, CurrenciesController, PlanStatusController } from './tenant-admin.controller';
import { BillingController } from './billing.controller';
import { TenantAdminService } from './tenant-admin.service';
import { PlanEnforcementService } from './plan-enforcement.service';
import { BillingService } from './billing.service';
import { UsageTrackingService } from './usage-tracking.service';
import { PrismaModule } from '../prisma/prisma.module';

import { StripeService } from './stripe.service';
import { StripeWebhookController } from './stripe-webhook.controller';

@Module({
    imports: [PrismaModule],
    controllers: [TenantAdminController, PlatformUsersController, PlansController, CurrenciesController, PlanStatusController, BillingController, StripeWebhookController],
    providers: [TenantAdminService, PlanEnforcementService, BillingService, UsageTrackingService, StripeService],
    exports: [TenantAdminService, PlanEnforcementService, BillingService, UsageTrackingService, StripeService],
})
export class TenantAdminModule { }
