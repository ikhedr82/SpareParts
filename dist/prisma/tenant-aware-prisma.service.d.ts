import { Request } from 'express';
import { PrismaService } from './prisma.service';
export declare class TenantAwarePrismaService {
    private request;
    private prisma;
    constructor(request: Request, prisma: PrismaService);
    get tenantId(): any;
    get user(): any;
    get client(): import("@prisma/client/runtime/library").DynamicClientExtensionThis<import(".prisma/client").Prisma.TypeMap<import("@prisma/client/runtime/library").InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }, {}>, import(".prisma/client").Prisma.TypeMapCb<import(".prisma/client").Prisma.PrismaClientOptions>, {
        result: {};
        model: {};
        query: {};
        client: {};
    }>;
}
