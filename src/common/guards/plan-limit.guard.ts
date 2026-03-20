import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsageTrackingService } from '../../tenant-admin/usage-tracking.service';
import { PrismaService } from '../../prisma/prisma.service';

export const LIMIT_KEY = 'plan_limit_key';
export const CheckPlanLimit = (limitKey: string) => SetMetadata(LIMIT_KEY, limitKey);

@Injectable()
export class PlanLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usageTracking: UsageTrackingService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const limitKey = this.reflector.get<string>(LIMIT_KEY, context.getHandler());
    if (!limitKey) return true;

    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId;

    if (!tenantId) return true; // Skip for platform users or unauthenticated (though should be authenticated)

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });

    if (!tenant || !tenant.plan) return true;

    const limits = tenant.plan.limits as any;
    const limitValue = limits?.[limitKey];

    if (limitValue === undefined || limitValue === null) return true; // No limit defined

    const usage = await this.usageTracking.getUsage(tenantId);
    
    // Map limitKey to usage property
    const usageMap: Record<string, number> = {
      maxUsers: usage.users,
      maxBranches: usage.branches,
      maxProducts: usage.products,
      maxOrdersPerMonth: usage.orders,
    };

    const currentUsage = usageMap[limitKey];

    if (currentUsage !== undefined && currentUsage >= limitValue) {
      throw new ForbiddenException(`Plan limit reached: ${limitKey}. Current: ${currentUsage}, Limit: ${limitValue}`);
    }

    return true;
  }
}
