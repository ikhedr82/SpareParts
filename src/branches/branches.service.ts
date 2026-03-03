import { Injectable } from '@nestjs/common';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { PlanEnforcementService } from '../tenant-admin/plan-enforcement.service';
import { UsageTrackingService } from '../tenant-admin/usage-tracking.service';

@Injectable()
export class BranchesService {
    constructor(
        private readonly prisma: TenantAwarePrismaService,
        private readonly planEnforcement: PlanEnforcementService,
        private readonly usageTracking: UsageTrackingService,
    ) { }

    findAll() {
        return this.prisma.client.branch.findMany();
    }

    findOne(id: string) {
        return this.prisma.client.branch.findUnique({
            where: { id },
        });
    }

    async create(tenantId: string, data: any) {
        await this.planEnforcement.checkBranchLimit(tenantId);
        const branch = await this.prisma.client.branch.create({
            data: {
                ...data,
                tenantId,
            },
        });

        // Record Usage Metric
        const branchCount = await this.prisma.client.branch.count({ where: { tenantId } });
        await this.usageTracking.recordMetric(tenantId, 'BRANCHES', branchCount);

        return branch;
    }
}
