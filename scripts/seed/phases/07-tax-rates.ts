/**
 * Phase 07 — Tax Rates
 * Creates Egyptian VAT rates.
 */
import { PrismaClient } from '@prisma/client';
import { TENANT_ID, id } from '../helpers/ids';

export const TAX_VAT_14 = 'tax:vat-14';
export const TAX_VAT_0 = 'tax:vat-0';

export async function seedTaxRates(prisma: PrismaClient) {
    console.log('  → Phase 07: Creating Tax Rates...');

    await prisma.taxRate.create({
        data: { id: id(TAX_VAT_14), tenantId: TENANT_ID, name: 'VAT 14%', percentage: 14.0 },
    });

    await prisma.taxRate.create({
        data: { id: id(TAX_VAT_0), tenantId: TENANT_ID, name: 'VAT Exempt', percentage: 0.0 },
    });

    console.log('    ✓ 2 tax rates created');
}
