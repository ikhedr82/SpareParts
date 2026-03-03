import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting platform user update...');

    // 1. Update admin@aljazeera.com
    const user1 = await prisma.user.update({
        where: { email: 'admin@aljazeera.com' },
        data: { isPlatformUser: true },
    });
    console.log(`Updated ${user1.email}: isPlatformUser = ${user1.isPlatformUser}`);

    // 2. Ensure platform@admin.com exists with correct password and flag
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user2 = await prisma.user.upsert({
        where: { email: 'platform@admin.com' },
        update: { isPlatformUser: true, passwordHash: hashedPassword },
        create: {
            email: 'platform@admin.com',
            passwordHash: hashedPassword,
            isPlatformUser: true,
        },
    });
    console.log(`Upserted ${user2.email}: isPlatformUser = ${user2.isPlatformUser}`);

    console.log('Update complete!');
}

main()
    .catch((e) => {
        console.error('Error updating platform users:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
