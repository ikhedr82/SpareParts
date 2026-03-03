import { PrismaClient } from '@prisma/client';
export declare const standardCOA: ({
    code: string;
    name: string;
    type: "ASSET";
    description: string;
    isSystem?: undefined;
} | {
    code: string;
    name: string;
    type: "ASSET";
    description: string;
    isSystem: boolean;
} | {
    code: string;
    name: string;
    type: "LIABILITY";
    description: string;
    isSystem: boolean;
} | {
    code: string;
    name: string;
    type: "LIABILITY";
    description: string;
    isSystem?: undefined;
} | {
    code: string;
    name: string;
    type: "EQUITY";
    description: string;
    isSystem?: undefined;
} | {
    code: string;
    name: string;
    type: "REVENUE";
    description: string;
    isSystem: boolean;
} | {
    code: string;
    name: string;
    type: "REVENUE";
    description: string;
    isSystem?: undefined;
} | {
    code: string;
    name: string;
    type: "EXPENSE";
    description: string;
    isSystem: boolean;
} | {
    code: string;
    name: string;
    type: "EXPENSE";
    description: string;
    isSystem?: undefined;
})[];
export declare function seedCOA(prisma: PrismaClient, tenantId: string): Promise<void>;
