const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const tenant = await prisma.tenant.findFirst({ where: { subdomain: 'alpha' } });
    const sale = await prisma.sale.findFirst({ where: { tenantId: tenant.id } });
    console.log(JSON.stringify({ tenantId: tenant.id, saleId: sale.id }));
}

main().finally(() => prisma.$disconnect());
