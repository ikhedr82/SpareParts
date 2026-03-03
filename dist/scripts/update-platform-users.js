"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting platform user update...');
    const user1 = await prisma.user.update({
        where: { email: 'admin@aljazeera.com' },
        data: { isPlatformUser: true },
    });
    console.log(`Updated ${user1.email}: isPlatformUser = ${user1.isPlatformUser}`);
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
//# sourceMappingURL=update-platform-users.js.map