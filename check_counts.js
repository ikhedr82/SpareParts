const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const counts = {
            brands: await prisma.brand.count(),
            categories: await prisma.productCategory.count(),
            products: await prisma.product.count(),
            tenants: await prisma.tenant.count(),
            branches: await prisma.branch.count(),
        };
        console.log('Counts:', counts);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);
