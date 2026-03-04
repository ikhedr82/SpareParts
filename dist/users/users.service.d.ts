import { PrismaService } from '../prisma/prisma.service';
import { PlanEnforcementService } from '../tenant-admin/plan-enforcement.service';
import { UsageTrackingService } from '../tenant-admin/usage-tracking.service';
export declare class UsersService {
    private prisma;
    private planEnforcement;
    private usageTracking;
    constructor(prisma: PrismaService, planEnforcement: PlanEnforcementService, usageTracking: UsageTrackingService);
    create(tenantId: string, email: string, password: string, roleId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        status: string;
        email: string;
        passwordHash: string;
        isPlatformUser: boolean;
        version: number;
    }>;
    findAll(tenantId: string): Promise<({
        userRoles: ({
            role: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                nameAr: string | null;
                tenantId: string | null;
                version: number;
                scope: import(".prisma/client").$Enums.RoleScope;
                description: string | null;
                descriptionAr: string | null;
            };
        } & {
            id: string;
            tenantId: string | null;
            roleId: string;
            userId: string;
            branchId: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        status: string;
        email: string;
        passwordHash: string;
        isPlatformUser: boolean;
        version: number;
    })[]>;
}
