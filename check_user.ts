import { PrismaClient } from '@prisma/client';

async function checkUser() {
    const prisma = new PrismaClient();
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'admin@alpha.com' },
            include: { userRoles: true }
        });
        console.log('User found:', JSON.stringify(user, null, 2));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
