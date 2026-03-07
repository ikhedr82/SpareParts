import { prisma, request, loginAsAdmin, login, headers } from './test-utils';
import { ACCOUNT_CODES } from '../accounting/accounting.service';

async function runPhase4() {
    console.log('--- PHASE 4: PLAN ENFORCEMENT & DATA INTEGRITY ---');
    const results: any[] = [];
    let token: string;

    try {
        token = await loginAsAdmin();
    } catch (error) {
        console.error('✗ Login failed', error);
        return;
    }

    // 1. Plan Enforcement: Limits
    console.log('\n[4.1] Plan Enforcement: Limits (Users, Branches, Products)...');

    const suffix = Date.now().toString().slice(-4);

    // Create a very limited plan
    const planRes = await request.post('/api/platform/plans').set(headers(token)).send({
        name: 'STRICT_PLAN_' + suffix,
        price: 10,
        limits: {
            maxUsers: 2,    // Admin + 1 more
            maxBranches: 1, // Only main branch
            maxProducts: 2  // Only 2 unique products
        },
        features: {
            multiCurrency: true,
            pos: true
        }
    });
    const planId = planRes.body.id;

    // Create tenant with this plan
    const tenantRes = await request.post('/api/platform/tenants').set(headers(token)).send({
        name: 'Strict Tenant ' + suffix,
        subdomain: 'strict-' + suffix,
        planId: planId,
        adminEmail: 'admin-strict' + suffix + '@test.com',
        adminPassword: 'Password123!',
        baseCurrency: 'USD',
        supportedCurrencies: ['USD']
    });
    const tenantId = tenantRes.body.id;
    const tenantToken = await login(tenantRes.body.adminUser.email, 'Password123!');

    // Test Branch Limit (1 allowed)
    const b1 = await request.post('/branches').set(headers(tenantToken)).send({ name: 'Branch 1' });
    if (b1.status === 201) {
        console.log('✓ Branch 1 created');
        const b2 = await request.post('/branches').set(headers(tenantToken)).send({ name: 'Branch 2' });
        if (b2.status === 403) {
            console.log('✓ Branch 2 blocked (Limit enforced)');
            results.push({ scenario: 'Branch Limit Enforcement', status: 'PASS' });
        } else {
            console.error('✗ Branch 2 NOT blocked', b2.status, b2.body);
            results.push({ scenario: 'Branch Limit Enforcement', status: 'FAIL' });
        }
    }

    // Test User Limit (2 allowed)
    const u2 = await request.post('/users').set(headers(tenantToken)).send({
        email: 'user2-' + suffix + '@test.com',
        password: 'Password123!',
        name: 'User Two'
    });
    if (u2.status === 201) {
        console.log('✓ User 2 created');
        const u3 = await request.post('/users').set(headers(tenantToken)).send({
            email: 'user3-' + suffix + '@test.com',
            password: 'Password123!',
            name: 'User Three'
        });
        if (u3.status === 403) {
            console.log('✓ User 3 blocked (Limit enforced)');
            results.push({ scenario: 'User Limit Enforcement', status: 'PASS' });
        } else {
            console.error('✗ User 3 NOT blocked', u3.status, u3.body);
            results.push({ scenario: 'User Limit Enforcement', status: 'FAIL' });
        }
    }

    // Test Product Limit (2 allowed)
    const products = await prisma.product.findMany({ take: 3 });
    const branchId = b1.body.id;

    await request.post('/inventory').set(headers(tenantToken)).send({ productId: products[0].id, branchId, quantity: 10, sellingPrice: 50 });
    await request.post('/inventory').set(headers(tenantToken)).send({ productId: products[1].id, branchId, quantity: 10, sellingPrice: 50 });
    console.log('✓ Added 2 products to inventory');

    const p3 = await request.post('/inventory').set(headers(tenantToken)).send({ productId: products[2].id, branchId, quantity: 10, sellingPrice: 50 });
    if (p3.status === 403) {
        console.log('✓ Product 3 blocked (Limit enforced)');
        results.push({ scenario: 'Product Limit Enforcement', status: 'PASS' });
    } else {
        console.error('✗ Product 3 NOT blocked', p3.status, p3.body);
        results.push({ scenario: 'Product Limit Enforcement', status: 'FAIL' });
    }

    // 2. Plan Enforcement: Subscription State
    console.log('\n[4.2] Plan Enforcement: Subscription State (PAST_DUE)...');

    // Open session first to ensure we don't hit the 400 error
    await request.post('/cash-sessions/open').set(headers(tenantToken)).send({ branchId, openingCash: 1000 });
    console.log('- Cash session opened');

    // Manually upsert subscription to PAST_DUE via Prisma
    await prisma.subscription.upsert({
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

    const blockedSale = await request.post('/sales').set(headers(tenantToken)).send({
        branchId,
        items: [{ productId: products[0].id, quantity: 1 }],
        paymentMethod: 'CASH'
    });

    if (blockedSale.status === 403) {
        console.log('✓ Sale blocked due to PAST_DUE subscription');
        results.push({ scenario: 'Subscription State Enforcement', status: 'PASS' });
    } else {
        console.error('✗ Sale NOT blocked for PAST_DUE', blockedSale.status, blockedSale.body);
        results.push({ scenario: 'Subscription State Enforcement', status: 'FAIL' });
    }

    // 3. Data Integrity: Financial Balance
    console.log('\n[4.3] Data Integrity: Financial Balance Audit...');

    // Reactivate subscription to perform a successful sale for auditing
    await prisma.subscription.update({
        where: { tenantId },
        data: { status: 'ACTIVE' }
    });

    // Seed COA for audit test
    const coa = [
        { code: ACCOUNT_CODES.CASH_ON_HAND, name: 'Cash', type: 'ASSET' as any },
        { code: ACCOUNT_CODES.SALES_REVENUE, name: 'Sales', type: 'REVENUE' as any, isSystem: true },
        { code: ACCOUNT_CODES.ACCOUNTS_RECEIVABLE, name: 'AR', type: 'ASSET' as any, isSystem: true },
        { code: ACCOUNT_CODES.INVENTORY_ASSET, name: 'Inventory', type: 'ASSET' as any, isSystem: true },
        { code: ACCOUNT_CODES.ACCOUNTS_PAYABLE, name: 'AP', type: 'LIABILITY' as any, isSystem: true },
        { code: ACCOUNT_CODES.VAT_PAYABLE, name: 'VAT', type: 'LIABILITY' as any, isSystem: true },
        { code: ACCOUNT_CODES.COST_OF_GOODS_SOLD, name: 'COGS', type: 'EXPENSE' as any, isSystem: true },
    ];
    for (const a of coa) {
        await prisma.chartOfAccount.upsert({
            where: { tenantId_code: { tenantId, code: a.code } },
            update: {},
            create: { ...a, tenantId }
        });
    }

    // Session already open from step 4.2
    const saleRes = await request.post('/sales').set(headers(tenantToken)).send({
        branchId,
        items: [{ productId: products[0].id, quantity: 2 }], // 2 units
        paymentMethod: 'CASH'
    });

    if (saleRes.status !== 201) {
        console.error('✗ Sale failed for audit test', saleRes.status, saleRes.body);
    }

    const entries = await prisma.journalEntry.findMany({
        where: { tenantId },
        include: { lines: true }
    });

    let allBalanced = true;
    for (const entry of entries) {
        const totalDr = entry.lines.reduce((sum, l) => sum + Number(l.debit), 0);
        const totalCr = entry.lines.reduce((sum, l) => sum + Number(l.credit), 0);
        if (Math.abs(totalDr - totalCr) > 0.05) { // Small buffer for precision
            console.error(`✗ Unbalanced entry ${entry.reference}: Dr=${totalDr}, Cr=${totalCr}`);
            allBalanced = false;
        }
    }

    if (allBalanced && entries.length > 0) {
        console.log(`✓ All ${entries.length} journal entries are balanced`);
        results.push({ scenario: 'Financial Integrity Audit', status: 'PASS' });
    } else {
        results.push({ scenario: 'Financial Integrity Audit', status: 'FAIL' });
    }

    // 4. Data Integrity: Inventory Reconciliation
    console.log('\n[4.4] Data Integrity: Inventory Reconciliation...');

    const targetInv = await prisma.inventory.findUnique({
        where: { branchId_productId: { branchId, productId: products[0].id } }
    });

    const ledgerSum = await prisma.inventoryLedger.aggregate({
        where: { branchId, productId: products[0].id },
        _sum: { quantityChange: true }
    });

    if (targetInv && targetInv.quantity === ledgerSum._sum.quantityChange) {
        console.log(`✓ Inventory reconciled: ${targetInv.quantity} units (Inventory) == ${ledgerSum._sum.quantityChange} (Ledger Sum)`);
        results.push({ scenario: 'Inventory Reconciliation', status: 'PASS' });
    } else {
        console.error(`✗ Inventory mismatch! Inventory: ${targetInv?.quantity}, Ledger Sum: ${ledgerSum._sum.quantityChange}`);
        results.push({ scenario: 'Inventory Reconciliation', status: 'FAIL' });
    }

    console.log('\nPhase 4 Complete');
    console.table(results);
}

runPhase4().catch(console.error);
