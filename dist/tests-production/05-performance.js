"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_utils_1 = require("./test-utils");
const accounting_service_1 = require("../accounting/accounting.service");
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function runPhase5() {
    var _a, _b;
    console.log('--- PHASE 5: PERFORMANCE TESTING ---');
    const results = [];
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
    if (planRes.status !== 201) {
        console.error('✗ Plan creation failed', planRes.status, planRes.body);
        return;
    }
    const planId = planRes.body.id;
    const tenantRes = await test_utils_1.request.post('/api/platform/tenants').set((0, test_utils_1.headers)(token)).send({
        name: 'Performance Tenant ' + suffix,
        subdomain: 'perf-' + suffix,
        planId: planId,
        adminEmail: 'admin-perf' + suffix + '@test.com',
        adminPassword: 'Password123!',
        baseCurrency: 'USD',
        supportedCurrencies: ['USD']
    });
    if (tenantRes.status !== 201) {
        console.error('✗ Tenant creation failed', tenantRes.status, tenantRes.body);
        return;
    }
    const tenantId = tenantRes.body.id;
    const tenantToken = await (0, test_utils_1.login)(tenantRes.body.adminUser.email, 'Password123!');
    const branchRes = await test_utils_1.request.post('/branches').set((0, test_utils_1.headers)(tenantToken)).send({ name: 'Performance Branch' });
    if (branchRes.status !== 201)
        return;
    const branchId = branchRes.body.id;
    const products = await test_utils_1.prisma.product.findMany({ take: 2 });
    await test_utils_1.request.post('/inventory').set((0, test_utils_1.headers)(tenantToken)).send({
        productId: products[0].id,
        branchId,
        quantity: 1000,
        sellingPrice: 10
    });
    await test_utils_1.request.post('/inventory').set((0, test_utils_1.headers)(tenantToken)).send({
        productId: products[1].id,
        branchId,
        quantity: 1000,
        sellingPrice: 50
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
    console.log(`\n[5.1] Simulating 100 Concurrent POS Sales (with jitter to manage pool)...`);
    const startTimeSale = Date.now();
    const salePromises = Array.from({ length: 100 }).map(async (_, i) => {
        await sleep(Math.random() * 3000);
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
        console.error(`- Sample Failure: ${(_a = saleResponses.find(r => r.status !== 201 && r.status !== 409)) === null || _a === void 0 ? void 0 : _a.status} ${JSON.stringify((_b = saleResponses.find(r => r.status !== 201 && r.status !== 409)) === null || _b === void 0 ? void 0 : _b.body)}`);
    }
    results.push({ scenario: '100 Concurrent Sales', status: passedSales > 80 ? 'PASS' : 'FAIL', metric: `${passedSales}/100 passed, ${saleDuration}ms` });
    console.log(`\n[5.2] Simulating 50 Concurrent B2B Orders...`);
    const startTimeOrder = Date.now();
    const clientPromises = Array.from({ length: 50 }).map((_, i) => test_utils_1.request.post('/business-clients').set((0, test_utils_1.headers)(tenantToken)).send({
        businessName: `Client ${i}-${suffix}`,
        registrationNumber: `REG-${i}-${suffix}`,
        type: 'RETAILER',
        creditLimit: 10000
    }));
    const clients = await Promise.all(clientPromises);
    const passedClients = clients.filter(c => c.status === 201);
    const cartPromises = passedClients.map(c => test_utils_1.request.post(`/cart/${c.body.id}/items`).set((0, test_utils_1.headers)(tenantToken)).send({
        productId: products[1].id,
        quantity: 1
    }));
    await Promise.all(cartPromises);
    const orderPromises = passedClients.map(c => {
        return test_utils_1.request.post('/orders').set((0, test_utils_1.headers)(tenantToken)).send({
            businessClientId: c.body.id
        });
    });
    const orderResponses = await Promise.all(orderPromises);
    const orderDuration = Date.now() - startTimeOrder;
    const passedOrders = orderResponses.filter(r => r.status === 201).length;
    console.log(`- Completed 50 orders in ${orderDuration}ms`);
    console.log(`- Success: ${passedOrders}`);
    results.push({ scenario: '50 Concurrent Orders', status: passedOrders === 50 ? 'PASS' : 'FAIL', metric: `${passedOrders}/50 passed, ${orderDuration}ms` });
    console.log('\nPhase 5 Complete');
    console.table(results);
}
runPhase5().catch(console.error);
//# sourceMappingURL=05-performance.js.map