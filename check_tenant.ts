import { PrismaClient } from '@prisma/client';

async function checkTenant() {
    const prisma = new PrismaClient();
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { id: 'a3b063ce-5086-4f51-985d-3c8ba93e4d44' }
        });
        console.log('Tenant found:', JSON.stringify(tenant, null, 2));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

checkTenant();
