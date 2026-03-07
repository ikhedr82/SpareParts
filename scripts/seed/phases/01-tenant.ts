/**
 * Phase 01 — Tenant Setup
 * Creates the primary tenant with Arabic as default language.
 */
import { PrismaClient } from '@prisma/client';
import { TENANT_ID } from '../helpers/ids';
import { businessOpenDate } from '../helpers/dates';

export async function seedTenant(prisma: PrismaClient) {
    console.log('  → Phase 01: Creating Tenant...');

    await prisma.tenant.create({
        data: {
            id: TENANT_ID,
            name: 'Al Jazeera Auto Parts',
            subdomain: 'aljazeera',
            status: 'ACTIVE',
            plan: 'ENTERPRISE',
            defaultLanguage: 'AR',
            supportedLanguages: ['EN', 'AR'],
            createdAt: businessOpenDate(),
        },
    });

    console.log('    ✓ Tenant "Al Jazeera Auto Parts" created');
}
