import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SalesService } from '../src/sales/sales.service';
import { PaymentsService } from '../src/payment/payment.service';
import { PurchaseOrdersService } from '../src/purchase-orders/purchase-orders.service';
import { TenantAwarePrismaService } from '../src/prisma/tenant-aware-prisma.service';
import { AccountingReportsService } from '../src/accounting/reports/accounting-reports.service';
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
    const reportsService = await app.resolve(AccountingReportsService, contextId);

    const tenantId = user.tenantId!;
    console.log(`\n=== FINANCIAL STATEMENTS VERIFICATION ===`);
    console.log(`Tenant: ${tenantId}, User: ${user.email}\n`);

    // Record test start time BEFORE creating any data
    const testStartTime = new Date();
    console.log(`Test Start Time: ${testStartTime.toISOString()}`);

    // Clean up old test data to ensure isolated test environment
    console.log('Cleaning up old test data...');
    await prisma.client.journalLine.deleteMany({
        where: { journalEntry: { tenantId } }
    });
    await prisma.client.journalEntry.deleteMany({ where: { tenantId } });
    await prisma.client.inventoryLedger.deleteMany({ where: { tenantId } });
    console.log('✓ Test data cleaned\n');

    // Setup: Ensure Branch and Cash Session
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

    // Create Product Dependencies
    console.log('--- 1. Setting up Test Data ---');
    const brandName = `FinStatBrand-${Date.now()}`;
    const brand = await prisma.client.brand.upsert({
        where: { name: brandName },
        update: {},
        create: { name: brandName }
    });

    const categoryName = `FinStatCategory-${Date.now()}`;
    const category = await prisma.client.productCategory.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName }
    });

    // Create Product
    const productCode = `FINSTAT-${Date.now()}`;
    const product = await prisma.client.product.create({
        data: {
            brandId: brand.id,
            categoryId: category.id,
            name: `Financial Statement Test Product ${productCode}`,
            description: 'Test Product for Financial Statements',
            status: 'ACTIVE'
        }
    });
    console.log(`✓ Product Created: ${product.name}`);

    // Create and Receive PO
    const unitCost = 50;
    const quantity = 10;
    const po = await poService.create(user.id, {
        branchId: branch.id,
        supplierName: 'Test Supplier',
        items: [{ productId: product.id, quantity, unitCost }]
    });
    await poService.receive(user.id, po.id);
    console.log(`✓ PO Received: ${quantity} units @ $${unitCost}/unit = $${unitCost * quantity}`);

    // Update Inventory with selling price
    const sellingPrice = 100;
    await prisma.client.inventory.update({
        where: { branchId_productId: { branchId: branch.id, productId: product.id } },
        data: { sellingPrice }
    });

    // Create Sale
    const saleQty = 2;
    const sale = await salesService.create(user.id, {
        branchId: branch.id,
        customerName: 'Walk-in Customer',
        items: [{ productId: product.id, quantity: saleQty }]
    });
    console.log(`✓ Sale Created: ${saleQty} units @ $${sellingPrice}/unit = $${sale.total}`);

    // Create Payment
    const payment = await paymentsService.create({
        saleId: sale.id,
        amount: Number(sale.total),
        method: 'CASH',
        reference: 'Test Payment'
    });
    console.log(`✓ Payment Received: $${payment.amount}\n`);

    // Use test start time and current time for date range
    const testEndTime = new Date();
    console.log(`Test End Time: ${testEndTime.toISOString()}`);
    console.log(`Report Date Range: ${testStartTime.toISOString()} to ${testEndTime.toISOString()}\n`);

    console.log('--- 2. Running Financial Reports ---\n');

    // TRIAL BALANCE
    console.log('📊 TRIAL BALANCE');
    const trialBalance = await reportsService.getTrialBalance(testStartTime, testEndTime);
    console.log(`   Accounts: ${trialBalance.length}`);

    let totalDebits = 0;
    let totalCredits = 0;
    trialBalance.forEach(account => {
        totalDebits += account.debitTotal;
        totalCredits += account.creditTotal;
        if (Math.abs(account.balance) > 0.01) {
            console.log(`   ${account.accountCode} ${account.accountName}: Dr ${account.debitTotal.toFixed(2)}, Cr ${account.creditTotal.toFixed(2)}, Bal ${account.balance.toFixed(2)}`);
        }
    });

    console.log(`   Total Debits: $${totalDebits.toFixed(2)}`);
    console.log(`   Total Credits: $${totalCredits.toFixed(2)}`);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
        console.error('   ❌ FAIL: Trial Balance is unbalanced!');
        process.exit(1);
    }
    console.log('   ✅ PASS: Trial Balance is balanced\n');

    // INCOME STATEMENT
    console.log('📊 INCOME STATEMENT (P&L)');
    const incomeStatement = await reportsService.getIncomeStatement(testStartTime, testEndTime);
    console.log(`   Revenue: $${incomeStatement.totalRevenue.toFixed(2)}`);
    console.log(`   COGS: $${incomeStatement.totalCOGS.toFixed(2)}`);
    console.log(`   Gross Profit: $${incomeStatement.grossProfit.toFixed(2)}`);
    console.log(`   Expenses: $${incomeStatement.totalExpenses.toFixed(2)}`);
    console.log(`   Net Profit: $${incomeStatement.netProfit.toFixed(2)}`);

    // Validate calculations
    const expectedRevenue = saleQty * sellingPrice;
    const expectedCOGS = saleQty * unitCost;
    const expectedGrossProfit = expectedRevenue - expectedCOGS;
    const expectedNetProfit = expectedGrossProfit - incomeStatement.totalExpenses;

    if (Math.abs(incomeStatement.totalRevenue - expectedRevenue) > 0.01) {
        console.error(`   ❌ FAIL: Revenue mismatch. Expected ${expectedRevenue}, got ${incomeStatement.totalRevenue}`);
        process.exit(1);
    }
    if (Math.abs(incomeStatement.totalCOGS - expectedCOGS) > 0.01) {
        console.error(`   ❌ FAIL: COGS mismatch. Expected ${expectedCOGS}, got ${incomeStatement.totalCOGS}`);
        process.exit(1);
    }
    console.log('   ✅ PASS: Income Statement calculations correct\n');

    // BALANCE SHEET
    console.log('📊 BALANCE SHEET');
    const balanceSheet = await reportsService.getBalanceSheet(testEndTime);
    console.log(`   Total Assets: $${balanceSheet.totalAssets.toFixed(2)}`);
    console.log(`   Total Liabilities: $${balanceSheet.totalLiabilities.toFixed(2)}`);
    console.log(`   Total Equity: $${balanceSheet.totalEquity.toFixed(2)}`);

    const balanceDiff = Math.abs(balanceSheet.totalAssets - (balanceSheet.totalLiabilities + balanceSheet.totalEquity));
    console.log(`   Balance Check (Assets - (Liabilities + Equity)): ${balanceDiff.toFixed(2)}`);

    if (balanceDiff > 0.01) {
        console.error('   ❌ FAIL: Balance Sheet does not balance!');
        console.log('   Assets:', balanceSheet.assets);
        console.log('   Liabilities:', balanceSheet.liabilities);
        console.log('   Equity:', balanceSheet.equity);
        process.exit(1);
    }
    console.log('   ✅ PASS: Balance Sheet balances (Assets = Liabilities + Equity)\n');

    // CASH FLOW
    console.log('📊 CASH FLOW STATEMENT');
    const cashFlow = await reportsService.getCashFlow(testStartTime, testEndTime);
    console.log(`   Cash from Sales: $${cashFlow.operatingActivities.cashFromSales.toFixed(2)}`);
    console.log(`   Cash to Suppliers: $${cashFlow.operatingActivities.cashPaidToSuppliers.toFixed(2)}`);
    console.log(`   Other Operating: $${cashFlow.operatingActivities.otherCheck.toFixed(2)}`);
    console.log(`   Net Operating Cash: $${cashFlow.operatingActivities.netCashFromOperating.toFixed(2)}`);
    console.log(`   Net Cash Change: $${cashFlow.netCashChange.toFixed(2)}`);

    // Validate cash flow reflects the payment
    const expectedCashFromSales = Number(sale.total);
    if (Math.abs(cashFlow.operatingActivities.cashFromSales - expectedCashFromSales) > 0.01) {
        console.error(`   ❌ FAIL: Cash from Sales mismatch. Expected ${expectedCashFromSales}, got ${cashFlow.operatingActivities.cashFromSales}`);
        process.exit(1);
    }
    console.log('   ✅ PASS: Cash Flow reflects payments correctly\n');

    console.log('=== ✅ ALL FINANCIAL STATEMENTS VERIFIED SUCCESSFULLY ===\n');
    await app.close();
}

verify().catch(e => {
    console.error('Verification Failed:', e);
    process.exit(1);
});
