"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_utils_1 = require("./test-utils");
const accounting_service_1 = require("../accounting/accounting.service");
const standardCOA = [
    { code: accounting_service_1.ACCOUNT_CODES.CASH_ON_HAND, name: 'Cash on Hand', type: 'ASSET' },
    { code: accounting_service_1.ACCOUNT_CODES.BANK_ACCOUNT, name: 'Bank Account', type: 'ASSET' },
    { code: accounting_service_1.ACCOUNT_CODES.ACCOUNTS_RECEIVABLE, name: 'Accounts Receivable', type: 'ASSET', isSystem: true },
    { code: accounting_service_1.ACCOUNT_CODES.INVENTORY_ASSET, name: 'Inventory Asset', type: 'ASSET', isSystem: true },
    { code: accounting_service_1.ACCOUNT_CODES.ACCOUNTS_PAYABLE, name: 'Accounts Payable', type: 'LIABILITY', isSystem: true },
    { code: accounting_service_1.ACCOUNT_CODES.VAT_PAYABLE, name: 'VAT Payable', type: 'LIABILITY', isSystem: true },
    { code: accounting_service_1.ACCOUNT_CODES.CUSTOMER_DEPOSITS, name: 'Customer Deposits', type: 'LIABILITY' },
    { code: accounting_service_1.ACCOUNT_CODES.OWNERS_EQUITY, name: 'Owners Equity', type: 'EQUITY' },
    { code: accounting_service_1.ACCOUNT_CODES.RETAINED_EARNINGS, name: 'Retained Earnings', type: 'EQUITY' },
    { code: accounting_service_1.ACCOUNT_CODES.SALES_REVENUE, name: 'Sales Revenue', type: 'REVENUE', isSystem: true },
    { code: accounting_service_1.ACCOUNT_CODES.SERVICE_REVENUE, name: 'Service Revenue', type: 'REVENUE' },
    { code: accounting_service_1.ACCOUNT_CODES.COST_OF_GOODS_SOLD, name: 'Cost of Goods Sold', type: 'EXPENSE', isSystem: true },
    { code: accounting_service_1.ACCOUNT_CODES.RENT_EXPENSE, name: 'Rent Expense', type: 'EXPENSE' },
    { code: accounting_service_1.ACCOUNT_CODES.SALARIES_EXPENSE, name: 'Salaries Expense', type: 'EXPENSE' },
    { code: accounting_service_1.ACCOUNT_CODES.UTILITIES_EXPENSE, name: 'Utilities Expense', type: 'EXPENSE' },
    { code: accounting_service_1.ACCOUNT_CODES.GENERAL_EXPENSE, name: 'General Expense', type: 'EXPENSE' },
];
async function seedCOAForTenant(tenantId) {
    console.log(`- Seeding full COA for tenant ${tenantId}...`);
    for (const account of standardCOA) {
        await test_utils_1.prisma.chartOfAccount.upsert({
            where: { tenantId_code: { tenantId, code: account.code } },
            update: {},
            create: Object.assign(Object.assign({}, account), { tenantId })
        });
    }
}
async function runPhase3() {
    console.log('--- PHASE 3: MULTI-CURRENCY & I18N ---');
    const results = [];
    let token;
    try {
        token = await (0, test_utils_1.loginAsAdmin)();
    }
    catch (error) {
        console.error('✗ Login failed', error);
        return;
    }
    console.log('\n[3.1] Multi-Currency Transaction Validation...');
    const tenantSuffix = Date.now().toString().slice(-4);
    const plan = await test_utils_1.prisma.plan.findFirst();
    const tenantRes = await test_utils_1.request.post('/api/platform/tenants').set((0, test_utils_1.headers)(token)).send({
        name: 'Global Parts ' + tenantSuffix,
        subdomain: 'global-' + tenantSuffix,
        planId: plan.id,
        adminEmail: 'admin-global' + tenantSuffix + '@test.com',
        adminPassword: 'Password123!',
        baseCurrency: 'USD',
        supportedCurrencies: ['USD', 'EGP']
    });
    if (tenantRes.status !== 201) {
        console.error('✗ Tenant creation failed', tenantRes.body);
        return;
    }
    const tenantId = tenantRes.body.id;
    const tenantToken = await (0, test_utils_1.login)(tenantRes.body.adminUser.email, 'Password123!');
    await seedCOAForTenant(tenantId);
    await test_utils_1.prisma.exchangeRate.upsert({
        where: { fromCurrency_toCurrency: { fromCurrency: 'USD', toCurrency: 'EGP' } },
        update: { rate: 50 },
        create: { fromCurrency: 'USD', toCurrency: 'EGP', rate: 50 }
    });
    const branchRes = await test_utils_1.request.post('/branches').set((0, test_utils_1.headers)(tenantToken)).send({ name: 'Global Branch' });
    const branchId = branchRes.body.id;
    const product = await test_utils_1.prisma.product.findFirst();
    await test_utils_1.request.post('/inventory').set((0, test_utils_1.headers)(tenantToken)).send({
        productId: product.id,
        branchId,
        quantity: 10,
        costPrice: 10,
        sellingPrice: 100,
        sku: 'GLOBAL-SKU-' + tenantSuffix
    });
    await test_utils_1.request.post('/cash-sessions/open').set((0, test_utils_1.headers)(tenantToken)).send({ branchId, openingCash: 1000 });
    const saleRes = await test_utils_1.request.post('/sales').set((0, test_utils_1.headers)(tenantToken)).send({
        branchId,
        items: [{ productId: product.id, quantity: 1 }],
        paymentMethod: 'CASH',
    });
    if (saleRes.status === 201) {
        console.log('✓ Sale created successfully');
        results.push({ scenario: 'Multi-Currency Sale', status: 'PASS' });
    }
    else {
        console.error('✗ Sale failed', saleRes.status, saleRes.body);
        results.push({ scenario: 'Multi-Currency Sale', status: 'FAIL' });
    }
    console.log('\n[3.2] Arabic Metadata Rendering...');
    const targetProduct = await test_utils_1.prisma.product.findFirst();
    const arabicName = 'فلتر زيت أصلي';
    await test_utils_1.prisma.product.update({
        where: { id: targetProduct.id },
        data: {
            nameAr: arabicName,
            descriptionAr: 'فلتر زيت عالي الجودة لسيارات تويوتا'
        }
    });
    const verifyRes = await test_utils_1.request.get(`/public/inventory/${tenantId}/product/${targetProduct.id}`)
        .set((0, test_utils_1.headers)(tenantToken))
        .set('x-language', 'AR');
    if (verifyRes.status === 200 && verifyRes.body.product.name === arabicName) {
        console.log('✓ Arabic metadata rendered correctly (field swapped by interceptor)');
        results.push({ scenario: 'Arabic I18N Meta', status: 'PASS' });
    }
    else {
        console.error('✗ Arabic verification failed', verifyRes.status, JSON.stringify(verifyRes.body, null, 2));
        results.push({ scenario: 'Arabic I18N Meta', status: 'FAIL' });
    }
    console.log('\nPhase 3 Complete');
    console.table(results);
}
runPhase3().catch(console.error);
//# sourceMappingURL=03-localization-currency.js.map