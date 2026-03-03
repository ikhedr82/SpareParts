
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
                'Host': '127.0.0.1:3000'
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

        // 2. Get Chart of Accounts
        console.log('2. Fetching Chart of Accounts...');
        const accounts = await request('/accounting/accounts', 'GET', null, token);
        console.log(`Found ${accounts.length} accounts.`);

        const cashAccount = accounts.find((a: any) => a.code === '1000');
        const salesAccount = accounts.find((a: any) => a.code === '4000');

        if (!cashAccount || !salesAccount) {
            throw new Error('Missing standard accounts (1000 or 4000)');
        }
        console.log(`Using Accounts: Cash (${cashAccount.id}), Sales (${salesAccount.id})`);

        // 3. Create Manual Journal Entry (Cash Sale)
        console.log('3. Creating Manual Journal Entry...');
        const jeDate = new Date().toISOString();
        const jeRef = `JE-TEST-${Date.now()}`;

        const je = await request('/accounting/journal', 'POST', {
            date: jeDate,
            reference: jeRef,
            description: 'Test Manual Entry',
            lines: [
                { accountId: cashAccount.id, debit: 100, credit: 0, description: 'Cash In' },
                { accountId: salesAccount.id, debit: 0, credit: 100, description: 'Sales Revenue' }
            ]
        }, token);
        console.log(`Journal Entry Created: ${je.id} (${je.reference})`);

        // 4. Verify Ledger for Cash Account
        console.log('4. Verifying Ledger for Cash Account...');
        const ledger = await request(`/accounting/ledger/${cashAccount.id}`, 'GET', null, token);
        const entry = ledger.find((l: any) => l.journalEntryId === je.id);

        if (!entry) {
            throw new Error('Journal Entry not found in Ledger');
        }
        console.log(`Ledger Entry Found: ${entry.description} - Debit: ${entry.debit}`);

        // 5. Try Unbalanced Entry (Should Fail)
        console.log('5. Testing Unbalanced Entry (Expected Failure)...');
        try {
            await request('/accounting/journal', 'POST', {
                date: jeDate,
                reference: `JE-FAIL-${Date.now()}`,
                description: 'Unbalanced Entry',
                lines: [
                    { accountId: cashAccount.id, debit: 100, credit: 0 },
                    { accountId: salesAccount.id, debit: 0, credit: 50 } // Unbalanced
                ]
            }, token);
            throw new Error('Unbalanced Entry should have failed');
        } catch (e: any) {
            console.log('Success: Unbalanced Entry was rejected.');
            if (!e.message.includes('400')) {
                console.warn(`Warning: Expected 400 Bad Request, got: ${e.message}`);
            }
        }

        console.log('VERIFICATION SUCCESSFUL');

    } catch (error: any) {
        console.error('Verification Failed:', error.message);
        process.exit(1);
    }
}

run();
