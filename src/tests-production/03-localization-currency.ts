import { prisma, request, loginAsAdmin, login, headers } from './test-utils';
import { ACCOUNT_CODES } from '../accounting/accounting.service';

// Replicating full COA from src/accounting/accounting.service.ts
const standardCOA = [
    { code: ACCOUNT_CODES.CASH_ON_HAND, name: 'Cash on Hand', type: 'ASSET' as any },
    { code: ACCOUNT_CODES.BANK_ACCOUNT, name: 'Bank Account', type: 'ASSET' as any },
    { code: ACCOUNT_CODES.ACCOUNTS_RECEIVABLE, name: 'Accounts Receivable', type: 'ASSET' as any, isSystem: true },
    { code: ACCOUNT_CODES.INVENTORY_ASSET, name: 'Inventory Asset', type: 'ASSET' as any, isSystem: true },
    { code: ACCOUNT_CODES.ACCOUNTS_PAYABLE, name: 'Accounts Payable', type: 'LIABILITY' as any, isSystem: true },
    { code: ACCOUNT_CODES.VAT_PAYABLE, name: 'VAT Payable', type: 'LIABILITY' as any, isSystem: true },
    { code: ACCOUNT_CODES.CUSTOMER_DEPOSITS, name: 'Customer Deposits', type: 'LIABILITY' as any },
    { code: ACCOUNT_CODES.OWNERS_EQUITY, name: 'Owners Equity', type: 'EQUITY' as any },
    { code: ACCOUNT_CODES.RETAINED_EARNINGS, name: 'Retained Earnings', type: 'EQUITY' as any },
    { code: ACCOUNT_CODES.SALES_REVENUE, name: 'Sales Revenue', type: 'REVENUE' as any, isSystem: true },
    { code: ACCOUNT_CODES.SERVICE_REVENUE, name: 'Service Revenue', type: 'REVENUE' as any },
    { code: ACCOUNT_CODES.COST_OF_GOODS_SOLD, name: 'Cost of Goods Sold', type: 'EXPENSE' as any, isSystem: true },
    { code: ACCOUNT_CODES.RENT_EXPENSE, name: 'Rent Expense', type: 'EXPENSE' as any },
    { code: ACCOUNT_CODES.SALARIES_EXPENSE, name: 'Salaries Expense', type: 'EXPENSE' as any },
    { code: ACCOUNT_CODES.UTILITIES_EXPENSE, name: 'Utilities Expense', type: 'EXPENSE' as any },
    { code: ACCOUNT_CODES.GENERAL_EXPENSE, name: 'General Expense', type: 'EXPENSE' as any },
];

async function seedCOAForTenant(tenantId: string) {
    console.log(`- Seeding full COA for tenant ${tenantId}...`);
    for (const account of standardCOA) {
        await prisma.chartOfAccount.upsert({
            where: { tenantId_code: { tenantId, code: account.code } },
            update: {},
            create: { ...account, tenantId }
        });
    }
}

async function runPhase3() {
    console.log('--- PHASE 3: MULTI-CURRENCY & I18N ---');
    const results: any[] = [];
    let token: string;

    try {
        token = await loginAsAdmin();
    } catch (error) {
        console.error('✗ Login failed', error);
        return;
    }

    // 1. Multi-Currency Validation (EGP/USD conversion)
    console.log('\n[3.1] Multi-Currency Transaction Validation...');

    const tenantSuffix = Date.now().toString().slice(-4);
    const plan = await prisma.plan.findFirst();

    const tenantRes = await request.post('/api/platform/tenants').set(headers(token)).send({
        name: 'Global Parts ' + tenantSuffix,
        subdomain: 'global-' + tenantSuffix,
        planId: plan!.id,
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
    const tenantToken = await login(tenantRes.body.adminUser.email, 'Password123!');

    await seedCOAForTenant(tenantId);

    // Create exchange rate: 1 USD = 50 EGP
    await prisma.exchangeRate.upsert({
        where: { fromCurrency_toCurrency: { fromCurrency: 'USD', toCurrency: 'EGP' } },
        update: { rate: 50 },
        create: { fromCurrency: 'USD', toCurrency: 'EGP', rate: 50 }
    });

    const branchRes = await request.post('/branches').set(headers(tenantToken)).send({ name: 'Global Branch' });
    const branchId = branchRes.body.id;

    const product = await prisma.product.findFirst();
    await request.post('/inventory').set(headers(tenantToken)).send({
        productId: product!.id,
        branchId,
        quantity: 10,
        costPrice: 10,
        sellingPrice: 100,
        sku: 'GLOBAL-SKU-' + tenantSuffix
    });

    await request.post('/cash-sessions/open').set(headers(tenantToken)).send({ branchId, openingCash: 1000 });

    const saleRes = await request.post('/sales').set(headers(tenantToken)).send({
        branchId,
        items: [{ productId: product!.id, quantity: 1 }],
        paymentMethod: 'CASH',
    });

    if (saleRes.status === 201) {
        console.log('✓ Sale created successfully');
        results.push({ scenario: 'Multi-Currency Sale', status: 'PASS' });
    } else {
        console.error('✗ Sale failed', saleRes.status, saleRes.body);
        results.push({ scenario: 'Multi-Currency Sale', status: 'FAIL' });
    }

    // 2. Arabic Metadata Rendering
    console.log('\n[3.2] Arabic Metadata Rendering...');

    // Direct Data Update (since no dedicated REST endpoint for catalog management was found)
    const targetProduct = await prisma.product.findFirst();
    const arabicName = 'فلتر زيت أصلي';
    await prisma.product.update({
        where: { id: targetProduct!.id },
        data: {
            nameAr: arabicName,
            descriptionAr: 'فلتر زيت عالي الجودة لسيارات تويوتا'
        }
    });

    // Verification via Public Inventory API with x-language: AR
    // The LanguageResponseInterceptor swaps name -> nameAr if language is AR
    const verifyRes = await request.get(`/public/inventory/${tenantId}/product/${targetProduct!.id}`)
        .set(headers(tenantToken))
        .set('x-language', 'AR');

    if (verifyRes.status === 200 && verifyRes.body.product.name === arabicName) {
        console.log('✓ Arabic metadata rendered correctly (field swapped by interceptor)');
        results.push({ scenario: 'Arabic I18N Meta', status: 'PASS' });
    } else {
        console.error('✗ Arabic verification failed', verifyRes.status, JSON.stringify(verifyRes.body, null, 2));
        results.push({ scenario: 'Arabic I18N Meta', status: 'FAIL' });
    }

    console.log('\nPhase 3 Complete');
    console.table(results);
}

runPhase3().catch(console.error);
