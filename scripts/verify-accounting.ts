
import * as http from 'http';

const EMAIL = 'admin@alpha.com';
const PASSWORD = 'tenant123';

function request(path: string, method: string = 'GET', body: any = null, token: string = ''): Promise<any> {
    return new Promise((resolve, reject) => {
        const options: any = {
            hostname: '127.0.0.1',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Host': '127.0.0.1:3000' // Explicit Host
            }
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        console.log(`[${method}] http://127.0.0.1:3000${path}`);

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode && res.statusCode >= 400) {
                    reject(new Error(`${method} ${path} failed: ${res.statusCode} - ${data}`));
                } else {
                    if (res.statusCode === 204) resolve(null);
                    else {
                        try {
                            resolve(data ? JSON.parse(data) : null);
                        } catch (e) {
                            resolve(data);
                        }
                    }
                }
            });
        });

        req.on('error', (e) => reject(new Error(`Network Error: ${e.message}`)));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function run() {
    try {
        console.log('1. Logging in...');
        const loginData = await request('/auth/login', 'POST', {
            email: EMAIL,
            password: PASSWORD
        });
        const token = loginData.accessToken;
        console.log('Logged in.');

        // 2. Get Branch
        console.log('2. Fetching Branches...');
        const branches = await request('/branches', 'GET', null, token);
        const branch = branches[0];
        if (!branch) throw new Error('No branch found');
        console.log(`Using Branch: ${branch.name} (${branch.id})`);

        // 3. Create Tax Rate
        console.log('3. Creating Tax Rate...');
        const taxName = `VAT-${Date.now()}`;
        const tax = await request('/taxes', 'POST', {
            name: taxName,
            percentage: 20
        }, token);
        console.log(`Tax Rate Created: ${tax.name} (${tax.percentage}%)`);

        // 4. Create Customer
        console.log('4. Creating Customer...');
        const customer = await request('/customers', 'POST', {
            name: `Customer-${Date.now()}`,
            email: `cust-${Date.now()}@example.com`,
            phone: '1234567890'
        }, token);
        console.log(`Customer Created: ${customer.name} (Balance: ${customer.balance})`);

        // 5. Create Supplier
        console.log('5. Creating Supplier...');
        const supplier = await request('/suppliers', 'POST', {
            name: `Supplier-${Date.now()}`,
        }, token);
        console.log(`Supplier Created: ${supplier.name} (Balance: ${supplier.balance})`);

        // 6. Create Product with Tax Rate
        console.log('6. Creating Product linked to Tax Rate...');
        const product = await request('/products', 'POST', {
            name: `Product-${Date.now()}`,
            description: 'Taxable Product',
            sellingPrice: 100,
            sku: `SKU-${Date.now()}`,
            taxRateId: tax.id
        }, token);
        console.log(`Product Created: ${product.name}`);

        // 7. Purchase Order (Increase Stock)
        console.log('7. Creating Purchase Order linked to Supplier...');
        const po = await request('/purchase-orders', 'POST', {
            branchId: branch.id,
            supplierName: supplier.name,
            supplierId: supplier.id,
            items: [{
                productId: product.id,
                quantity: 10,
                unitCost: 50
            }]
        }, token);
        console.log(`PO Created: ${po.id}`);

        // 8. Receive PO
        console.log('8. Receiving PO...');
        await request(`/purchase-orders/${po.id}/receive`, 'POST', {}, token);
        console.log('PO Received.');

        // 9. Verify Supplier Balance
        console.log('9. Verifying Supplier Balance...');
        const updatedSupplier = await request(`/suppliers/${supplier.id}`, 'GET', null, token);
        const expectedBalance = 50 * 10; // 500
        console.log(`Supplier Balance: ${updatedSupplier.balance}`);
        if (Number(updatedSupplier.balance) !== expectedBalance) {
            throw new Error(`Supplier Balance mismatch. Expected ${expectedBalance}, got ${updatedSupplier.balance}`);
        }

        // 10. Check/Open Cash Session
        try {
            await request('/cash-sessions/open', 'POST', { branchId: branch.id, openingBalance: 100 }, token);
            console.log('Opened Cash Session.');
        } catch (e: any) {
            console.log('Cash Session likely open.');
        }

        // 11. Create Sale (Account Sale to Customer) - Will trigger Tax calculation
        console.log('11. Creating Sale for Customer...');
        const sale = await request('/sales', 'POST', {
            branchId: branch.id,
            customerId: customer.id,
            customerName: customer.name,
            items: [{
                productId: product.id,
                quantity: 2
            }]
        }, token);
        console.log(`Sale Created: ${sale.id}, Total: ${sale.total}`);

        // Expected: 2 * 100 = 200. Tax 20% = 40. Total 240.
        const expectedTotal = 240;
        if (Number(sale.total) !== expectedTotal) {
            throw new Error(`Sale Total mismatch. Expected ${expectedTotal}, got ${sale.total}`);
        }

        // 12. Verify Customer Balance
        console.log('12. Verifying Customer Balance...');
        const updatedCustomer = await request(`/customers/${customer.id}`, 'GET', null, token);
        console.log(`Customer Balance: ${updatedCustomer.balance}`);

        // Wait, did Sale update balance?
        // Implementation Plan said SalesService.create updates balance (Debit).
        // Let's assume it does.
        if (Number(updatedCustomer.balance) !== expectedTotal) {
            throw new Error(`Customer Balance mismatch. Expected ${expectedTotal}, got ${updatedCustomer.balance}`);
        }

        // 13. Verify Invoice
        console.log('13. Verifying Invoice...');
        const invoices = await request('/invoices', 'GET', null, token);
        const invoice = invoices.find((inv: any) => inv.saleId === sale.id);
        if (!invoice) throw new Error('Invoice not generated for sale');
        console.log(`Invoice found: ${invoice.invoiceNumber}, Status: ${invoice.status}`);

        // 14. Make Payment
        console.log('14. Making Payment...');
        // Need Session ID
        const sessions = await request(`/cash-sessions?status=OPEN&branchId=${branch.id}`, 'GET', null, token);
        const sessionId = sessions[0]?.id;
        if (!sessionId) throw new Error('No open session found');

        const payment = await request('/payments', 'POST', {
            saleId: sale.id,
            amount: 140, // Partial
            method: 'CASH',
            sessionId: sessionId
        }, token);
        console.log(`Payment made: ${payment.amount}`);

        // 15. Verify Customer Balance Reduced
        console.log('15. Verifying Customer Balance Reduced...');
        const customerAfterPayment = await request(`/customers/${customer.id}`, 'GET', null, token);
        const expectedBalanceAfter = 240 - 140; // 100
        console.log(`Customer Balance: ${customerAfterPayment.balance}`);
        if (Number(customerAfterPayment.balance) !== expectedBalanceAfter) {
            throw new Error(`Customer Balance mismatch. Expected ${expectedBalanceAfter}, got ${customerAfterPayment.balance}`);
        }

        console.log('VERIFICATION SUCCESSFUL');

    } catch (error: any) {
        console.error('Verification Failed:', error.message);
        process.exit(1);
    }
}

run();
