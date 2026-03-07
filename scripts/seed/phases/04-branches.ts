/**
 * Phase 04 — Branches
 * Creates 3 branches: 1 central warehouse + 2 retail locations.
 */
import { PrismaClient } from '@prisma/client';
import { TENANT_ID, BRANCH_WAREHOUSE, BRANCH_RETAIL_1, BRANCH_RETAIL_2 } from '../helpers/ids';
import { businessOpenDate } from '../helpers/dates';

export async function seedBranches(prisma: PrismaClient) {
    console.log('  → Phase 04: Creating Branches...');

    const branches = [
        {
            id: BRANCH_WAREHOUSE,
            name: 'Central Warehouse',
            address: '15 Industrial Zone, 6th of October City, Giza, Egypt',
            phone: '+20-2-3827-1001',
        },
        {
            id: BRANCH_RETAIL_1,
            name: 'Downtown Retail',
            address: '42 Ahmed Orabi St, Mohandessin, Giza, Egypt',
            phone: '+20-2-3345-2002',
        },
        {
            id: BRANCH_RETAIL_2,
            name: 'Industrial District',
            address: '8 El-Nasr Rd, Heliopolis, Cairo, Egypt',
            phone: '+20-2-2671-3003',
        },
    ];

    for (const b of branches) {
        await prisma.branch.create({
            data: {
                id: b.id,
                tenantId: TENANT_ID,
                name: b.name,
                address: b.address,
                phone: b.phone,
                createdAt: businessOpenDate(),
            },
        });
    }

    console.log(`    ✓ ${branches.length} branches created`);
}
