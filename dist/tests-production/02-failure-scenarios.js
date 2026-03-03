"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_utils_1 = require("./test-utils");
const crypto = require("crypto");
const standardCOA = [
    { code: '1000', name: 'Cash on Hand', type: 'ASSET' },
    { code: '1010', name: 'Bank Account', type: 'ASSET' },
    { code: '1100', name: 'Accounts Receivable', type: 'ASSET', isSystem: true },
    { code: '1200', name: 'Inventory Asset', type: 'ASSET', isSystem: true },
    { code: '2000', name: 'Accounts Payable', type: 'LIABILITY', isSystem: true },
    { code: '2100', name: 'VAT Payable', type: 'LIABILITY', isSystem: true },
    { code: '2200', name: 'Customer Deposits', type: 'LIABILITY' },
    { code: '3000', name: 'Owners Equity', type: 'EQUITY' },
    { code: '3100', name: 'Retained Earnings', type: 'EQUITY' },
    { code: '4000', name: 'Sales Revenue', type: 'REVENUE', isSystem: true },
    { code: '4100', name: 'Service Revenue', type: 'REVENUE' },
    { code: '5000', name: 'Cost of Goods Sold', type: 'EXPENSE', isSystem: true },
    { code: '5100', name: 'Rent Expense', type: 'EXPENSE' },
    { code: '5200', name: 'Salaries Expense', type: 'EXPENSE' },
    { code: '5300', name: 'Utilities Expense', type: 'EXPENSE' },
    { code: '5400', name: 'General Expense', type: 'EXPENSE' },
];
async function seedCOAForTenant(tenantId) {
    console.log(`- Seeding COA for tenant ${tenantId}...`);
    for (const account of standardCOA) {
        await test_utils_1.prisma.chartOfAccount.upsert({
            where: { tenantId_code: { tenantId, code: account.code } },
            update: {},
            create: Object.assign(Object.assign({}, account), { tenantId })
        });
    }
}
async function runPhase2() {
    var _a;
    console.log('--- PHASE 2: FAILURE SCENARIOS ---');
    const results = [];
    let token;
    try {
        token = await (0, test_utils_1.loginAsAdmin)();
    }
    catch (error) {
        console.error('✗ Login failed', error);
        return;
    }
    console.log('\n[2.1] Simulating Webhook Duplication...');
    const eventId = 'evt_test_' + Date.now();
    const webhookPayload = {
        id: eventId,
        type: 'invoice.payment_succeeded',
        data: {
            object: {
                id: 'in_test_' + Date.now(),
                customer: 'cus_test',
                amount_paid: 1000,
                currency: 'usd',
                status: 'paid',
                subscription: 'sub_test'
            }
        }
    };
    const payloadString = JSON.stringify(webhookPayload);
    const timestamp = Math.floor(Date.now() / 1000);
    const secret = 'whsec_placeholder';
    const signature = crypto.createHmac('sha256', secret).update(`${timestamp}.${payloadString}`).digest('hex');
    const stripeSignature = `t=${timestamp},v1=${signature}`;
    const sendWebhook = () => test_utils_1.request
        .post('/api/webhooks/stripe')
        .set('stripe-signature', stripeSignature)
        .set('Idempotency-Key', 'webhook-key-' + eventId)
        .send(webhookPayload);
    const webhookRes1 = await sendWebhook();
    const webhookRes2 = await sendWebhook();
    if (webhookRes1.status === 200 || webhookRes1.status === 201) {
        if (webhookRes2.status === 200 || webhookRes2.status === 201) {
            console.log('✓ Webhook duplication handled (idempotent)');
            results.push({ scenario: 'Webhook Duplication', status: 'PASS' });
        }
        else {
            console.error('✗ Webhook duplication failed', webhookRes2.status, webhookRes2.body);
            results.push({ scenario: 'Webhook Duplication', status: 'FAIL' });
        }
    }
    else {
        console.error('✗ Webhook failed first attempt', webhookRes1.status, JSON.stringify(webhookRes1.body));
        results.push({ scenario: 'Webhook Duplication', status: 'FAIL' });
    }
    console.log('\n[2.2] Inventory Race Condition (Concurrent Sales)...');
    const plan = await test_utils_1.prisma.plan.findFirst();
    const tenantSuffix = Date.now().toString().slice(-4);
    const tenantRes = await test_utils_1.request.post('/api/platform/tenants').set((0, test_utils_1.headers)(token)).send({
        name: 'Race Corp ' + tenantSuffix,
        subdomain: 'race-' + tenantSuffix,
        planId: plan.id,
        adminEmail: 'admin-race' + tenantSuffix + '@test.com',
        adminPassword: 'Password123!'
    });
    if (tenantRes.status !== 201) {
        console.error('✗ Tenant creation failed', tenantRes.body);
        return;
    }
    const tenantId = tenantRes.body.id;
    await seedCOAForTenant(tenantId);
    const tenantToken = await (0, test_utils_1.login)(tenantRes.body.adminUser.email, 'Password123!');
    const branchRes = await test_utils_1.request.post('/branches').set((0, test_utils_1.headers)(tenantToken)).send({ name: 'Race Branch' });
    const branchId = branchRes.body.id;
    await test_utils_1.request.post('/cash-sessions/open').set((0, test_utils_1.headers)(tenantToken)).send({ branchId, openingCash: 100 });
    const product = await test_utils_1.prisma.product.findFirst();
    await test_utils_1.request.post('/inventory').set((0, test_utils_1.headers)(tenantToken)).send({
        productId: product.id,
        branchId,
        quantity: 5,
        costPrice: 10,
        sellingPrice: 100,
        sku: 'SKU-' + tenantSuffix
    });
    console.log(`- Stock initialized to 5 for product ${product.id}`);
    const saleData = {
        branchId,
        items: [{ productId: product.id, quantity: 2, unitPrice: 100 }],
        paymentMethod: 'CASH'
    };
    const sales = await Promise.all([
        test_utils_1.request.post('/sales').set((0, test_utils_1.headers)(tenantToken, 'race-1-' + tenantSuffix)).send(saleData),
        test_utils_1.request.post('/sales').set((0, test_utils_1.headers)(tenantToken, 'race-2-' + tenantSuffix)).send(saleData),
        test_utils_1.request.post('/sales').set((0, test_utils_1.headers)(tenantToken, 'race-3-' + tenantSuffix)).send(saleData)
    ]);
    const successes = sales.filter(s => s.status === 201).length;
    const failures = sales.filter(s => s.status !== 201);
    console.log(`- Successes: ${successes}, Failures: ${failures.length}`);
    const finalInv = await test_utils_1.prisma.inventory.findUnique({
        where: { branchId_productId: { branchId, productId: product.id } }
    });
    console.log(`- Final Stock level: ${finalInv === null || finalInv === void 0 ? void 0 : finalInv.quantity}`);
    if (successes <= 2 && ((_a = finalInv === null || finalInv === void 0 ? void 0 : finalInv.quantity) !== null && _a !== void 0 ? _a : 0) >= 0) {
        console.log('✓ Inventory race condition handled');
        results.push({ scenario: 'Inventory Race Condition', status: 'PASS' });
    }
    else {
        console.error('✗ Inventory over-sold!', { successes, finalStock: finalInv === null || finalInv === void 0 ? void 0 : finalInv.quantity });
        results.push({ scenario: 'Inventory Race Condition', status: 'FAIL' });
    }
    console.log('\n[2.3] Concurrent Updates (Optimistic Locking)...');
    const clientRes = await test_utils_1.request.post('/business-clients').set((0, test_utils_1.headers)(tenantToken)).send({
        businessName: 'B2B Client ' + tenantSuffix,
        primaryEmail: 'b2b-' + tenantSuffix + '@test.com',
        type: 'RETAILER',
        creditLimit: 1000
    });
    if (clientRes.status !== 201) {
        console.error('✗ BusinessClient creation failed', clientRes.status, clientRes.body);
        return;
    }
    const clientId = clientRes.body.id;
    await test_utils_1.request.post(`/cart/${clientId}/items`).set((0, test_utils_1.headers)(tenantToken)).send({
        productId: product.id,
        quantity: 1
    });
    const orderRes = await test_utils_1.request.post('/orders').set((0, test_utils_1.headers)(tenantToken)).send({
        businessClientId: clientId,
        branchId,
        notes: 'Test order for concurrency'
    });
    if (orderRes.status !== 201) {
        console.error('✗ Order creation failed', orderRes.status, orderRes.body);
        return;
    }
    const orderId = orderRes.body.id;
    const initialVersion = orderRes.body.version;
    console.log(`- Order created with ID ${orderId}, version ${initialVersion}`);
    const update1 = test_utils_1.request.patch(`/orders/${orderId}/status`).set((0, test_utils_1.headers)(tenantToken, 'ord-upd-1-' + tenantSuffix)).send({
        status: 'CONFIRMED',
        expectedVersion: initialVersion
    });
    const update2 = test_utils_1.request.patch(`/orders/${orderId}/status`).set((0, test_utils_1.headers)(tenantToken, 'ord-upd-2-' + tenantSuffix)).send({
        status: 'CONFIRMED',
        expectedVersion: initialVersion
    });
    const updResults = await Promise.all([update1, update2]);
    updResults.forEach((r, i) => {
        console.log(`- Update ${i + 1} Status: ${r.status}, Body: ${JSON.stringify(r.body)}`);
    });
    const successCount = updResults.filter(r => r.status === 200 || r.status === 201).length;
    const conflictCount = updResults.filter(r => r.status === 409).length;
    console.log(`- Successes: ${successCount}, Conflicts (409): ${conflictCount}`);
    if (successCount === 1 && conflictCount === 1) {
        console.log('✓ Concurrent updates handled via optimistic locking');
        results.push({ scenario: 'Concurrent Updates', status: 'PASS' });
    }
    else {
        console.warn('! Concurrency test outcome unexpected', { successCount, conflictCount });
        results.push({ scenario: 'Concurrent Updates', status: 'FAIL' });
    }
    console.log('\nPhase 2 Complete');
    console.table(results);
}
runPhase2().catch(console.error);
//# sourceMappingURL=02-failure-scenarios.js.map