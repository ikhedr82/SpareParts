"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_utils_1 = require("./test-utils");
const accounting_service_1 = require("../accounting/accounting.service");
async function runPhase4() {
    console.log('--- PHASE 4: PLAN ENFORCEMENT & DATA INTEGRITY ---');
    const results = [];
    let token;
    try {
        token = await (0, test_utils_1.loginAsAdmin)();
    }
    catch (error) {
        console.error('✗ Login failed', error);
        return;
    }
    console.log('\n[4.1] Plan Enforcement: Limits (Users, Branches, Products)...');
    const suffix = Date.now().toString().slice(-4);
    const planRes = await test_utils_1.request.post('/api/platform/plans').set((0, test_utils_1.headers)(token)).send({
        name: 'STRICT_PLAN_' + suffix,
        price: 10,
        limits: {
            maxUsers: 2,
            maxBranches: 1,
            maxProducts: 2
        },
        features: {
            multiCurrency: true,
            pos: true
        }
    });
    const planId = planRes.body.id;
    const tenantRes = await test_utils_1.request.post('/api/platform/tenants').set((0, test_utils_1.headers)(token)).send({
        name: 'Strict Tenant ' + suffix,
        subdomain: 'strict-' + suffix,
        planId: planId,
        adminEmail: 'admin-strict' + suffix + '@test.com',
        adminPassword: 'Password123!',
        baseCurrency: 'USD',
        supportedCurrencies: ['USD']
    });
    const tenantId = tenantRes.body.id;
    const tenantToken = await (0, test_utils_1.login)(tenantRes.body.adminUser.email, 'Password123!');
    const b1 = await test_utils_1.request.post('/branches').set((0, test_utils_1.headers)(tenantToken)).send({ name: 'Branch 1' });
    if (b1.status === 201) {
        console.log('✓ Branch 1 created');
        const b2 = await test_utils_1.request.post('/branches').set((0, test_utils_1.headers)(tenantToken)).send({ name: 'Branch 2' });
        if (b2.status === 403) {
            console.log('✓ Branch 2 blocked (Limit enforced)');
            results.push({ scenario: 'Branch Limit Enforcement', status: 'PASS' });
        }
        else {
            console.error('✗ Branch 2 NOT blocked', b2.status, b2.body);
            results.push({ scenario: 'Branch Limit Enforcement', status: 'FAIL' });
        }
    }
    const u2 = await test_utils_1.request.post('/users').set((0, test_utils_1.headers)(tenantToken)).send({
        email: 'user2-' + suffix + '@test.com',
        password: 'Password123!',
        name: 'User Two'
    });
    if (u2.status === 201) {
        console.log('✓ User 2 created');
        const u3 = await test_utils_1.request.post('/users').set((0, test_utils_1.headers)(tenantToken)).send({
            email: 'user3-' + suffix + '@test.com',
            password: 'Password123!',
            name: 'User Three'
        });
        if (u3.status === 403) {
            console.log('✓ User 3 blocked (Limit enforced)');
            results.push({ scenario: 'User Limit Enforcement', status: 'PASS' });
        }
        else {
            console.error('✗ User 3 NOT blocked', u3.status, u3.body);
            results.push({ scenario: 'User Limit Enforcement', status: 'FAIL' });
        }
    }
    const products = await test_utils_1.prisma.product.findMany({ take: 3 });
    const branchId = b1.body.id;
    await test_utils_1.request.post('/inventory').set((0, test_utils_1.headers)(tenantToken)).send({ productId: products[0].id, branchId, quantity: 10, sellingPrice: 50 });
    await test_utils_1.request.post('/inventory').set((0, test_utils_1.headers)(tenantToken)).send({ productId: products[1].id, branchId, quantity: 10, sellingPrice: 50 });
    console.log('✓ Added 2 products to inventory');
    const p3 = await test_utils_1.request.post('/inventory').set((0, test_utils_1.headers)(tenantToken)).send({ productId: products[2].id, branchId, quantity: 10, sellingPrice: 50 });
    if (p3.status === 403) {
        console.log('✓ Product 3 blocked (Limit enforced)');
        results.push({ scenario: 'Product Limit Enforcement', status: 'PASS' });
    }
    else {
        console.error('✗ Product 3 NOT blocked', p3.status, p3.body);
        results.push({ scenario: 'Product Limit Enforcement', status: 'FAIL' });
    }
    console.log('\n[4.2] Plan Enforcement: Subscription State (PAST_DUE)...');
    await test_utils_1.request.post('/cash-sessions/open').set((0, test_utils_1.headers)(tenantToken)).send({ branchId, openingCash: 1000 });
    console.log('- Cash session opened');
    await test_utils_1.prisma.subscription.upsert({
        where: { tenantId },
        update: { status: 'PAST_DUE' },
        create: {
            tenantId,
            planId,
            status: 'PAST_DUE',
            startDate: new Date(),
        }
    });
    console.log('- Subscription set to PAST_DUE');
    const blockedSale = await test_utils_1.request.post('/sales').set((0, test_utils_1.headers)(tenantToken)).send({
        branchId,
        items: [{ productId: products[0].id, quantity: 1 }],
        paymentMethod: 'CASH'
    });
    if (blockedSale.status === 403) {
        console.log('✓ Sale blocked due to PAST_DUE subscription');
        results.push({ scenario: 'Subscription State Enforcement', status: 'PASS' });
    }
    else {
        console.error('✗ Sale NOT blocked for PAST_DUE', blockedSale.status, blockedSale.body);
        results.push({ scenario: 'Subscription State Enforcement', status: 'FAIL' });
    }
    console.log('\n[4.3] Data Integrity: Financial Balance Audit...');
    await test_utils_1.prisma.subscription.update({
        where: { tenantId },
        data: { status: 'ACTIVE' }
    });
    const coa = [
        { code: accounting_service_1.ACCOUNT_CODES.CASH_ON_HAND, name: 'Cash', type: 'ASSET' },
        { code: accounting_service_1.ACCOUNT_CODES.SALES_REVENUE, name: 'Sales', type: 'REVENUE', isSystem: true },
        { code: accounting_service_1.ACCOUNT_CODES.ACCOUNTS_RECEIVABLE, name: 'AR', type: 'ASSET', isSystem: true },
        { code: accounting_service_1.ACCOUNT_CODES.INVENTORY_ASSET, name: 'Inventory', type: 'ASSET', isSystem: true },
        { code: accounting_service_1.ACCOUNT_CODES.ACCOUNTS_PAYABLE, name: 'AP', type: 'LIABILITY', isSystem: true },
        { code: accounting_service_1.ACCOUNT_CODES.VAT_PAYABLE, name: 'VAT', type: 'LIABILITY', isSystem: true },
        { code: accounting_service_1.ACCOUNT_CODES.COST_OF_GOODS_SOLD, name: 'COGS', type: 'EXPENSE', isSystem: true },
    ];
    for (const a of coa) {
        await test_utils_1.prisma.chartOfAccount.upsert({
            where: { tenantId_code: { tenantId, code: a.code } },
            update: {},
            create: Object.assign(Object.assign({}, a), { tenantId })
        });
    }
    const saleRes = await test_utils_1.request.post('/sales').set((0, test_utils_1.headers)(tenantToken)).send({
        branchId,
        items: [{ productId: products[0].id, quantity: 2 }],
        paymentMethod: 'CASH'
    });
    if (saleRes.status !== 201) {
        console.error('✗ Sale failed for audit test', saleRes.status, saleRes.body);
    }
    const entries = await test_utils_1.prisma.journalEntry.findMany({
        where: { tenantId },
        include: { lines: true }
    });
    let allBalanced = true;
    for (const entry of entries) {
        const totalDr = entry.lines.reduce((sum, l) => sum + Number(l.debit), 0);
        const totalCr = entry.lines.reduce((sum, l) => sum + Number(l.credit), 0);
        if (Math.abs(totalDr - totalCr) > 0.05) {
            console.error(`✗ Unbalanced entry ${entry.reference}: Dr=${totalDr}, Cr=${totalCr}`);
            allBalanced = false;
        }
    }
    if (allBalanced && entries.length > 0) {
        console.log(`✓ All ${entries.length} journal entries are balanced`);
        results.push({ scenario: 'Financial Integrity Audit', status: 'PASS' });
    }
    else {
        results.push({ scenario: 'Financial Integrity Audit', status: 'FAIL' });
    }
    console.log('\n[4.4] Data Integrity: Inventory Reconciliation...');
    const targetInv = await test_utils_1.prisma.inventory.findUnique({
        where: { branchId_productId: { branchId, productId: products[0].id } }
    });
    const ledgerSum = await test_utils_1.prisma.inventoryLedger.aggregate({
        where: { branchId, productId: products[0].id },
        _sum: { quantityChange: true }
    });
    if (targetInv && targetInv.quantity === ledgerSum._sum.quantityChange) {
        console.log(`✓ Inventory reconciled: ${targetInv.quantity} units (Inventory) == ${ledgerSum._sum.quantityChange} (Ledger Sum)`);
        results.push({ scenario: 'Inventory Reconciliation', status: 'PASS' });
    }
    else {
        console.error(`✗ Inventory mismatch! Inventory: ${targetInv === null || targetInv === void 0 ? void 0 : targetInv.quantity}, Ledger Sum: ${ledgerSum._sum.quantityChange}`);
        results.push({ scenario: 'Inventory Reconciliation', status: 'FAIL' });
    }
    console.log('\nPhase 4 Complete');
    console.table(results);
}
runPhase4().catch(console.error);
//# sourceMappingURL=04-integrity-enforcement.js.map