import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function debug() {
    const email = 'platform@admin.com';
    const pass = 'admin123';

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.log('❌ User not found');
        return;
    }

    console.log('✅ User found:', user.email);
    console.log('🔑 Password Hash:', user.passwordHash);

    const isValid = await bcrypt.compare(pass, user.passwordHash);
    console.log('⚖️ Password Match:', isValid);
}

debug();
