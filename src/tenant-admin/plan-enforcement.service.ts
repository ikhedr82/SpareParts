import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TranslationService } from '../i18n/translation.service';

@Injectable()
export class PlanEnforcementService {
    constructor(
        private prisma: PrismaService,
        private t: TranslationService,
    ) { }

    private async getTenantSubscription(tenantId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                subscription: { include: { plan: true } },
                plan: true // Fallback to current plan if no subscription record yet
            },
        });

        if (!tenant) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Tenant' }));
        }

        // Enforcement: Block if status is PAST_DUE or CANCELED
        if (tenant.subscription) {
            if (tenant.subscription.status === 'PAST_DUE' || tenant.subscription.status === 'CANCELED') {
                throw new ForbiddenException(this.t.translate('plan.subscription_invalid', 'EN', { status: tenant.subscription.status }));
            }
            return tenant.subscription.plan;
        }

        return tenant.plan;
    }

    async checkUserLimit(tenantId: string) {
        const plan = await this.getTenantSubscription(tenantId);
        if (!plan) return;
        const userCount = await this.prisma.user.count({ where: { tenantId } });

        const limits = plan.limits as any;
        if (limits && limits.maxUsers && limits.maxUsers !== -1 && userCount >= limits.maxUsers) {
            throw new ForbiddenException(this.t.translate('plan.limit_exceeded', 'EN', { limit: 'users' }));
        }
    }

    async checkBranchLimit(tenantId: string) {
        const plan = await this.getTenantSubscription(tenantId);
        if (!plan) return;
        const branchCount = await this.prisma.branch.count({ where: { tenantId } });

        const limits = plan.limits as any;
        if (limits && limits.maxBranches && limits.maxBranches !== -1 && branchCount >= limits.maxBranches) {
            throw new ForbiddenException(this.t.translate('plan.limit_exceeded', 'EN', { limit: 'branches' }));
        }
    }

    async checkProductLimit(tenantId: string) {
        const plan = await this.getTenantSubscription(tenantId);
        if (!plan) return;

        // Count unique products in inventory
        const productCountGroup = await (this.prisma.inventory as any).groupBy({
            by: ['productId'],
            where: { tenantId }
        });
        const count = productCountGroup.length;

        const limits = plan.limits as any;
        if (limits && limits.maxProducts && limits.maxProducts !== -1 && count >= limits.maxProducts) {
            throw new ForbiddenException(this.t.translate('plan.limit_exceeded', 'EN', { limit: 'products' }));
        }
    }

    async checkFeatureAccess(tenantId: string, feature: string) {
        const plan = await this.getTenantSubscription(tenantId);
        if (!plan) return;
        const features = plan.features as any;

        if (!features || !features[feature]) {
            throw new ForbiddenException(this.t.translate('plan.feature_disabled', 'EN', { feature }));
        }
    }
}
