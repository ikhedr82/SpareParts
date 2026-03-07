import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SalesService } from '../src/sales/sales.service';
import { PaymentsService } from '../src/payment/payment.service';
import { PurchaseOrdersService } from '../src/purchase-orders/purchase-orders.service';
import { InventoryService } from '../src/inventory/inventory.service';
import { AccountingService, ACCOUNT_CODES } from '../src/accounting/accounting.service';
import { TenantAwarePrismaService } from '../src/prisma/tenant-aware-prisma.service';
import { CreateSaleDto } from '../src/sales/dto/create-sale.dto';

import { ContextIdFactory } from '@nestjs/core';
import { PrismaService } from '../src/prisma/prisma.service';

async function verify() {
    const app = await NestFactory.create(AppModule);
    const prismaService = app.get(PrismaService);

    // 1. Fetch User (using global PrismaService)
    const user = await prismaService.user.findFirst({
        where: { tenantId: { not: null } }
    });
    if (!user) {
        console.error('No user found to run verification.');
        process.exit(1);
    }

    // 2. Setup Context
    const contextId = ContextIdFactory.create();
    const mockRequest = { user, tenantId: user.tenantId };
    app.registerRequestByContextId(mockRequest, contextId);

    // 3. Resolve Request-Scoped Services
    const prisma = await app.resolve(TenantAwarePrismaService, contextId);
    const salesService = await app.resolve(SalesService, contextId);
    const paymentsService = await app.resolve(PaymentsService, contextId);
    const poService = await app.resolve(PurchaseOrdersService, contextId);
    const inventoryService = await app.resolve(InventoryService, contextId);
    const accountingService = await app.resolve(AccountingService, contextId);

    const tenantId = user.tenantId!;
    console.log(`Running verification for Tenant: ${tenantId}, User: ${user.email}`);

    // 0. Setup: Ensure Branch and Cash Session
    const branch = await prisma.client.branch.findFirst({ where: { tenantId } });
    if (!branch) throw new Error('No branch found');

    let session = await prisma.client.cashSession.findFirst({ where: { branchId: branch.id, status: 'OPEN' } });
    if (!session) {
        console.log('Opening new Cash Session...');
        session = await prisma.client.cashSession.create({
            data: {
                tenantId,
                branchId: branch.id,
                openedById: user.id,
                openedAt: new Date(),
                openingCash: 100,
                status: 'OPEN'
            }
        });
    }

    // 1. Create Product Dependencies (Brand, Category)
    console.log('\n--- 1. Creating Product Dependencies ---');
    const brandName = `AutoBrand-${Date.now()}`;
    const brand = await prisma.client.brand.upsert({
        where: { name: brandName },
        update: {},
        create: { name: brandName }
    });

    const categoryName = `AutoCategory-${Date.now()}`;
    const category = await prisma.client.productCategory.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName }
    });

    // 2. Create Product
    console.log('\n--- 2. Creating Product ---');
    const productCode = `AUTO-${Date.now()}`;
    const product = await prisma.client.product.create({
        data: {
            // tenantId is NOT present on Product (Global Catalog)
            brandId: brand.id,
            categoryId: category.id,
            name: `Automation Test Product ${productCode}`,
            description: 'Test Product',
            status: 'ACTIVE'
        }
    });
    console.log(`Product Created: ${product.name} (${product.id})`);

    // 3. Create and Receive PO (To set Cost and Stock)
    console.log('\n--- 3. Creating & Receiving PO ---');
    const unitCost = 50;
    const quantity = 10;

    const po = await poService.create(user.id, {
        branchId: branch.id,
        supplierName: 'Test Supplier',
        items: [{ productId: product.id, quantity, unitCost }]
    });

    const receivedPO = await poService.receive(user.id, po.id);
    console.log(`PO Received. Total Cost: ${receivedPO.totalCost}`);

    // Verify Inventory Asset & AP Journal
    const poJournal = await prisma.client.journalEntry.findFirst({
        where: { reference: `PO-${po.id}` },
        include: { lines: { include: { account: true } } }
    });

    if (!poJournal) throw new Error('PO Journal Entry not found!');
    console.log('PO Journal Verified:', poJournal.description);
    poJournal.lines.forEach(l => console.log(`  ${l.account.code} ${l.account.name}: ${Number(l.debit) > 0 ? 'Dr ' + l.debit : 'Cr ' + l.credit}`));

    // 4. Create Sale
    console.log('\n--- 4. Creating Sale ---');
    const saleQty = 2;
    const sellingPrice = 100;

    // Ensure inventory price is set (create/receive PO sets cost, but selling price needs to be set on Inventory record)
    // Inventory record is created during PO receive? Yes, logic handles it.
    // We update it to set selling price.
    await prisma.client.inventory.update({
        where: { branchId_productId: { branchId: branch.id, productId: product.id } },
        data: { sellingPrice }
    });

    const sale = await salesService.create(user.id, {
        branchId: branch.id,
        customerName: 'Walk-in Customer',
        items: [{ productId: product.id, quantity: saleQty }]
    });
    console.log(`Sale Created: ${sale.id}. Total: ${sale.total}`);

    // Verify Revenue/AR Journal
    const saleJournal = await prisma.client.journalEntry.findFirst({
        where: { reference: `SALE-${sale.id}` },
        include: { lines: { include: { account: true } } }
    });
    if (!saleJournal) throw new Error('Sale Journal Entry not found!');
    console.log('Sale Journal Verified:', saleJournal.description);
    saleJournal.lines.forEach(l => console.log(`  ${l.account.code} ${l.account.name}: ${Number(l.debit) > 0 ? 'Dr ' + l.debit : 'Cr ' + l.credit}`));

    // Verify COGS Journal
    const cogsJournal = await prisma.client.journalEntry.findFirst({
        where: { reference: `COGS-${sale.id}` },
        include: { lines: { include: { account: true } } }
    });
    if (!cogsJournal) throw new Error('COGS Journal Entry not found!');
    console.log('COGS Journal Verified:', cogsJournal.description);
    cogsJournal.lines.forEach(l => console.log(`  ${l.account.code} ${l.account.name}: ${Number(l.debit) > 0 ? 'Dr ' + l.debit : 'Cr ' + l.credit}`));


    // 5. Create Payment
    console.log('\n--- 5. Creating Payment ---');
    const payment = await paymentsService.create({
        saleId: sale.id,
        amount: Number(sale.total),
        method: 'CASH',
        reference: 'Test Payment'
    });
    console.log(`Payment Created: ${payment.id}`);

    // Verify Payment Journal
    const payJournal = await prisma.client.journalEntry.findFirst({
        where: { reference: `PAY-${payment.id}` },
        include: { lines: { include: { account: true } } }
    });
    if (!payJournal) throw new Error('Payment Journal Entry not found!');
    console.log('Payment Journal Verified:', payJournal.description);
    payJournal.lines.forEach(l => console.log(`  ${l.account.code} ${l.account.name}: ${Number(l.debit) > 0 ? 'Dr ' + l.debit : 'Cr ' + l.credit}`));

    console.log('\n--- VERIFICATION SUCCESSFUL ---');
    await app.close();
}

verify().catch(e => {
    console.error(e);
    process.exit(1);
});
