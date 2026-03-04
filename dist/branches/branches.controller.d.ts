import { BranchesService } from './branches.service';
export declare class BranchesController {
    private readonly branchesService;
    constructor(branchesService: BranchesService);
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
    create(body: any, req: any): Promise<{
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
