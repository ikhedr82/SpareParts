import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(body: any, req: any): Promise<{
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
    findAll(req: any): Promise<({
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
