"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_utils_1 = require("./test-utils");
const accounting_service_1 = require("../accounting/accounting.service");
async function runPhase5_SalesOnly() {
    console.log('--- PHASE 5: PERFORMANCE TESTING (SALES ONLY) ---');
    let token;
    try {
        token = await (0, test_utils_1.loginAsAdmin)();
    }
    catch (error) {
        console.error('✗ Login failed', error);
        return;
    }
    const suffix = Date.now().toString().slice(-4);
    const planRes = await test_utils_1.request.post('/api/platform/plans').set((0, test_utils_1.headers)(token)).send({
        name: 'UNLIMITED_PLAN_' + suffix,
        price: 999,
        limits: {
            maxUsers: -1,
            maxBranches: -1,
            maxProducts: -1
        },
        features: {
            multiCurrency: true,
            pos: true,
            b2b: true,
            ecommerce: true
        }
    });
    if (planRes.status !== 201)
        return;
    const planId = planRes.body.id;
    const tenantRes = await test_utils_1.request.post('/api/platform/tenants').set((0, test_utils_1.headers)(token)).send({
        name: 'Perf Tenant Sales ' + suffix,
        subdomain: 'perfs-' + suffix,
        planId: planId,
        adminEmail: 'admin-perfs' + suffix + '@test.com',
        adminPassword: 'Password123!',
        baseCurrency: 'USD',
        supportedCurrencies: ['USD']
    });
    if (tenantRes.status !== 201)
        return;
    const tenantId = tenantRes.body.id;
    const tenantToken = await (0, test_utils_1.login)(tenantRes.body.adminUser.email, 'Password123!');
    const branchRes = await test_utils_1.request.post('/branches').set((0, test_utils_1.headers)(tenantToken)).send({ name: 'Perf Branch' });
    const branchId = branchRes.body.id;
    const products = await test_utils_1.prisma.product.findMany({ take: 1 });
    await test_utils_1.request.post('/inventory').set((0, test_utils_1.headers)(tenantToken)).send({
        productId: products[0].id,
        branchId,
        quantity: 1000,
        sellingPrice: 10
    });
    await test_utils_1.request.post('/cash-sessions/open').set((0, test_utils_1.headers)(tenantToken)).send({ branchId, openingCash: 0 });
    const coaCodes = [
        accounting_service_1.ACCOUNT_CODES.CASH_ON_HAND, accounting_service_1.ACCOUNT_CODES.SALES_REVENUE,
        accounting_service_1.ACCOUNT_CODES.ACCOUNTS_RECEIVABLE, accounting_service_1.ACCOUNT_CODES.INVENTORY_ASSET,
        accounting_service_1.ACCOUNT_CODES.ACCOUNTS_PAYABLE, accounting_service_1.ACCOUNT_CODES.VAT_PAYABLE,
        accounting_service_1.ACCOUNT_CODES.COST_OF_GOODS_SOLD
    ];
    for (const code of coaCodes) {
        await test_utils_1.prisma.chartOfAccount.upsert({
            where: { tenantId_code: { tenantId, code } },
            update: {},
            create: { code, name: code, type: 'ASSET', tenantId, isSystem: true }
        });
    }
    console.log(`\n[5.1] Simulating 100 Concurrent POS Sales...`);
    const startTimeSale = Date.now();
    const salePromises = Array.from({ length: 100 }).map(() => {
        return test_utils_1.request.post('/sales').set((0, test_utils_1.headers)(tenantToken)).send({
            branchId,
            items: [{ productId: products[0].id, quantity: 1 }],
            paymentMethod: 'CASH'
        });
    });
    const saleResponses = await Promise.all(salePromises);
    const saleDuration = Date.now() - startTimeSale;
    const passedSales = saleResponses.filter(r => r.status === 201).length;
    const failed409 = saleResponses.filter(r => r.status === 409).length;
    const failedOther = saleResponses.filter(r => r.status !== 201 && r.status !== 409).length;
    console.log(`- Completed 100 sales in ${saleDuration}ms`);
    console.log(`- Success: ${passedSales}, Conflicts (409): ${failed409}, Other Failed: ${failedOther}`);
    if (failedOther > 0) {
        const sample = saleResponses.find(r => r.status !== 201 && r.status !== 409);
        console.error(`- Sample Failure: ${sample === null || sample === void 0 ? void 0 : sample.status} ${JSON.stringify(sample === null || sample === void 0 ? void 0 : sample.body)}`);
    }
    console.log('\nSales Performance Test Complete');
}
runPhase5_SalesOnly().catch(console.error);
//# sourceMappingURL=05-performance-sales.js.map