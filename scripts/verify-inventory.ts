const API_URL = 'http://127.0.0.1:3000'; // Backend is on 3000 
export { }; // Make this a module
// frontend package.json says "next dev --port 3001".
// backend package.json? I saw it earlier.
// Let's assume 3000 for backend.

const EMAIL = 'admin@alpha.com';
const PASSWORD = 'tenant123';

async function request(url: string, method: string = 'GET', body: any = null, token: string = '') {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options: any = { method, headers };
    if (body) options.body = JSON.stringify(body);

    console.log(`[${method}] ${url}`);
    const res = await fetch(url, options);

    // Handle 204 No Content
    if (res.status === 204) return null;

    const text = await res.text();
    try {
        const data = text ? JSON.parse(text) : null;
        if (!res.ok) throw new Error(`${method} ${url} failed: ${res.status} - ${JSON.stringify(data)}`);
        return data;
    } catch (e) {
        if (!res.ok) throw new Error(`${method} ${url} failed: ${res.status} - ${text}`);
        return text;
    }
}

async function run() {
    try {
        console.log('1. Logging in...');
        const loginData = await request(`${API_URL}/auth/login`, 'POST', {
            email: EMAIL,
            password: PASSWORD
        });
        const token = loginData.accessToken;
        console.log('Logged in.');

        // 2. Get Branch
        console.log('2. Fetching Branches...');
        const branches = await request(`${API_URL}/branches`, 'GET', null, token);
        const branch = branches[0];
        if (!branch) throw new Error('No branch found');
        console.log(`Using Branch: ${branch.name} (${branch.id})`);

        // 3. Create Product
        console.log('3. Creating Product...');
        const unique = Date.now();
        const product = await request(`${API_URL}/products`, 'POST', {
            name: `Test Product ${unique}`,
            description: 'Test Description',
            sellingPrice: 100, // sellingPrice? Check API. usually 'sellingPrice' or 'price'.
            // Inventory DTO uses 'sellingPrice'. Product DTO might differ.
            // Let's assume 'sellingPrice'.
            sku: `TEST-${unique}`,
            categoryId: null, // Optional?
        }, token);
        console.log(`Product Created: ${product.id}`);

        // 4. Create Purchase Order
        console.log('4. Creating Purchase Order...');
        const po = await request(`${API_URL}/purchase-orders`, 'POST', {
            branchId: branch.id,
            supplierName: 'Test Supplier',
            items: [{
                productId: product.id,
                quantity: 10,
                unitCost: 50
            }]
        }, token);
        console.log(`PO Created: ${po.id}`);

        // 5. Receive PO
        console.log('5. Receiving Purchase Order...');
        await request(`${API_URL}/purchase-orders/${po.id}/receive`, 'POST', {}, token);
        console.log('PO Received.');

        // 6. Check Inventory
        console.log('6. Checking Inventory...');
        const inventory = await request(`${API_URL}/inventory?branchId=${branch.id}`, 'GET', null, token);
        const invItem = inventory.find((i: any) => i.productId === product.id);

        console.log(`Inventory: Qty=${invItem?.quantity}, Cost=${invItem?.costPrice}`);
        if (!invItem || invItem.quantity !== 10) throw new Error(`Inventory quantity mismatch. Expected 10, got ${invItem?.quantity}`);

        // 7. Create Sale
        console.log('7. Creating Sale...');
        const sale = await request(`${API_URL}/sales`, 'POST', {
            branchId: branch.id,
            items: [{
                productId: product.id,
                quantity: 2
            }],
            // SalesService create logic requires payment info? 
            // SalesController.create calls salesService.create(userId, dto).
            // DTO usually has items. Payment usually handled via 'payments' endpoint?
            // Or 'sales' endpoint creates Invoice and we assume unpaid?
            // Let's try basic payload.
        }, token);
        console.log(`Sale Created: ${sale.id}`);

        // 8. Check Inventory Again
        console.log('8. Checking Inventory after Sale...');
        const inventory2 = await request(`${API_URL}/inventory?branchId=${branch.id}`, 'GET', null, token);
        const invItem2 = inventory2.find((i: any) => i.productId === product.id);
        console.log(`Inventory: Qty=${invItem2?.quantity}`);
        if (invItem2.quantity !== 8) throw new Error(`Inventory quantity mismatch. Expected 8, got ${invItem2?.quantity}`);

        // 9. Check Ledger
        console.log('9. Checking Ledger...');
        const ledger = await request(`${API_URL}/inventory/ledger?productId=${product.id}&branchId=${branch.id}`, 'GET', null, token);
        console.log(`Ledger Entries: ${ledger.length}`);
        if (ledger.length < 2) throw new Error('Ledger entries missing');

        // 10. Adjust Stock
        console.log('10. Adjusting Stock...');
        await request(`${API_URL}/inventory/adjust`, 'POST', {
            branchId: branch.id,
            productId: product.id,
            quantityChange: -1,
            reason: 'Loss'
        }, token);
        console.log('Stock Adjusted.');

        // 11. Check Valuation
        console.log('11. Checking Valuation...');
        const valuation = await request(`${API_URL}/analytics/valuation?branchId=${branch.id}`, 'GET', null, token);
        console.log('Valuation:', valuation);

        console.log('VERIFICATION SUCCESSFUL');

    } catch (error: any) {
        console.error('Verification Failed:', error.message);
    }
}

run();
