import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debug() {
    const tenant = await prisma.tenant.findUnique({ where: { subdomain: 'alpha' } });
    console.log('Tenant:', tenant);

    if (tenant) {
        const salesCount = await prisma.sale.count({ where: { tenantId: tenant.id } });
        console.log('Total Sales for Alpha:', salesCount);

        const salesWithoutBase = await prisma.sale.count({
            where: {
                tenantId: tenant.id,
                OR: [
                    { baseAmount: 0 },
                    { exchangeRateUsed: 1.0 } // default but might be old
                ]
            }
        });
        console.log('Sales without baseAmount/exchangeRate:', salesWithoutBase);

        const accounts = await prisma.chartOfAccount.findMany({ where: { tenantId: tenant.id } });
        console.log('Accounts total:', accounts.length);
        console.log('Accounts missing nameAr:', accounts.filter(a => !a.nameAr).length);
    } else {
        console.log('Tenant alpha not found!');
        const allTenants = await prisma.tenant.findMany();
        console.log('All Tenants:', allTenants.map(t => ({ id: t.id, subdomain: t.subdomain })));
    }
}

debug().finally(() => prisma.$disconnect());
