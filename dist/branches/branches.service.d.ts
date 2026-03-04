import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { PlanEnforcementService } from '../tenant-admin/plan-enforcement.service';
import { UsageTrackingService } from '../tenant-admin/usage-tracking.service';
export declare class BranchesService {
    private readonly prisma;
    private readonly planEnforcement;
    private readonly usageTracking;
    constructor(prisma: TenantAwarePrismaService, planEnforcement: PlanEnforcementService, usageTracking: UsageTrackingService);
    findAll(): import("@prisma/client/runtime/library").PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        tenantId: string;
        address: string | null;
        phone: string | null;
        addressAr: string | null;
    }[]>;
    findOne(id: string): import("@prisma/client/runtime/library").DynamicModelExtensionFluentApi<import(".prisma/client").Prisma.TypeMap<import("@prisma/client/runtime/library").InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }, {}>, "Branch", "findUnique", null> & import("@prisma/client/runtime/library").PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        tenantId: string;
        address: string | null;
        phone: string | null;
        addressAr: string | null;
    }>;
    create(tenantId: string, data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        tenantId: string;
        address: string | null;
        phone: string | null;
        addressAr: string | null;
    }>;
}
