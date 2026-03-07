import { prisma, request, loginAsAdmin, login, headers } from './test-utils';
import { ACCOUNT_CODES } from '../accounting/accounting.service';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runPhase5() {
    console.log('--- PHASE 5: PERFORMANCE TESTING ---');
    const results: any[] = [];
    let token: string;

    try {
        token = await loginAsAdmin();
    } catch (error) {
        console.error('✗ Login failed', error);
        return;
    }

    const suffix = Date.now().toString().slice(-4);

    // Create an UNLIMITED plan
    const planRes = await request.post('/api/platform/plans').set(headers(token)).send({
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

    // Create tenant
    const tenantRes = await request.post('/api/platform/tenants').set(headers(token)).send({
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
    const tenantToken = await login(tenantRes.body.adminUser.email, 'Password123!');

    // Setup Branch and Product with high stock
    const branchRes = await request.post('/branches').set(headers(tenantToken)).send({ name: 'Performance Branch' });
    if (branchRes.status !== 201) return;
    const branchId = branchRes.body.id;

    const products = await prisma.product.findMany({ take: 2 });

    await request.post('/inventory').set(headers(tenantToken)).send({
        productId: products[0].id,
        branchId,
        quantity: 1000,
        sellingPrice: 10
    });

    await request.post('/inventory').set(headers(tenantToken)).send({
        productId: products[1].id,
        branchId,
        quantity: 1000,
        sellingPrice: 50
    });

    await request.post('/cash-sessions/open').set(headers(tenantToken)).send({ branchId, openingCash: 0 });

    // Seed COA
    const coaCodes = [
        ACCOUNT_CODES.CASH_ON_HAND, ACCOUNT_CODES.SALES_REVENUE,
        ACCOUNT_CODES.ACCOUNTS_RECEIVABLE, ACCOUNT_CODES.INVENTORY_ASSET,
        ACCOUNT_CODES.ACCOUNTS_PAYABLE, ACCOUNT_CODES.VAT_PAYABLE,
        ACCOUNT_CODES.COST_OF_GOODS_SOLD
    ];
    for (const code of coaCodes) {
        await prisma.chartOfAccount.upsert({
            where: { tenantId_code: { tenantId, code } },
            update: {},
            create: { code, name: code, type: 'ASSET' as any, tenantId, isSystem: true }
        });
    }

    // 1. Concurrent Sales (100) with Jitter
    console.log(`\n[5.1] Simulating 100 Concurrent POS Sales (with jitter to manage pool)...`);
    const startTimeSale = Date.now();

    const salePromises = Array.from({ length: 100 }).map(async (_, i) => {
        // Add jitter between 0-3000ms to avoid slamming the 9-connection pool
        await sleep(Math.random() * 3000);
        return request.post('/sales').set(headers(tenantToken)).send({
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
        console.error(`- Sample Failure: ${saleResponses.find(r => r.status !== 201 && r.status !== 409)?.status} ${JSON.stringify(saleResponses.find(r => r.status !== 201 && r.status !== 409)?.body)}`);
    }

    results.push({ scenario: '100 Concurrent Sales', status: passedSales > 80 ? 'PASS' : 'FAIL', metric: `${passedSales}/100 passed, ${saleDuration}ms` });

    // 2. Concurrent B2B Orders (50)
    console.log(`\n[5.2] Simulating 50 Concurrent B2B Orders...`);
    const startTimeOrder = Date.now();

    const clientPromises = Array.from({ length: 50 }).map((_, i) =>
        request.post('/business-clients').set(headers(tenantToken)).send({
            businessName: `Client ${i}-${suffix}`,
            registrationNumber: `REG-${i}-${suffix}`,
            type: 'RETAILER',
            creditLimit: 10000
        })
    );
    const clients = await Promise.all(clientPromises);
    const passedClients = clients.filter(c => c.status === 201);

    const cartPromises = passedClients.map(c =>
        request.post(`/cart/${c.body.id}/items`).set(headers(tenantToken)).send({
            productId: products[1].id,
            quantity: 1
        })
    );
    await Promise.all(cartPromises);

    const orderPromises = passedClients.map(c => {
        return request.post('/orders').set(headers(tenantToken)).send({
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
