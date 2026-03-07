import { prisma, request, loginAsAdmin, login, headers, API_URL } from './test-utils';

async function runPhase1() {
    console.log('--- PHASE 1: E2E BUSINESS SCENARIOS ---');
    const results: any[] = [];
    let token: string;

    try {
        token = await loginAsAdmin();
        console.log('✓ Logged in as platform admin');
    } catch (error) {
        console.error('✗ Login failed', error);
        return;
    }

    const plan = await prisma.plan.findFirst();
    if (!plan) {
        console.error('✗ No plans found in database');
        return;
    }
    console.log(`✓ Using plan: ${plan.name} (${plan.id})`);

    const testTenant = {
        name: 'Production Test Corp',
        subdomain: 'prod-test-' + Date.now().toString().slice(-4),
        planId: plan.id,
        adminEmail: 'admin-' + Date.now().toString().slice(-4) + '@prod-test.com',
        adminPassword: 'Password123!',
        defaultLanguage: 'EN',
        baseCurrency: 'USD'
    };

    // 1. Tenant Lifecycle
    console.log('\n[1.1] Creating Tenant...');
    const createTenantRes = await request
        .post('/api/platform/tenants')
        .set(headers(token))
        .send({
            name: testTenant.name,
            subdomain: testTenant.subdomain,
            planId: plan.id,
            baseCurrency: 'USD',
            supportedCurrencies: ['USD', 'EGP', 'EUR'],
            adminEmail: testTenant.adminEmail,
            adminPassword: testTenant.adminPassword
        });

    if (createTenantRes.status === 201) {
        console.log('✓ Tenant created successfully');
        results.push({ scenario: 'Create Tenant', status: 'PASS' });
    } else {
        console.error('✗ Failed to create tenant', createTenantRes.body);
        results.push({ scenario: 'Create Tenant', status: 'FAIL', error: createTenantRes.body });
        return; // Stop if core failed
    }

    const tenantId = createTenantRes.body.id;

    // Login as the new tenant admin
    let tenantToken: string;
    try {
        tenantToken = await login(testTenant.adminEmail, testTenant.adminPassword);
        console.log('✓ Logged in as tenant admin');
    } catch (error) {
        console.error('✗ Tenant login failed', error);
        return;
    }

    // [1.2] Create Default Branch
    console.log('[1.2] Creating Branch...');
    const createBranchRes = await request
        .post('/branches')
        .set(headers(tenantToken))
        .send({
            name: 'Main Branch',
            location: 'Cairo, Egypt',
            isMain: true
        });

    let branchId: string;
    if (createBranchRes.status === 201) {
        console.log('✓ Branch created');
        results.push({ scenario: 'Create Branch', status: 'PASS' });
        branchId = createBranchRes.body.id;
    } else {
        console.error('✗ Failed to create branch', createBranchRes.body);
        results.push({ scenario: 'Create Branch', status: 'FAIL', error: createBranchRes.body });
        return;
    }

    // 2. Commerce Flow
    console.log('\n[2.1] Adding Product & Inventory (for the new tenant)...');

    // Get a product ID for testing (e.g. from catalog)
    const product = await prisma.product.findFirst();
    if (!product) {
        console.warn('! No products found in catalog, skipping inventory test');
    } else {
        const addInventoryRes = await request
            .post('/inventory')
            .set(headers(tenantToken))
            .send({
                productId: product.id,
                branchId: branchId,
                quantity: 100,
                minStock: 10,
                costPrice: 50,
                sellingPrice: 150,
                sku: 'TEST-SKU-001-' + Date.now().toString().slice(-4)
            });

        if (addInventoryRes.status === 201) {
            console.log('✓ Inventory added');
            results.push({ scenario: 'Add Inventory', status: 'PASS' });
        } else {
            console.error('✗ Failed to add inventory', addInventoryRes.body);
            results.push({ scenario: 'Add Inventory', status: 'FAIL', error: addInventoryRes.body });
        }

        // Create Sale
        console.log('[2.2] Creating Sale...');
        const createSaleRes = await request
            .post('/sales')
            .set(headers(tenantToken))
            .send({
                branchId: branchId,
                items: [{ productId: product.id, quantity: 2, unitPrice: 150 }],
                total: 300,
                paymentMethod: 'CASH',
                customerId: null
            });

        if (createSaleRes.status === 201) {
            console.log('✓ Sale created');
            results.push({ scenario: 'Create Sale', status: 'PASS' });
        } else {
            console.error('✗ Failed to create sale', createSaleRes.body);
            results.push({ scenario: 'Create Sale', status: 'FAIL', error: createSaleRes.body });
        }
    }

    // 3. Procurement Flow
    console.log('\n[3.1] Creating Purchase Order...');

    // Create a dummy supplier
    const createSupplierRes = await request
        .post('/suppliers')
        .set(headers(tenantToken))
        .send({
            name: 'Test Supplier',
            email: 'supplier-' + Date.now().toString().slice(-4) + '@test.com'
        });

    if (createSupplierRes.status === 201) {
        const supplierId = createSupplierRes.body.id;
        console.log('✓ Supplier created');

        if (product && branchId) {
            const poRes = await request
                .post('/purchase-orders')
                .set(headers(tenantToken))
                .send({
                    supplierId,
                    branchId: branchId,
                    items: [{ productId: product.id, quantity: 20, unitCost: 45 }],
                    totalAmount: 900
                });

            if (poRes.status === 201) {
                console.log('✓ PO created');
                results.push({ scenario: 'Create PO', status: 'PASS' });

                // Receive stock
                console.log('[3.2] Receiving PO stock...');
                const receiveRes = await request
                    .post(`/purchase-orders/${poRes.body.id}/receive`)
                    .set(headers(tenantToken))
                    .send({
                        items: [{ productId: product.id, quantity: 20 }],
                        freightCost: 0
                    });

                if (receiveRes.status === 201 || receiveRes.status === 200) {
                    console.log('✓ Stock received');
                    results.push({ scenario: 'Receive PO stock', status: 'PASS' });
                } else {
                    console.error('✗ Failed to receive PO stock', receiveRes.body);
                    results.push({ scenario: 'Receive PO stock', status: 'FAIL', error: receiveRes.body });
                }
            } else {
                console.error('✗ Failed to create PO', poRes.body);
                results.push({ scenario: 'Create PO', status: 'FAIL', error: poRes.body });
            }
        }
    } else {
        console.error('✗ Failed to create supplier', createSupplierRes.body);
        results.push({ scenario: 'Create Supplier', status: 'FAIL', error: createSupplierRes.body });
    }

    console.log('\nPhase 1 Complete');
    console.table(results);
}

runPhase1().catch(console.error);
