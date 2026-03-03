"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding Cash Session and Sales...');
    const tenant = await prisma.tenant.findFirst({ where: { subdomain: 'alpha' } });
    const branch = await prisma.branch.findFirst({ where: { name: 'Main Branch' } });
    const user = await prisma.user.findFirst({ where: { email: 'admin@alpha.com' } });
    if (!tenant || !branch || !user) {
        throw new Error('Tenant, Branch, or User not found. Run basic seed first.');
    }
    console.log('Opening Cash Session...');
    await prisma.cashSession.updateMany({
        where: { branchId: branch.id, status: 'OPEN' },
        data: { status: 'CLOSED', closedAt: new Date(), closingCash: 0 }
    });
    const session = await prisma.cashSession.create({
        data: {
            tenantId: tenant.id,
            branchId: branch.id,
            openedById: user.id,
            openingCash: new library_1.Decimal(200.00),
            status: 'OPEN',
        }
    });
    console.log(`Session Opened: ${session.id}`);
    let product = await prisma.product.findFirst({ where: { name: 'Oil Filter' } });
    if (!product) {
        const brand = await prisma.brand.upsert({
            where: { name: 'Generic' }, update: {}, create: { name: 'Generic' }
        });
        const category = await prisma.productCategory.upsert({
            where: { name: 'Parts' }, update: {}, create: { name: 'Parts' }
        });
        product = await prisma.product.create({
            data: {
                brandId: brand.id,
                categoryId: category.id,
                name: 'Oil Filter',
                status: 'ACTIVE'
            }
        });
    }
    await prisma.inventory.upsert({
        where: { branchId_productId: { branchId: branch.id, productId: product.id } },
        update: { quantity: 100 },
        create: {
            tenantId: tenant.id,
            branchId: branch.id,
            productId: product.id,
            quantity: 100,
            sellingPrice: new library_1.Decimal(15.00)
        }
    });
    console.log('Creating 10 Sales...');
    for (let i = 0; i < 10; i++) {
        const isCash = i % 2 === 0;
        const amount = 15.00 * (i + 1);
        const sale = await prisma.sale.create({
            data: {
                tenantId: tenant.id,
                branchId: branch.id,
                cashSessionId: session.id,
                customerName: `Customer ${i + 1}`,
                total: new library_1.Decimal(amount),
                status: 'COMPLETED',
                items: {
                    create: [{
                            productId: product.id,
                            quantity: i + 1,
                            price: new library_1.Decimal(15.00)
                        }]
                }
            }
        });
        await prisma.payment.create({
            data: {
                tenantId: tenant.id,
                saleId: sale.id,
                sessionId: session.id,
                amount: new library_1.Decimal(amount),
                method: isCash ? 'CASH' : 'CARD',
                reference: isCash ? undefined : `AUTH-${Date.now()}`,
            }
        });
        if (i === 8) {
            console.log('Refunding sale ' + sale.id);
            await prisma.refund.create({
                data: {
                    tenantId: tenant.id,
                    branchId: branch.id,
                    saleId: sale.id,
                    amount: new library_1.Decimal(amount),
                    reason: 'Test Refund',
                    refundNumber: `RF-${Date.now()}-${i}`,
                    createdById: user.id,
                    cashSessionId: session.id,
                }
            });
            await prisma.sale.update({
                where: { id: sale.id },
                data: { status: 'REFUNDED' }
            });
            await prisma.payment.create({
                data: {
                    tenantId: tenant.id,
                    saleId: sale.id,
                    sessionId: session.id,
                    amount: new library_1.Decimal(amount),
                    method: 'CASH',
                    isRefund: true,
                    reference: 'Refund Reversal'
                }
            });
        }
    }
    console.log('Seeding Completed.');
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-cash-session.js.map