import { PrismaService } from '../prisma/prisma.service';
export declare class OperationsController {
    private prisma;
    constructor(prisma: PrismaService);
    getStatus(req: any, key: string): Promise<{
        error: string;
        status?: undefined;
        response?: undefined;
    } | {
        status: string;
        error?: undefined;
        response?: undefined;
    } | {
        status: string;
        response: import("@prisma/client/runtime/library").JsonValue;
        error?: undefined;
    }>;
}
