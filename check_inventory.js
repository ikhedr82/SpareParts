const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const branches = await prisma.branch.findMany({
            include: { _count: { select: { inventory: true } } }
        });
        console.log('Branches & Inventory counts:', JSON.stringify(branches, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);
