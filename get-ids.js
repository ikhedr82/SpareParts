const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const tenant = await prisma.tenant.findFirst({ where: { subdomain: 'alpha' } });
    const branch = await prisma.branch.findFirst({ where: { tenantId: tenant.id, name: 'Alpha Main' } });

    // Find a product that actually has inventory in this branch
    const inventory = await prisma.inventory.findFirst({
        where: { branchId: branch.id },
        include: { product: true, tenant: true }
    });

    if (!inventory) {
        console.log("NO INVENTORY FOUND FOR BRANCH " + branch.id);
        const anyInv = await prisma.inventory.findFirst({ include: { branch: true, tenant: true } });
        console.log("ANY INVENTORY:", anyInv);
        return;
    }

    const sale = await prisma.sale.findFirst({ where: { tenantId: tenant.id } });

    console.log(JSON.stringify({
        tenantId: tenant.id,
        inventoryTenantId: inventory.tenantId,
        branchId: branch.id,
        productId: inventory.productId,
        quantity: inventory.quantity
    }));
}

main().finally(() => prisma.$disconnect());
