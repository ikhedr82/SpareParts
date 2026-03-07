import { PrismaClient } from '@prisma/client';
import * as supertest from 'supertest';

export const API_URL = 'http://localhost:3000';
export const prisma = new PrismaClient();
export const request = supertest(API_URL);

export async function login(email: string, password: string): Promise<string> {
    const res = await request
        .post('/auth/login')
        .send({ email, password });
    if (res.status !== 201 && res.status !== 200) {
        throw new Error(`Login failed for ${email}: ${JSON.stringify(res.body)}`);
    }
    return res.body.accessToken;
}

export async function loginAsAdmin(): Promise<string> {
    return login('platform@admin.com', 'admin123');
}

export function headers(token: string, idempotencyKey?: string) {
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey || 'test-key-' + Math.random().toString(36).substring(7) + '-' + Date.now()
    };
}

export async function cleanupTestTenant(subdomain: string) {
    const tenant = await prisma.tenant.findUnique({ where: { subdomain } });
    if (tenant) {
        // Cascade delete might be needed depending on schema constraints
        await prisma.tenant.delete({ where: { id: tenant.id } });
    }
}
