const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'admin@aljazeera.com' },
            include: { tenant: true }
        });
        console.log('User Admin@Aljazeera:', JSON.stringify(user, null, 2));

        const allTenants = await prisma.tenant.findMany();
        console.log('All Tenants:', JSON.stringify(allTenants, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);
