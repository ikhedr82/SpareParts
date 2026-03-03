import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const userCount = await prisma.user.count();
        const tenantCount = await prisma.tenant.count();
        console.log(`Users: ${userCount}`);
        console.log(`Tenants: ${tenantCount}`);
    } catch (error) {
        console.error('Error connecting to database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
