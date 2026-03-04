import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(body: any, req: any): Promise<{
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
    findAll(req: any): Promise<({
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
