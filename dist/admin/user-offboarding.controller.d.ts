import { UserOffboardingService } from './user-offboarding.service';
export declare class UserOffboardingController {
    private readonly service;
    constructor(service: UserOffboardingService);
    findAll(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        email: string;
        userRoles: ({
            role: {
                id: string;
                name: string;
                nameAr: string | null;
                createdAt: Date;
                updatedAt: Date;
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
