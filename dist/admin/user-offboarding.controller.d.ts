import { UserOffboardingService } from './user-offboarding.service';
export declare class UserOffboardingController {
    private readonly service;
    constructor(service: UserOffboardingService);
    findAll(req: any): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        status: string;
        updatedAt: Date;
        userRoles: ({
            role: {
                id: string;
                tenantId: string | null;
                createdAt: Date;
                updatedAt: Date;
                version: number;
                name: string;
                description: string | null;
                descriptionAr: string | null;
                nameAr: string | null;
                scope: import(".prisma/client").$Enums.RoleScope;
            };
        } & {
            id: string;
            tenantId: string | null;
            userId: string;
            branchId: string | null;
            roleId: string;
        })[];
    }[]>;
    offboard(id: string, body: {
        reason: string;
    }, req: any): Promise<{
        userId: string;
        email: string;
        status: string;
        rolesRemoved: number;
    }>;
}
