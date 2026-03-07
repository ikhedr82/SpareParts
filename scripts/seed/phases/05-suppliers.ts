/**
 * Phase 05 — Suppliers
 * Creates 8 suppliers: 4 local Egyptian + 4 international.
 */
import { PrismaClient } from '@prisma/client';
import { TENANT_ID, id } from '../helpers/ids';

const SUPPLIERS = [
    // Local
    { key: 'sup:cairo-parts', name: 'Cairo Auto Parts Trading', balance: 15000 },
    { key: 'sup:delta-motors', name: 'Delta Motors Supply', balance: 8500 },
    { key: 'sup:nile-dist', name: 'Nile Distribution Co.', balance: 22000 },
    { key: 'sup:alexandria', name: 'Alexandria Spare Parts', balance: 5000 },
    // International
    { key: 'sup:bosch-me', name: 'Bosch Middle East FZE', balance: 45000 },
    { key: 'sup:denso-gulf', name: 'Denso Gulf Trading', balance: 32000 },
    { key: 'sup:valeo-egypt', name: 'Valeo Egypt SAE', balance: 18000 },
    { key: 'sup:mann-hummel', name: 'Mann+Hummel MENA', balance: 12000 },
];

export async function seedSuppliers(prisma: PrismaClient) {
    console.log('  → Phase 05: Creating Suppliers...');

    for (const s of SUPPLIERS) {
        await prisma.supplier.create({
            data: {
                id: id(s.key),
                tenantId: TENANT_ID,
                name: s.name,
                balance: s.balance,
            },
        });
    }

    console.log(`    ✓ ${SUPPLIERS.length} suppliers created`);
}
