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
        status: string;
        createdAt: Date;
        version: number;
        tenantId: string | null;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        isPlatformUser: boolean;
    }>;
    findAll(tenantId: string): Promise<({
        userRoles: ({
            role: {
                id: string;
                createdAt: Date;
                version: number;
                tenantId: string | null;
                name: string;
                nameAr: string | null;
                updatedAt: Date;
                scope: import(".prisma/client").$Enums.RoleScope;
                description: string | null;
                descriptionAr: string | null;
            };
        } & {
            id: string;
            tenantId: string | null;
            branchId: string | null;
            roleId: string;
            userId: string;
        })[];
    } & {
        id: string;
        status: string;
        createdAt: Date;
        version: number;
        tenantId: string | null;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        isPlatformUser: boolean;
    })[]>;
}
