import { prisma, request, loginAsAdmin, login, headers } from './test-utils';
import { ACCOUNT_CODES } from '../accounting/accounting.service';

async function runPhase5_SalesOnly() {
    console.log('--- PHASE 5: PERFORMANCE TESTING (SALES ONLY) ---');
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

    if (planRes.status !== 201) return;
    const planId = planRes.body.id;

    // Create tenant
    const tenantRes = await request.post('/api/platform/tenants').set(headers(token)).send({
        name: 'Perf Tenant Sales ' + suffix,
        subdomain: 'perfs-' + suffix,
        planId: planId,
        adminEmail: 'admin-perfs' + suffix + '@test.com',
        adminPassword: 'Password123!',
        baseCurrency: 'USD',
        supportedCurrencies: ['USD']
    });

    if (tenantRes.status !== 201) return;
    const tenantId = tenantRes.body.id;
    const tenantToken = await login(tenantRes.body.adminUser.email, 'Password123!');

    // Setup Branch and Product with high stock
    const branchRes = await request.post('/branches').set(headers(tenantToken)).send({ name: 'Perf Branch' });
    const branchId = branchRes.body.id;

    const products = await prisma.product.findMany({ take: 1 });

    await request.post('/inventory').set(headers(tenantToken)).send({
        productId: products[0].id,
        branchId,
        quantity: 1000,
        sellingPrice: 10
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

    // 1. Concurrent Sales (100)
    console.log(`\n[5.1] Simulating 100 Concurrent POS Sales...`);
    const startTimeSale = Date.now();

    const salePromises = Array.from({ length: 100 }).map(() => {
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
        const sample = saleResponses.find(r => r.status !== 201 && r.status !== 409);
        console.error(`- Sample Failure: ${sample?.status} ${JSON.stringify(sample?.body)}`);
    }

    console.log('\nSales Performance Test Complete');
}

runPhase5_SalesOnly().catch(console.error);
