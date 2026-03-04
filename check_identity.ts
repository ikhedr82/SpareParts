import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            isPlatformUser: true,
            tenantId: true,
        }
    });
    console.log('--- Users ---');
    console.log(JSON.stringify(users, null, 2));

    const platformRoles = await prisma.role.findMany({
        where: { scope: 'PLATFORM' }
    });
    console.log('--- Platform Roles ---');
    console.log(JSON.stringify(platformRoles, null, 2));

    const userRoles = await prisma.userRole.findMany({
        include: {
            user: { select: { email: true } },
            role: { select: { name: true } }
        }
    });
    console.log('--- User Roles ---');
    console.log(JSON.stringify(userRoles, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
