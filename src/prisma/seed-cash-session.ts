import { PrismaClient, PaymentMethod } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Cash Session and Sales...');

    // 1. Get Tenant and Branch
    const tenant = await prisma.tenant.findFirst({ where: { subdomain: 'alpha' } });
    const branch = await prisma.branch.findFirst({ where: { name: 'Main Branch' } });
    const user = await prisma.user.findFirst({ where: { email: 'admin@alpha.com' } });

    if (!tenant || !branch || !user) {
        throw new Error('Tenant, Branch, or User not found. Run basic seed first.');
    }

    // 2. Open Cash Session
    console.log('Opening Cash Session...');
    // Close any existing open sessions
    await prisma.cashSession.updateMany({
        where: { branchId: branch.id, status: 'OPEN' },
        data: { status: 'CLOSED', closedAt: new Date(), closingCash: 0 }
    });

    const session = await prisma.cashSession.create({
        data: {
            tenantId: tenant.id,
            branchId: branch.id,
            openedById: user.id,
            openingCash: new Decimal(200.00),
            status: 'OPEN',
        }
    });

    console.log(`Session Opened: ${session.id}`);

    // 3. Create Products (if needed)
    // Assuming basic seed might not have products, let's check or create one.
    let product = await prisma.product.findFirst({ where: { name: 'Oil Filter' } });
    if (!product) {
        // Need brand and category
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

    // Ensure inventory
    await prisma.inventory.upsert({
        where: { branchId_productId: { branchId: branch.id, productId: product.id } },
        update: { quantity: 100 },
        create: {
            tenantId: tenant.id,
            branchId: branch.id,
            productId: product.id,
            quantity: 100,
            sellingPrice: new Decimal(15.00)
        }
    });

    // 4. Create 10 Sales
    console.log('Creating 10 Sales...');
    for (let i = 0; i < 10; i++) {
        const isCash = i % 2 === 0; // Even are cash
        const amount = 15.00 * (i + 1); // Varied amounts

        const sale = await prisma.sale.create({
            data: {
                tenantId: tenant.id,
                branchId: branch.id,
                cashSessionId: session.id,
                customerName: `Customer ${i + 1}`,
                total: new Decimal(amount),
                status: 'COMPLETED',
                items: {
                    create: [{
                        productId: product.id,
                        quantity: i + 1,
                        price: new Decimal(15.00)
                    }]
                }
            }
        });

        // Payment
        await prisma.payment.create({
            data: {
                tenantId: tenant.id,
                saleId: sale.id,
                sessionId: session.id, // Only link if cash? Requirement says "All payments must belong to a cash session" (implied context) but usually Card payments are also linked to session for Z-report.
                // My schema has sessionId on Payment.
                // Code matches logic.
                amount: new Decimal(amount),
                method: isCash ? 'CASH' : 'CARD',
                reference: isCash ? undefined : `AUTH-${Date.now()}`,
            }
        });

        // Refund one sale (the last cash one)
        if (i === 8) {
            console.log('Refunding sale ' + sale.id);
            await prisma.refund.create({
                data: {
                    tenantId: tenant.id,
                    branchId: branch.id,
                    saleId: sale.id,
                    amount: new Decimal(amount),
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

            // Reverse payment
            await prisma.payment.create({
                data: {
                    tenantId: tenant.id,
                    saleId: sale.id,
                    sessionId: session.id,
                    amount: new Decimal(amount),
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
