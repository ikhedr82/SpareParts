import { PrismaClient } from '@prisma/client';
import * as supertest from 'supertest';
export declare const API_URL = "http://localhost:3000";
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, import(".prisma/client").Prisma.LogLevel, import("@prisma/client/runtime/library").DefaultArgs>;
export declare const request: supertest.SuperTest<supertest.Test>;
export declare function login(email: string, password: string): Promise<string>;
export declare function loginAsAdmin(): Promise<string>;
export declare function headers(token: string, idempotencyKey?: string): {
    Authorization: string;
    'Content-Type': string;
    'Idempotency-Key': string;
};
export declare function cleanupTestTenant(subdomain: string): Promise<void>;
